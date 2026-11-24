use axum::{
    extract::State,
    http::{header, HeaderMap, StatusCode},
    response::IntoResponse,
    routing::{get, post, put},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::{collections::HashSet, env, net::SocketAddr, path::PathBuf, sync::Arc, time::Duration};
use tokio::sync::Mutex;
use tower_http::cors::{Any, CorsLayer};

#[derive(Clone, Serialize, Deserialize)]
struct Product {
    code: String,
    name: String,
    details: String,
    price: String,
    note: String,
    symbol: String,
    #[serde(default = "unknown_availability")]
    availability: String,
}
fn unknown_availability() -> String { "unknown".to_string() }

#[derive(Clone, Serialize, Deserialize)]
struct Category {
    slug: String,
    title: String,
    index: String,
    description: String,
    products: Vec<Product>,
}
#[derive(Clone, Serialize, Deserialize)]
struct Catalog { categories: Vec<Category> }

#[derive(Clone)]
struct AppState {
    catalog: Arc<Mutex<Catalog>>,
    admin_token: Arc<String>,
    catalog_path: Arc<PathBuf>,
}
#[derive(Deserialize)]
struct LoginRequest { token: String }

/// Compares two secrets without stopping at the first different byte,
/// so the response time does not reveal how much of a guess was correct.
fn tokens_match(given: &str, expected: &str) -> bool {
    let (given, expected) = (given.as_bytes(), expected.as_bytes());
    let mut diff = given.len() ^ expected.len();
    for i in 0..given.len().max(expected.len()) {
        let a = given.get(i).copied().unwrap_or(0);
        let b = expected.get(i).copied().unwrap_or(0);
        diff |= (a ^ b) as usize;
    }
    diff == 0
}

fn authorized(headers: &HeaderMap, state: &AppState) -> bool {
    headers
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|v| v.strip_prefix("Bearer "))
        .is_some_and(|given| tokens_match(given, state.admin_token.as_str()))
}

/// A slug is used in URLs (`/catalog/<slug>/`), so only a-z, 0-9 and `-` are allowed.
fn is_valid_slug(slug: &str) -> bool {
    !slug.is_empty()
        && slug.len() <= 64
        && slug.bytes().all(|b| b.is_ascii_lowercase() || b.is_ascii_digit() || b == b'-')
}

fn catalog_is_valid(catalog: &Catalog) -> bool {
    if catalog.categories.is_empty() {
        return false;
    }
    let mut seen_slugs = HashSet::new();
    catalog.categories.iter().all(|category| {
        is_valid_slug(&category.slug)
            && seen_slugs.insert(category.slug.as_str())
            && !category.title.trim().is_empty()
            && category.products.iter().all(|product| {
                !product.name.trim().is_empty()
                    && !product.price.trim().is_empty()
                    && ["unknown", "in_stock", "out_of_stock"].contains(&product.availability.as_str())
            })
    })
}

/// Slows down password guessing: every failed attempt costs half a second.
async fn failed_attempt_delay() {
    tokio::time::sleep(Duration::from_millis(500)).await;
}

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({"service":"pospolite-api","status":"ok"}))
}

async fn get_catalog(State(state): State<AppState>) -> Json<Catalog> {
    Json(state.catalog.lock().await.clone())
}

async fn login(State(state): State<AppState>, Json(body): Json<LoginRequest>) -> impl IntoResponse {
    if tokens_match(&body.token, state.admin_token.as_str()) {
        (StatusCode::OK, Json(serde_json::json!({"authenticated": true})))
    } else {
        failed_attempt_delay().await;
        (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error":"Неверный токен"})))
    }
}

async fn save_catalog(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(incoming): Json<Catalog>,
) -> impl IntoResponse {
    if !authorized(&headers, &state) {
        failed_attempt_delay().await;
        return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error":"Требуется авторизация"})));
    }
    if !catalog_is_valid(&incoming) {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({"error":"Проверь обязательные поля, статус наличия и slug (a-z, 0-9, дефис; без повторов)"})));
    }

    let serialized = match serde_json::to_vec_pretty(&incoming) {
        Ok(data) => data,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error":"Не удалось сериализовать каталог"}))),
    };
    // Hold the lock for the whole write: two simultaneous saves would otherwise
    // write the same temporary file at once and could leave a mixed, broken catalog.
    let mut catalog = state.catalog.lock().await;
    let temp_path = state.catalog_path.with_extension("json.tmp");
    if let Some(parent) = state.catalog_path.parent() {
        if tokio::fs::create_dir_all(parent).await.is_err() {
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error":"Не удалось создать каталог данных"})));
        }
    }
    if tokio::fs::write(&temp_path, serialized).await.is_err()
        || tokio::fs::rename(&temp_path, state.catalog_path.as_ref()).await.is_err()
    {
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error":"Не удалось сохранить каталог на диск"})));
    }
    *catalog = incoming;
    (StatusCode::OK, Json(serde_json::json!({"saved":true})))
}

#[tokio::main]
async fn main() {
    let admin_token = env::var("POSPOLITE_ADMIN_TOKEN")
        .expect("Set POSPOLITE_ADMIN_TOKEN before starting the API");
    if admin_token.len() < 12 {
        panic!("POSPOLITE_ADMIN_TOKEN must contain at least 12 characters");
    }
    let catalog_path = PathBuf::from(env::var("POSPOLITE_CATALOG_PATH").unwrap_or_else(|_| "data/catalog.json".into()));
    let initial: Catalog = serde_json::from_str(include_str!("../data/catalog.json"))
        .expect("embedded starter catalog is valid");
    // Only a missing file falls back to the starter catalog. A damaged file must stop
    // the server: silently replacing it would erase the real catalog on the next save.
    let catalog = match tokio::fs::read(&catalog_path).await {
        Ok(bytes) => serde_json::from_slice(&bytes).unwrap_or_else(|error| {
            panic!("{} is not a valid catalog ({error}); fix or move this file", catalog_path.display())
        }),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => initial,
        Err(error) => panic!("cannot read {}: {error}", catalog_path.display()),
    };
    let state = AppState {
        catalog: Arc::new(Mutex::new(catalog)),
        admin_token: Arc::new(admin_token),
        catalog_path: Arc::new(catalog_path),
    };
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([axum::http::Method::GET, axum::http::Method::POST, axum::http::Method::PUT])
        .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE]);
    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/catalog", get(get_catalog))
        .route("/api/admin/session", post(login))
        .route("/api/admin/catalog", put(save_catalog))
        .with_state(state)
        .layer(cors);
    let port = env::var("PORT").ok().and_then(|p| p.parse().ok()).unwrap_or(3000);
    let address = SocketAddr::from(([0, 0, 0, 0], port));
    let listener = tokio::net::TcpListener::bind(address).await.expect("failed to bind API address");
    println!("POSPOLITE API listening on http://{address}");
    axum::serve(listener, app).await.expect("API server failed");
}

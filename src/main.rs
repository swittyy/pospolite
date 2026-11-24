use axum::{
    extract::State,
    http::{header, HeaderMap, StatusCode},
    response::IntoResponse,
    routing::{get, post, put},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::{env, net::SocketAddr, path::PathBuf, sync::Arc};
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

fn authorized(headers: &HeaderMap, state: &AppState) -> bool {
    let expected = format!("Bearer {}", state.admin_token.as_str());
    headers.get(header::AUTHORIZATION).and_then(|v| v.to_str().ok()) == Some(expected.as_str())
}

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({"service":"pospolite-api","status":"ok"}))
}

async fn get_catalog(State(state): State<AppState>) -> Json<Catalog> {
    Json(state.catalog.lock().await.clone())
}

async fn login(State(state): State<AppState>, Json(body): Json<LoginRequest>) -> impl IntoResponse {
    if body.token == *state.admin_token {
        (StatusCode::OK, Json(serde_json::json!({"authenticated": true})))
    } else {
        (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error":"Неверный токен"})))
    }
}

async fn save_catalog(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(mut incoming): Json<Catalog>,
) -> impl IntoResponse {
    if !authorized(&headers, &state) {
        return (StatusCode::UNAUTHORIZED, Json(serde_json::json!({"error":"Требуется авторизация"})));
    }
    if incoming.categories.is_empty()
        || incoming.categories.iter().any(|c| c.slug.trim().is_empty() || c.title.trim().is_empty())
        || incoming.categories.iter().flat_map(|c| c.products.iter()).any(|p| {
            p.name.trim().is_empty() || p.price.trim().is_empty()
                || !["unknown", "in_stock", "out_of_stock"].contains(&p.availability.as_str())
        })
    {
        return (StatusCode::BAD_REQUEST, Json(serde_json::json!({"error":"Проверь обязательные поля и статус наличия"})));
    }

    let serialized = match serde_json::to_vec_pretty(&incoming) {
        Ok(data) => data,
        Err(_) => return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error":"Не удалось сериализовать каталог"}))),
    };
    let temp_path = state.catalog_path.with_extension("json.tmp");
    if let Some(parent) = state.catalog_path.parent() {
        if let Err(_) = tokio::fs::create_dir_all(parent).await {
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error":"Не удалось создать каталог данных"})));
        }
    }
    if tokio::fs::write(&temp_path, serialized).await.is_err()
        || tokio::fs::rename(&temp_path, state.catalog_path.as_ref()).await.is_err()
    {
        return (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({"error":"Не удалось сохранить каталог на диск"})));
    }
    let mut catalog = state.catalog.lock().await;
    std::mem::swap(&mut *catalog, &mut incoming);
    (StatusCode::OK, Json(serde_json::json!({"saved":true})))
}

#[tokio::main]
async fn main() {
    let admin_token = env::var("POSPOLITE_ADMIN_TOKEN")
        .expect("Set POSPOLITE_ADMIN_TOKEN to a long random secret before starting the API");
    if admin_token.len() < 32 {
        panic!("POSPOLITE_ADMIN_TOKEN must contain at least 32 characters");
    }
    let catalog_path = PathBuf::from(env::var("POSPOLITE_CATALOG_PATH").unwrap_or_else(|_| "data/catalog.json".into()));
    let initial: Catalog = serde_json::from_str(include_str!("../data/catalog.json"))
        .expect("embedded starter catalog is valid");
    let catalog = match tokio::fs::read(&catalog_path).await {
        Ok(bytes) => serde_json::from_slice(&bytes).unwrap_or(initial),
        Err(_) => initial,
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

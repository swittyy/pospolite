use axum::{routing::get, Json, Router};
use serde_json::{json, Value};
use std::net::SocketAddr;

async fn health() -> Json<Value> {
    Json(json!({
        "service": "pospolite-api",
        "status": "ok"
    }))
}

#[tokio::main]
async fn main() {
    let app = Router::new().route("/api/health", get(health));

    let address = SocketAddr::from(([127, 0, 0, 1], 3000));
    let listener = tokio::net::TcpListener::bind(address)
        .await
        .expect("failed to bind API address");

    println!("POSPOLITE API listening on http://{address}");
    axum::serve(listener, app)
        .await
        .expect("API server failed");
}

from fastapi import FastAPI

from app.database import check_database_connection

app = FastAPI(title="ShopSmart AI API")


@app.get("/health")
def health():
    return {"status": "ok", "service": "shopsmart-ai-backend"}


@app.get("/health/db")
def health_db():
    connected = check_database_connection()
    return {"database_connected": connected}
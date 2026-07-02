from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import check_database_connection

app = FastAPI(title="ShopSmart AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "shopsmart-ai-backend"}


@app.get("/health/db")
def health_db():
    connected = check_database_connection()
    return {"database_connected": connected}
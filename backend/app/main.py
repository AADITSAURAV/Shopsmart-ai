from typing import Optional

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import check_database_connection, get_db
from app.models import Product

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


@app.get("/products")
def get_products(
    category: Optional[str] = None,
    brand: Optional[str] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Product)

    if category:
        query = query.filter(Product.category == category)
    if brand:
        query = query.filter(Product.brand == brand)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if min_rating is not None:
        query = query.filter(Product.rating >= min_rating)

    return query.limit(50).all()


class RecommendRequest(BaseModel):
    budget: float
    category: Optional[str] = None
    brand: Optional[str] = None
    min_rating: Optional[float] = None


@app.post("/recommend")
def recommend(request: RecommendRequest, db: Session = Depends(get_db)):
    query = db.query(Product).filter(Product.price <= request.budget)

    if request.category:
        query = query.filter(Product.category == request.category)
    if request.brand:
        query = query.filter(Product.brand == request.brand)
    if request.min_rating is not None:
        query = query.filter(Product.rating >= request.min_rating)

    products = query.limit(200).all()

    results = []
    for p in products:
        rating_score = (p.rating or 3.0) / 5.0
        price_score = 1 - (p.price / request.budget) if request.budget > 0 else 0
        match_score = round((rating_score * 0.6 + price_score * 0.4) * 100, 1)

        reasons = []
        if p.rating and p.rating >= 4.0:
            reasons.append(f"highly rated ({p.rating}/5)")
        if p.price <= request.budget * 0.7:
            reasons.append("well within your budget")
        if request.brand and p.brand == request.brand:
            reasons.append(f"from {request.brand}, your preferred brand")
        reason = ", ".join(reasons) if reasons else "matches your filters"

        results.append({
            "id": p.id,
            "name": p.name,
            "brand": p.brand,
            "category": p.category,
            "price": p.price,
            "rating": p.rating,
            "image_url": p.image_url,
            "match_score": match_score,
            "reason": reason,
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results[:20]
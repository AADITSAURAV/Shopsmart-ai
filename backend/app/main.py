from typing import Optional

import joblib
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session

from app.database import check_database_connection, get_db
from app.import_data import import_products
from app.models import Product

app = FastAPI(title="ShopSmart AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    # Makes the project genuinely plug-and-play: on a fresh clone, this
    # loads the dataset automatically instead of requiring a manual command.
    # Safe to run every time - does nothing if data's already there.
    import_products()


# Load the trained model once when the server starts, not on every request
ml_data = joblib.load("app/ml_model.joblib")
vectorizer = ml_data["vectorizer"]
tfidf_matrix = ml_data["matrix"]
product_ids = ml_data["product_ids"]

id_to_row = {pid: i for i, pid in enumerate(product_ids)}


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
    purpose: Optional[str] = None


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

    query_vector = None
    if request.purpose:
        query_vector = vectorizer.transform([request.purpose])

    results = []
    for p in products:
        rating_score = (p.rating or 3.0) / 5.0
        price_score = 1 - (p.price / request.budget) if request.budget > 0 else 0

        text_score = 0.0
        if query_vector is not None and p.id in id_to_row:
            row = id_to_row[p.id]
            text_score = cosine_similarity(query_vector, tfidf_matrix[row])[0][0]

        if query_vector is not None:
            match_score = round((text_score * 0.5 + rating_score * 0.3 + price_score * 0.2) * 100, 1)
        else:
            match_score = round((rating_score * 0.6 + price_score * 0.4) * 100, 1)

        reasons = []
        if query_vector is not None and text_score >= 0.15:
            reasons.append(f"matches your search for '{request.purpose}'")
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
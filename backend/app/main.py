from typing import Optional

import joblib
from fastapi import Depends, FastAPI, HTTPException
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
    """
    Runs once when the backend starts up. Checks if the products table
    is empty and loads the dataset in if so - I added this so I don't
    have to manually run the import script every time I clone this
    somewhere new. If data's already there, it just skips this.
    """
    import_products()


# Loading the trained model once here at startup, not inside each
# request - that would be way too slow. See train_model.py for how
# this file actually got built.
ml_data = joblib.load("app/ml_model.joblib")
vectorizer = ml_data["vectorizer"]
tfidf_matrix = ml_data["matrix"]
product_ids = ml_data["product_ids"]

# Quick lookup so I can go from a product's database id straight to
# its row in tfidf_matrix, instead of searching for it every time.
id_to_row = {pid: i for i, pid in enumerate(product_ids)}


@app.get("/health")
def health():
    """Just tells you the API is up and running."""
    return {"status": "ok", "service": "shopsmart-ai-backend"}


@app.get("/health/db")
def health_db():
    """Separately checks if the database is reachable too - not the same thing as the API being up."""
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
    """
    Returns up to 50 products, filtered by whatever combination of
    category/brand/max_price/min_rating you pass in. Leave everything
    blank and you just get unfiltered products back.
    """
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


@app.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Grabs one product by id. 404s if it doesn't exist."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.get("/products/{product_id}/similar")
def get_similar_products(product_id: int, db: Session = Depends(get_db)):
    """
    Finds the 4 products whose descriptions read the most like this
    one, using the TF-IDF model. This is content-based, not
    collaborative filtering - I explain why in data/README.md, but
    basically I don't have any purchase history to work with, just
    product text.
    """
    if product_id not in id_to_row:
        raise HTTPException(status_code=404, detail="Product not found in model")

    row = id_to_row[product_id]
    similarities = cosine_similarity(tfidf_matrix[row], tfidf_matrix)[0]

    ranked_indices = similarities.argsort()[::-1]
    similar_ids = []
    for idx in ranked_indices:
        candidate_id = product_ids[idx]
        if candidate_id == product_id:
            continue
        similar_ids.append(candidate_id)
        if len(similar_ids) >= 4:
            break

    similar_products = db.query(Product).filter(Product.id.in_(similar_ids)).all()

    # the database doesn't keep my original order when I filter with
    # "in", so I have to manually re-sort back to the similarity order
    order = {pid: i for i, pid in enumerate(similar_ids)}
    similar_products.sort(key=lambda p: order.get(p.id, 999))

    return similar_products


@app.get("/products/{product_id}/alternatives")
def get_better_alternatives(product_id: int, db: Session = Depends(get_db)):
    """
    Powers the "better rated alternative" suggestion on the Cart page.

    I actually got this wrong on my first attempt - I was ranking by
    similarity first and only checking rating/price/category afterward,
    which meant a lot of genuinely better products never got considered
    at all. This version filters by the real constraints first (same
    category, actually rated higher, priced no more than 1.5x the
    original) directly against the database, so nothing gets missed,
    and only uses the similarity model afterward to pick the best one
    out of whatever survives.
    """
    current = db.query(Product).filter(Product.id == product_id).first()
    if not current or current.rating is None:
        return []

    candidates = (
        db.query(Product)
        .filter(Product.category == current.category)
        .filter(Product.rating.isnot(None))
        .filter(Product.rating > current.rating)
        .filter(Product.price <= current.price * 1.5)
        .filter(Product.id != product_id)
        .all()
    )

    if not candidates:
        return []

    if product_id in id_to_row:
        row = id_to_row[product_id]
        similarities = cosine_similarity(tfidf_matrix[row], tfidf_matrix)[0]
        candidates.sort(
            key=lambda p: similarities[id_to_row[p.id]] if p.id in id_to_row else 0,
            reverse=True,
        )
    else:
        candidates.sort(key=lambda p: p.rating, reverse=True)

    return candidates[:3]


class RecommendRequest(BaseModel):
    """What the frontend sends me for a recommendation search - only budget is actually required."""
    budget: float
    category: Optional[str] = None
    brand: Optional[str] = None
    min_rating: Optional[float] = None
    purpose: Optional[str] = None


@app.post("/recommend")
def recommend(request: RecommendRequest, db: Session = Depends(get_db)):
    """
    This is the main recommendation logic. First filters products down
    by budget/category/brand/min_rating, then scores whatever's left
    out of 100:

    - if the user typed a "purpose" (like "healthy breakfast snack"):
      50% how well the description matches that phrase + 30% rating +
      20% how far under budget it is
    - if no purpose was typed: just 60% rating + 40% budget headroom

    Sends back the top 20, best score first, each with a plain-English
    reason attached so it doesn't feel like a black box.
    """
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
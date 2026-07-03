import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sqlalchemy.orm import Session

from app.database import engine
from app.models import Product

MODEL_PATH = "app/ml_model.joblib"

# Pull every product's id and description straight from the database
with Session(engine) as session:
    products = session.query(Product.id, Product.description).all()

product_ids = [p.id for p in products]
descriptions = [p.description or "" for p in products]

print(f"Training on {len(descriptions)} product descriptions...")

# Preprocessing + feature engineering, handled by TfidfVectorizer itself:
# - lowercases every description
# - removes common English filler words (the, and, for...)
# - converts each description into a vector of word-importance scores,
#   so two descriptions using similar words end up as similar vectors
vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
tfidf_matrix = vectorizer.fit_transform(descriptions)

# Save the trained vectorizer, the product vectors, and the id order
# they correspond to - all three are needed together to reuse this later
joblib.dump(
    {"vectorizer": vectorizer, "matrix": tfidf_matrix, "product_ids": product_ids},
    MODEL_PATH,
)

print(f"Model saved to {MODEL_PATH}")
print(f"Vocabulary size: {len(vectorizer.vocabulary_)} words")

# Sanity check, not a formal accuracy score - content-based filtering on
# unlabeled text has no ground truth to measure against. Instead we
# manually confirm a sample query returns sensible-looking matches.
sample_query = "healthy breakfast snack"
query_vector = vectorizer.transform([sample_query])
similarities = cosine_similarity(query_vector, tfidf_matrix)[0]

top_5 = similarities.argsort()[-5:][::-1]
print(f"\nSanity check - top 5 matches for '{sample_query}':")
for idx in top_5:
    print(f"  - {descriptions[idx][:80]}... (score: {similarities[idx]:.3f})")
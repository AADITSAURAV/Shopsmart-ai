# Smart Cart

A grocery recommendation web app. Tell it your budget, category, brand preference, and what you're looking for - it returns real, ranked product recommendations from a live database, using a scikit-learn content-based recommendation model, not hardcoded results.

Built as a recruitment assessment project (Matching/Recommendation Service category).

## What it does

- Type in what you're looking for (e.g. "healthy breakfast snack"), set a budget, optionally filter by category/brand/rating
- Get back real ranked products with a match score (0-100%) and a reason for each recommendation
- Click into any product to see its full details and 4 similar products, powered by the same ML model
- Add items to a cart, which shows a genuinely better-rated alternative for each item (same category, similar product, reasonably priced) if one exists
- Runs entirely with docker compose up - no manual setup beyond downloading the dataset

## Why this project

The brief allowed three categories: Matching, Recommendation, or Image Recognition. Recommendation was chosen because grocery shopping is a natural fit for it - people don't always know exactly what they want, just roughly what they're looking for, their budget, and what matters to them (rating, brand). A recommendation engine that actually reasons about those inputs, instead of just filtering a list, felt like the most useful and honest way to demonstrate real ML work.

## Tech stack

- Backend: FastAPI (Python), SQLAlchemy
- Frontend: React + TypeScript, Vite, react-router-dom
- Database: PostgreSQL
- Machine Learning: scikit-learn (TF-IDF + cosine similarity)
- Containerization: Docker + Docker Compose

## Dataset

BigBasket Entire Product List (~27,555 real grocery products) by surajjha101 on Kaggle:
https://www.kaggle.com/datasets/surajjha101/bigbasket-entire-product-list-28k-datapoints

Full reasoning for why this dataset was chosen over alternatives, and data quality notes, are in data/README.md.

The CSV itself isn't committed to this repo (see Setup below for how to get it) - only the code that processes it.

## Getting started

1. Clone this repo

Run: git clone https://github.com/AADITSAURAV/Shopsmart-ai.git
Then: cd Shopsmart-ai

2. Get the dataset

Download BigBasket Products.csv from the Kaggle link above, and place it at:
data/BigBasket Products.csv

(See data/README.md for the exact download steps.)

3. Run it

Run: docker compose up --build

That's it. On first run, the backend automatically creates the database schema and imports all ~27,553 valid products - no manual import command needed. This also loads the already-trained ML model automatically.

4. Open it

Open http://localhost:5173 in your browser.

The app opens directly into the recommendation form - no landing page in between.

## Project structure

Top level: docker-compose.yml

data folder:
- README.md (dataset source and why it was chosen)
- BigBasket Products.csv (gitignored, you provide this)

backend folder:
- Dockerfile
- requirements.txt
- app folder:
  - main.py (FastAPI app, all API endpoints)
  - database.py (DB connection and session handling)
  - models.py (SQLAlchemy Product model)
  - import_data.py (loads the CSV into Postgres on startup)
  - train_model.py (trains the TF-IDF model, run manually)
  - ml_model.joblib (the trained model, committed to the repo)

frontend folder:
- Dockerfile
- package.json
- src folder:
  - main.tsx
  - App.tsx (routing and nav bar)
  - CartContext.tsx (cart state, shared across pages)
  - pages folder:
    - RecommendForm.tsx (the app's home page)
    - RecommendResults.tsx
    - ProductDetail.tsx
    - Cart.tsx
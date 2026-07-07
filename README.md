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

    ## API Documentation

The backend exposes 6 endpoints. Interactive docs are also available at http://localhost:8000/docs once running (FastAPI generates this automatically).

GET /health
Basic check that the API process is running. Returns status ok.

GET /health/db
Separately checks that the database is reachable. Returns database_connected true or false. This is split from /health because the API can be running while the database connection has a problem, and that is a different failure to diagnose.

GET /products
Returns up to 50 products. Optional query parameters: category, brand, max_price, min_rating. All are optional and combine together. Calling with none returns unfiltered results.

GET /products/{product_id}
Returns full details for one product by id. Returns 404 if it does not exist.

GET /products/{product_id}/similar
Returns the 4 products with the most similar descriptions to this one, using the trained TF-IDF model and cosine similarity. This is content-based matching on the product text, not based on purchase history.

GET /products/{product_id}/alternatives
Returns up to 3 alternatives that are genuinely better: same category as the original, rated higher, and priced no more than 1.5 times the original price. Powers the Better rated alternative box shown on the Cart page.

POST /recommend
The main recommendation endpoint. Request body: budget (required number), category, brand, min_rating, purpose (all optional).

Filters products by budget, category, brand, and minimum rating, then scores each result out of 100. If purpose is given, the score is 50 percent text similarity between the purpose phrase and the product description, 30 percent rating, 20 percent how far under budget the product is. If no purpose is given, the score falls back to 60 percent rating and 40 percent budget headroom.

Returns the top 20 results sorted by score, each with a plain-English reason explaining why it was recommended.

## Machine Learning approach

The recommendation engine uses TF-IDF (Term Frequency, Inverse Document Frequency) combined with cosine similarity, both from scikit-learn. This is content-based filtering, not collaborative filtering.

Why content-based instead of collaborative filtering: collaborative filtering needs real user behavior data, purchase history, click logs, people who bought X also bought Y. This project has a static product catalog with no user accounts and no purchase history, so there is nothing for collaborative filtering to learn from. Content-based filtering, matching based on what a product actually is via its description text, is the technique that fits the data that actually exists here. This reasoning is also documented in data/README.md.

How it works: TfidfVectorizer converts every product description into a vector of word-importance scores. Words that are distinctive to a specific product get weighted heavily, common filler words get weighted down to nearly nothing. Cosine similarity then measures how closely two of those vectors point in the same direction, which is the standard way to compare TF-IDF vectors.

Parameters used: stop_words english (strips common filler words before building the vocabulary), max_features 5000 (caps the vocabulary at the 5000 most informative words across the whole catalog). Trained once on all 27,553 product descriptions in train_model.py, saved to ml_model.joblib, loaded once when the backend starts.

This one trained model powers three endpoints: matching a typed purpose phrase against descriptions in POST /recommend, finding similar products in GET /products/{id}/similar, and finding better-rated alternatives in GET /products/{id}/alternatives.

Known limitation: TF-IDF matches on literal word overlap, not true semantic meaning. A search for "healthy breakfast" might miss a genuinely healthy oats product if that product's description happens to use different words like "energy" and "wholesome" instead. This is a real, common limitation of this technique, not a bug. Word embeddings or a more advanced language model could capture meaning beyond literal word overlap, which is a natural next step if this were extended further.

## Honest notes and future improvements

A few things worth being upfront about:

Data quality: the source dataset has some exact duplicate rows (same product, same brand, same price, different id), a known issue in scraped product datasets. This does not break the recommendation logic, but it is worth knowing about if the same product appears to show up twice in results.

Cart persistence: the shopping cart lives only in browser memory. Refreshing the page clears it. This was a deliberate simplification, adding real persistence would mean building user accounts and a backend cart store, which is real additional scope beyond what this assessment calls for.

Collaborative filtering and click-based trending: both were considered during development. Both would require real user accounts and real interaction history over time, neither of which exists in this project. The choice was to build a genuinely good content-based system instead, and note these as real next steps if the project were extended with actual users.
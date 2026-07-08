# API Endpoints & Responses

## API Endpoints

- **Method:** `GET`
  **Endpoint:** `/health`
  **Description:** Check if the API process is running

- **Method:** `GET`
  **Endpoint:** `/health/db`
  **Description:** Check if the database is reachable

- **Method:** `GET`
  **Endpoint:** `/products`
  **Description:** List products, optional filters for category, brand, max_price, min_rating

- **Method:** `GET`
  **Endpoint:** `/products/{id}`
  **Description:** Get full details for one product

- **Method:** `GET`
  **Endpoint:** `/products/{id}/similar`
  **Description:** Get the 4 most similar products by description

- **Method:** `GET`
  **Endpoint:** `/products/{id}/alternatives`
  **Description:** Get up to 3 genuinely better-rated alternatives

- **Method:** `POST`
  **Endpoint:** `/recommend`
  **Description:** Generate ranked recommendations from budget, category, brand, min_rating, and purpose

## How The Recommendation Engine Works

1. The user submits their preferences through the React form
2. FastAPI receives the request and validates it using Pydantic schemas
3. The backend filters products by budget, category, brand, and minimum rating
4. If the user typed a purpose, the text is converted into a TF-IDF vector and compared against every candidate product description using cosine similarity
5. Each surviving product is scored out of 100: with a purpose, 50 percent text similarity, 30 percent rating, 20 percent budget headroom. Without a purpose, 60 percent rating, 40 percent budget headroom
6. Results are sorted by score and the top 20 are returned as JSON, each with a plain-English reason attached
7. React renders the ranked list

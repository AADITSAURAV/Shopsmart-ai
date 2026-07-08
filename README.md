# Smart Cart

## Project Overview

Smart Cart is a full stack web application that helps users discover grocery products that actually fit their budget and what they are looking for. Instead of just filtering a product list, the app uses a scikit-learn content-based recommendation model to score and rank real products from a live database, and explains why each one was recommended.

The system is built using React and TypeScript for the frontend, FastAPI for the backend, and PostgreSQL for the database. The entire application runs through Docker, with each part of the system running in its own container.

## Why I Chose This Project

The brief allowed three categories: Matching, Recommendation, or Image Recognition. Grocery shopping is a natural fit for a recommendation system, since people usually do not know the exact product they want, just roughly what they are looking for, their budget, and what matters to them, like rating or brand.

I wanted to build something that does not just filter a list, but actually scores how well each product fits what the user asked for, and explains that score in plain English, so it does not feel like a black box.

## What Makes This Project Special

Instead of relying on a single rigid filter, the recommendation engine dynamically scores every candidate product out of 100. If a user types a purpose like "healthy breakfast snack", the engine compares that phrase against real product descriptions using a trained TF-IDF model, not just a keyword match.

The scoring combines text similarity, rating, and how far under budget a product is, with different weights depending on whether the user typed a purpose or not. Every recommended product also gets a plain-English reason attached, so the ranking is explainable, not just a number.

## Features

- Type in what you are looking for, set a budget, and optionally filter by category, brand, and minimum rating
- Get back real ranked products with a match score out of 100 and a plain-English reason for each one
- Click into any product to see its full details and 4 similar products, powered by the same ML model
- Add items to a cart, which shows a genuinely better-rated alternative for each item if one exists, same category, similar product, reasonably priced
- Runs entirely with `docker compose up --build`, with zero manual setup required

## Technology Stack

Backend
- Python
- FastAPI
- SQLAlchemy
- Psycopg2
- Pandas
- Scikit-learn

Frontend
- React
- TypeScript
- Vite
- React Router

Database
- PostgreSQL

DevOps
- Docker
- Docker Compose

Development Tools
- Visual Studio Code
- Git
- GitHub

## Project Architecture

The application is split into three independent services, each running in its own Docker container, connected through a custom Docker network.

    User
      |
      v
    React Frontend (localhost:5173)
      |
      v  REST API requests
    FastAPI Backend (localhost:8000)
      |
      v
    Recommendation Engine
    (TF-IDF + Cosine Similarity)
      |
      v
    PostgreSQL Database

The frontend never talks to the database directly. Every request goes through the backend first, which keeps the system organized and easier to maintain.

## Application URLs

Frontend: http://localhost:5173
Backend API: http://localhost:8000
Interactive API Documentation: http://localhost:8000/docs

## How To Install

The project is completely self-contained. You do not need to install Node, Python, or Postgres on your machine, and you do not need to manually download any datasets.

1. **Clone the repository**
   ```bash
   git clone https://github.com/AADITSAURAV/Shopsmart-ai.git
   cd Shopsmart-ai
   ```

2. **Run it with Docker**
   ```bash
   docker compose up --build
   ```

3. **Open the app**
   Visit http://localhost:5173 in your browser.

That's it! On the first run, the backend automatically creates the database schema and imports a bundled sample dataset (~70 products across all 11 categories) so the app is immediately usable.

*(Optional: If you want the full 27,000+ product dataset, see `data/README.md` for instructions on how to download it. The backend will automatically detect and import it if placed in the `data/` folder).*

## Database Setup

The application uses PostgreSQL.

When Docker Compose is executed, the following happens automatically:

1. The PostgreSQL container starts
2. The backend checks whether the products table already contains data
3. If empty, the backend looks for the dataset CSV and imports it to seed the database
4. If data already exists, seeding is skipped, so restarting the application never creates duplicate records

No manual database setup is required.

## How To Use

Enter your preferences on the form: budget, category, brand, purpose, and minimum rating. Click Get Recommendations to see a ranked list of matching products, each with a match score and a plain-English reason. Click into any product to see its full details and similar products. Add items to your cart to see if a genuinely better-rated alternative exists for each one.

## How The Recommendation Engine Works

1. The user submits their preferences through the React form
2. FastAPI receives the request and validates it using Pydantic schemas
3. The backend filters products by budget, category, brand, and minimum rating
4. If the user typed a purpose, the text is converted into a TF-IDF vector and compared against every candidate product description using cosine similarity
5. Each surviving product is scored out of 100: with a purpose, 50 percent text similarity, 30 percent rating, 20 percent budget headroom. Without a purpose, 60 percent rating, 40 percent budget headroom
6. Results are sorted by score and the top 20 are returned as JSON, each with a plain-English reason attached
7. React renders the ranked list

## API Endpoints

Method: GET, Endpoint: /health, Description: Check if the API process is running

Method: GET, Endpoint: /health/db, Description: Check if the database is reachable

Method: GET, Endpoint: /products, Description: List products, optional filters for category, brand, max_price, min_rating

Method: GET, Endpoint: /products/{id}, Description: Get full details for one product

Method: GET, Endpoint: /products/{id}/similar, Description: Get the 4 most similar products by description

Method: GET, Endpoint: /products/{id}/alternatives, Description: Get up to 3 genuinely better-rated alternatives

Method: POST, Endpoint: /recommend, Description: Generate ranked recommendations from budget, category, brand, min_rating, and purpose

## Troubleshooting

Docker will not start

docker compose down
docker compose up --build

Database connection error

Confirm the following: the PostgreSQL container is running, the Docker network was created successfully, and the backend only starts after PostgreSQL has passed its health check.

No results appear on any search

Check the backend logs with docker compose logs backend --tail 20. If it says the dataset was not found, confirm the CSV is placed at data/BigBasket Products.csv exactly as described in data/README.md.

## AI Usage Declaration

To be fully transparent about how this project was built: I worked with Claude, an AI assistant, as a hands-on collaborator throughout this project, not just as a reference tool. Claude wrote a substantial portion of the actual code, including the backend API endpoints, the ML training script, and the React components.

My role was direction, decisions, and verification. I chose the project category and dataset, decided on content-based filtering over collaborative filtering once I understood the dataset had no purchase history to support it, and made the call to keep the shopping cart in memory rather than add accounts and persistence that were out of scope. I personally ran and tested every command in this project in my own terminal, and caught real issues along the way, including a stale build cache that broke a feature after it had already worked once, and a filename mismatch that caused empty results on a machine other than my own. I can explain the reasoning behind the major decisions in this project, including why the model uses TF-IDF specifically, how the scoring weights work, and where the known limitations are.

The brief for this assessment explicitly allows the use of AI tools, and I chose to use Claude directly and extensively rather than write everything unaided. I am being upfront about the extent of that here rather than understating it.

## Author

Aadit Saurav
GitHub: https://github.com/AADITSAURAV

## Acknowledgements

This project was developed as part of a recruitment assessment.

Dataset: BigBasket Entire Product List by surajjha101 on Kaggle.

Open source technologies used: FastAPI, React, Docker, PostgreSQL, SQLAlchemy, Pydantic, Pandas, Scikit-learn.

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
- Runs entirely with docker compose up, no manual setup beyond downloading the dataset
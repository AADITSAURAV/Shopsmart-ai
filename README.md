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

User
React Frontend
REST API Requests
FastAPI Backend
Recommendation Engine, TF-IDF plus cosine similarity
PostgreSQL Database

The frontend never talks to the database directly. Every request goes through the backend first, which keeps the system organized and easier to maintain.

## Application URLs

Frontend: http://localhost:5173
Backend API: http://localhost:8000
Interactive API Documentation: http://localhost:8000/docs

## How To Install

In short:

git clone https://github.com/AADITSAURAV/Shopsmart-ai.git
cd Shopsmart-ai
docker compose up --build

Then open http://localhost:5173

Full setup instructions, prerequisites, and how to get the dataset are in the Getting Started section above and in data/README.md.

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
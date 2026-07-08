# Project Architecture

## System Overview

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

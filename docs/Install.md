# Installation & Setup

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

## Troubleshooting

Docker will not start

```bash
docker compose down
docker compose up --build
```

Database connection error

Confirm the following: the PostgreSQL container is running, the Docker network was created successfully, and the backend only starts after PostgreSQL has passed its health check.

No results appear on any search

Check the backend logs with `docker compose logs backend --tail 20`. If it says the dataset was not found, confirm the CSV is placed at `data/BigBasket Products.csv` exactly as described in `data/README.md`.

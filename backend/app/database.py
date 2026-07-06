from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+psycopg2://shopsmart:shopsmart@db:5432/shopsmart"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)


def check_database_connection() -> bool:
    """
    Just runs a basic SELECT 1 to check if Postgres is actually
    reachable. I added this because I realized the backend could be
    "running" but still not be able to talk to the database - those
    are two different problems, so I wanted a way to check each one
    separately (that's why /health and /health/db are two endpoints,
    not one).
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


def get_db():
    """
    Gives each request its own database connection and closes it when
    the request is done, even if something goes wrong in the middle.
    I don't call this myself anywhere - FastAPI runs it automatically
    for any route that has Depends(get_db) in its parameters.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
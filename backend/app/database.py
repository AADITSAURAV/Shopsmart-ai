from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql+psycopg2://shopsmart:shopsmart@db:5432/shopsmart"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)


def check_database_connection() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
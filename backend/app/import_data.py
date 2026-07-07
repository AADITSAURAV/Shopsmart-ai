import os

import pandas as pd
from sqlalchemy.orm import Session

from app.database import engine
from app.models import Base, Product

CSV_PATH = "/code/data/BigBasket Products.csv"
SAMPLE_CSV_PATH = "/code/data/sample_products.csv"

CATEGORY_ICONS = {
    "Beauty & Hygiene": "/icons/beauty.png",
    "Kitchen, Garden & Pets": "/icons/kitchen.png",
    "Cleaning & Household": "/icons/cleaning.png",
    "Gourmet & World Food": "/icons/gourmet.png",
    "Snacks & Branded Foods": "/icons/snacks.png",
    "Foodgrains, Oil & Masala": "/icons/foodgrains.png",
    "Beverages": "/icons/beverages.png",
    "Bakery, Cakes & Dairy": "/icons/bakery.png",
    "Baby Care": "/icons/babycare.png",
    "Fruits & Vegetables": "/icons/fruits.png",
    "Eggs, Meat & Fish": "/icons/meat.png",
}


def import_products():
    """
    Loads products into the products table on first startup.

    Priority order:
    1. Full BigBasket CSV (if present at /code/data/BigBasket Products.csv)
    2. Bundled sample dataset (always present at /code/data/sample_products.csv)

    Safe to call every time the app starts:
    - if the table already has rows, does nothing (no duplicates)
    - if neither CSV is found, logs a clear error and returns
    """
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        existing_count = session.query(Product).count()
        if existing_count > 0:
            print(f"Products table already has {existing_count} rows, skipping import")
            return

    # Determine which CSV to use
    if os.path.exists(CSV_PATH):
        path_to_use = CSV_PATH
        is_sample = False
    elif os.path.exists(SAMPLE_CSV_PATH):
        path_to_use = SAMPLE_CSV_PATH
        is_sample = True
        print("=" * 60)
        print("NOTE: Full dataset not found. Loading bundled sample data")
        print("      (~70 products across all categories).")
        print("      For the full 27,000+ product experience, download")
        print("      BigBasket Products.csv — see data/README.md")
        print("=" * 60)
    else:
        print(f"Dataset not found at {CSV_PATH}, skipping import")
        print("See data/README.md for download instructions")
        return

    df = pd.read_csv(path_to_use)
    df = df.dropna(subset=["product", "brand"])

    # Normalise category names: the sample CSV uses '; ' as separator
    # (to avoid CSV quoting issues with '&'), map back to canonical names
    category_aliases = {
        "Kitchen; Garden & Pets": "Kitchen, Garden & Pets",
        "Foodgrains; Oil & Masala": "Foodgrains, Oil & Masala",
        "Bakery; Cakes & Dairy": "Bakery, Cakes & Dairy",
        "Eggs; Meat & Fish": "Eggs, Meat & Fish",
    }
    df["category"] = df["category"].replace(category_aliases)

    with Session(engine) as session:
        count = 0
        for _, row in df.iterrows():
            product = Product(
                name=row["product"],
                category=row["category"],
                brand=row["brand"],
                price=row["sale_price"],
                rating=row["rating"] if pd.notna(row["rating"]) else None,
                description=row["description"] if pd.notna(row["description"]) else "",
                image_url=CATEGORY_ICONS.get(row["category"], "/icons/default.png"),
            )
            session.add(product)
            count += 1

        session.commit()
        label = "sample" if is_sample else "full"
        print(f"Imported {count} products from {label} dataset")


if __name__ == "__main__":
    import_products()
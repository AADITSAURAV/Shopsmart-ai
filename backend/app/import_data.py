import pandas as pd

from app.database import engine
from app.models import Base, Product

# Create the products table if it doesn't exist yet
Base.metadata.create_all(engine)

# Read the CSV
df = pd.read_csv("/code/data/BigBasket Products.csv")

# Drop rows with no product name or no brand - can't recommend
# something we can't identify or filter by
df = df.dropna(subset=["product", "brand"])

from sqlalchemy.orm import Session

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
    print(f"Imported {count} products")
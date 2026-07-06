from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Product(Base):
    """
    This is my product table - one row per product from the BigBasket
    dataset I downloaded (check data/README.md if you want to know why
    I picked this one over others). I only kept the fields I actually
    use in the app: name, price, category, brand, rating, and the
    description text, which is what my ML model reads to figure out
    which products are similar to each other.
    """

    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String)
    brand = Column(String)
    price = Column(Float)
    rating = Column(Float, nullable=True)
    description = Column(Text)
    image_url = Column(String)
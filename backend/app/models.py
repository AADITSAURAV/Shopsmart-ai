from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String)
    brand = Column(String)
    price = Column(Float)
    rating = Column(Float, nullable=True)
    description = Column(Text)
    image_url = Column(String)
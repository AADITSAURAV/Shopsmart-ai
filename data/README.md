# Dataset

**Source:** [BigBasket Entire Product List (~28K datapoints)](https://www.kaggle.com/datasets/surajjha101/bigbasket-entire-product-list-28k-datapoints)

## Out-of-the-box behaviour

A sample dataset (`sample_products.csv`) is committed to this repo and covers all 11 product categories (~70 products). The backend loads it automatically when the full CSV is not present, so the app works immediately after `docker compose up --build` with no setup.

## For the full 27,000+ product experience

1. Download the dataset from the Kaggle link above
2. Extract the zip file
3. Place the CSV here as `data/BigBasket Products.csv`
4. Run `docker compose up --build`

The backend detects the full CSV on startup and imports it automatically — no manual command needed.

The full CSV is not committed to git because it is 16 MB and not ours to redistribute.

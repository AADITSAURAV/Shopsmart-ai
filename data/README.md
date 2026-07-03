# Dataset

**Source:** [BigBasket Entire Product List (~28K datapoints)](https://www.kaggle.com/datasets/surajjha101/bigbasket-entire-product-list-28k-datapoints)

## How to get it

1. Download from the Kaggle link above (free account required)
2. Extract the zip
3. Place the CSV here as `data/BigBasket Products.csv`
4. Run the import script: `docker compose exec backend python -m app.import_data`

Not committed to git - it's 16MB and not ours to redistribute.
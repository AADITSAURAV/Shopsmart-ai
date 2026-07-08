# User Manual

## Overview

Smart Cart helps you find grocery products that fit your budget and what you are actually looking for. This page walks through every part of the interface and what it does.

## Opening the app

After running docker compose up --build, open http://localhost:5173 in your browser. The app opens directly into the recommendation form. There is no separate landing page to click through first.

## The Recommendation Form

Maximum Budget (required)
The highest price you are willing to pay, in rupees. This is the only required field.

Category (optional)
A dropdown of all 11 product categories in the dataset, such as Beauty & Hygiene, Snacks & Branded Foods, or Fruits & Vegetables. Leave blank to search across every category.

Brand (optional)
A free-text field to filter results down to one specific brand.

What are you looking for (optional)
A free-text field describing what you actually want, for example healthy breakfast snack or gentle face wash. This is the field that powers the TF-IDF text matching. If left blank, results are ranked by rating and budget headroom instead of text relevance.

Minimum Rating (optional)
A dropdown to exclude any product rated below your chosen threshold.

## Getting recommendations

Fill in as many fields as you want, then click Generate Recommendations. You will be taken to a results page showing up to 20 matching products.

## Reading your results

Each result card shows the product name, brand, price, rating, a match score out of 100, and a plain-English reason explaining why it was recommended, for example matches your search for healthy breakfast snack or highly rated. Results are sorted with the highest match score first.

## Viewing a product in detail

Click any result card to open its full product page. This shows the complete description and a Similar Products section: 4 other products with the most similar descriptions, found using the same TF-IDF model.

## Using the cart

Click Add to Cart on any product card, either from the results page or the product detail page, to add it to your cart. Open the Cart page from the navigation bar at any time to see everything you have added.

For each item in your cart, if a genuinely better option exists, meaning a product in the same category that is rated higher and not significantly more expensive, it will be shown directly under that item as a suggested alternative.

The cart is stored in your browser only. Refreshing the page will clear it.

## A worked example

Say you set Maximum Budget to 150, Category to Snacks & Branded Foods, and type healthy breakfast snack into What are you looking for. The backend filters the catalog down to snacks under 150 rupees, then scores each one: 50 percent on how closely its description matches the phrase healthy breakfast snack, 30 percent on its rating, and 20 percent on how far under 150 it is priced. The results page then shows the highest-scoring products first, each with a reason such as matches your search for healthy breakfast snack, highly rated (4.3/5).

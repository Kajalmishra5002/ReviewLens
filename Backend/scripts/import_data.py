import pandas as pd
from pymongo import MongoClient, ASCENDING
import json
import os
from dotenv import load_dotenv

# Load environment variables (for MongoDB URI)
load_dotenv()

# ================= CONFIGURATION =================
EXCEL_FILE = 'backend/data/ReviewLens_Dataset (2).xlsx'
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017') # Default to local if not set
DB_NAME = 'reviewlensDB'
COLLECTION_NAME = 'products'

def import_data():
    print(f"Starting import process from {EXCEL_FILE}...")

    try:
        # 1. Read Excel Sheets
        print("Reading Excel sheets...")
        df_products = pd.read_excel(EXCEL_FILE, sheet_name='Product Overview')
        df_reviews = pd.read_excel(EXCEL_FILE, sheet_name='Detailed Reviews')

        # 2. Clean Dataset
        print("Cleaning data...")
        
        # Remove duplicates
        df_products.drop_duplicates(subset=['Name'], keep='first', inplace=True)
        
        # Handle missing values
        df_products.fillna({
            'Brand': 'Generic',
            'Category': 'Uncategorized',
            'Price (₹)': 0,
            'Rating ': 0,
            'Product Image (Search)': '',
            'Amazon Link': '',
            'Flipkart Link': ''
        }, inplace=True)

        df_reviews.dropna(subset=['Review Text'], inplace=True)

        # Group reviews by product name
        # Find the actual rating column name (handles 'Rating ' or 'Rating')
        rating_col = [c for c in df_reviews.columns if 'Rating' in c][0]
        
        reviews_grouped = df_reviews.groupby('Product Name').apply(lambda x: x[[
            'Review Text', 'Sentiment', rating_col
        ]].to_dict('records')).to_dict()

        # Find price and rating columns for products
        prod_rating_col = [c for c in df_products.columns if 'Rating' in c][0]
        prod_price_col = [c for c in df_products.columns if 'Price' in c and '₹' in c][0]

        final_products = []
        for _, row in df_products.iterrows():
            product_name = row['Name']
            
            # Get reviews for this product
            product_reviews = reviews_grouped.get(product_name, [])
            
            # Format reviews to match requested schema
            formatted_reviews = []
            for r in product_reviews:
                formatted_reviews.append({
                    "userName": "Verified Buyer", # Default since not in Excel
                    "rating": r.get(rating_col, 0),
                    "reviewText": r.get('Review Text', ''),
                    "sentiment": r.get('Sentiment', 'Neutral')
                })

            # Create product object
            product_obj = {
                "name": product_name,
                "category": row.get('Category', 'Electronics'),
                "brand": row.get('Brand', 'Generic'),
                "price": int(row.get(prod_price_col, 0)),
                "rating": float(row.get(prod_rating_col, 0)),
                "features": [], 
                "image": row.get('Product Image (Search)', ''),
                "amazonLink": row.get('Amazon Link', ''),
                "flipkartLink": row.get('Flipkart Link', ''),
                "reviews": formatted_reviews
            }
            final_products.append(product_obj)

        # 4. Connect to MongoDB Atlas
        print("Connecting to MongoDB Atlas...")
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]

        # 5. Insert Data
        print(f"Inserting {len(final_products)} products into {DB_NAME}.{COLLECTION_NAME}...")
        
        # Clear existing data to ensure no duplicates as per requirement
        # (Or use upsert logic, but here we'll clear first for a clean demo)
        collection.delete_many({}) 
        
        if final_products:
            collection.insert_many(final_products)
            print("Data inserted successfully!")

        # 6. Add Indexing
        print("Creating indexes on product name and category...")
        collection.create_index([("name", ASCENDING)])
        collection.create_index([("category", ASCENDING)])
        print("Indexing complete!")

        client.close()
        print("Process finished successfully!")

    except Exception as e:
        print(f"Error during import: {e}")

if __name__ == "__main__":
    import_data()

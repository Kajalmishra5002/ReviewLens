import pandas as pd
import requests
import time
import os

# --- CONFIGURATION ---
CSV_FILE = "reviews_dataset.csv"  # Place your dataset here
API_URL = "http://localhost:5000/api/admin/upload-dataset"
PRODUCT_ID = "65b8f1a2c9e3a4b5d6e7f8a1"  # Example ID (iPhone 15 Pro)
JWT_TOKEN = "your_admin_jwt_token_here"

def process_dataset():
    if not os.path.exists(CSV_FILE):
        print(f"❌ Error: {CSV_FILE} not found. Please create it with columns 'review_text' and 'rating'.")
        # Create a sample file for demonstration
        df_sample = pd.DataFrame({
            'review_text': [
                "Amazing product, totally worth it!",
                "Waste of money. Don't buy.",
                "Great great great great service",
                "Best phone ever best phone ever",
                "Not bad for the price."
            ],
            'rating': [5, 1, 5, 5, 4]
        })
        df_sample.to_csv(CSV_FILE, index=False)
        print(f"📝 Created a sample {CSV_FILE} for you.")

    print(f"🚀 Reading {CSV_FILE}...")
    
    # 1. Loading with pandas
    df = pd.read_csv(CSV_FILE)
    
    # 2. Preprocessing
    print("🧹 Preprocessing data...")
    df['review_text'] = df['review_text'].str.lower().str.replace(r'[^\w\s]', '', regex=True)
    
    # 3. Sending to Backend API
    print(f"📤 Uploading to ReviewLens Backend...")
    
    files = {'file': open(CSV_FILE, 'rb')}
    data = {'productId': PRODUCT_ID}
    headers = {'Authorization': f'Bearer {JWT_TOKEN}'}
    
    try:
        response = requests.post(API_URL, files=files, data=data, headers=headers)
        if response.status_code == 200:
            print("✅ Success:", response.json()['message'])
        else:
            print("❌ Error:", response.status_code, response.text)
    except Exception as e:
        print("❌ Connection Failed:", str(e))

if __name__ == "__main__":
    process_dataset()

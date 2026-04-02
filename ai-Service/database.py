from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client["ecommerce"]

def get_all_orders():
    orders = list(db.orders.find({}, {"user": 1, "items": 1}))
    flat = []
    for o in orders:
        for item in o.get("items", []):
            flat.append({
                "user_id": str(o["user"]),
                "product_id": str(item["product"])
            })
    return flat

def get_all_products():
    return list(db.products.find({}))
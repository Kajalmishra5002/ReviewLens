import os
import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

def get_db():
    """
    Safely initialize the MongoDB client.
    Returns the database object or None if connection fails.
    """
    uri = os.getenv("MONGO_URI")
    if not uri:
        logger.error("MONGO_URI not found in environment variables.")
        return None
    
    try:
        # serverSelectionTimeoutMS=5000 ensures we don't hang indefinitely
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        # The 'ping' command is the standard way to check if the connection is alive and auth is valid
        client.admin.command('ping')
        logger.info("Successfully connected to MongoDB.")
        
        # Standardizing on the DB name from the URI or a default
        db_name = uri.split('/')[-1].split('?')[0] or "ecommerce"
        return client[db_name]
    except (ConnectionFailure, OperationFailure) as e:
        logger.error(f"MongoDB Connection/Auth failed: {e}")
        return None
    except Exception as e:
        logger.error(f"An unexpected error occurred while connecting to MongoDB: {e}")
        return None

# Initialize db instance
db = get_db()

def get_all_orders():
    if db is None:
        logger.warning("Database unavailable. Returning empty order list.")
        return []
    try:
        orders = list(db.orders.find({}, {"user": 1, "items": 1}))
        flat = []
        for o in orders:
            # Ensure 'user' and 'items' keys exist
            if "user" not in o:
                continue
            for item in o.get("items", []):
                if "product" not in item:
                    continue
                flat.append({
                    "user_id": str(o["user"]),
                    "product_id": str(item["product"])
                })
        return flat
    except Exception as e:
        logger.error(f"Error fetching orders: {e}")
        return []

def get_all_products():
    if db is None:
        logger.warning("Database unavailable. Returning empty product list.")
        return []
    try:
        return list(db.products.find({}))
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        return []
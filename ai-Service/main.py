import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from recommender import CollaborativeFilter, ContentBasedFilter
from database import get_all_orders, get_all_products

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="E-commerce AI Service")

app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

# Load models on startup
cf_model = CollaborativeFilter()
cb_model = ContentBasedFilter()

@app.on_event("startup")
async def startup():
    """
    Safely load data and fit models on startup.
    Prevents the app from crashing if data fetching fails.
    """
    logger.info("Starting AI service models initialization...")
    try:
        orders = get_all_orders()
        products = get_all_products()
        
        if orders:
            try:
                cf_model.fit(orders)
                logger.info(f"Collaborative filtering model fitted successfully with {len(orders)} data points.")
            except Exception as e:
                logger.error(f"Failed to fit CollaborativeFilter: {e}")
        else:
            logger.warning("No orders retrieved. Collaborative filtering model remains empty.")

        if products:
            try:
                cb_model.fit(products)
                logger.info(f"Content-based filtering model fitted successfully with {len(products)} products.")
            except Exception as e:
                logger.error(f"Failed to fit ContentBasedFilter: {e}")
        else:
            logger.warning("No products retrieved. Content-based filtering model remains empty.")

    except Exception as e:
        logger.error(f"Unexpected error during startup data loading: {e}")
    
    logger.info("AI service startup sequence completed.")

class RecommendRequest(BaseModel):
    user_id: str
    purchase_history: Optional[List[str]] = []

@app.post("/recommend")
async def recommend(req: RecommendRequest):
    try:
        # Try collaborative filtering first
        cf_ids = cf_model.predict(req.user_id, n=4)
        if len(cf_ids) >= 4:
            return {"recommended_ids": cf_ids}
        # Fall back to content-based
        cb_ids = cb_model.predict(req.purchase_history, n=4)
        combined = list(dict.fromkeys(cf_ids + cb_ids))[:4]
        return {"recommended_ids": combined}
    except Exception as e:
        logger.error(f"Error during recommendation: {e}")
        return {"recommended_ids": [], "error": str(e)}

@app.post("/retrain")
async def retrain():
    try:
        orders = get_all_orders()
        products = get_all_products()
        if orders: cf_model.fit(orders)
        if products: cb_model.fit(products)
        return {"status": "Models retrained successfully"}
    except Exception as e:
        logger.error(f"Error during retraining: {e}")
        return {"status": "Retraining failed", "error": str(e)}

@app.get("/health")
async def health():
    return {"status": "ok", "db_connected": get_all_products() != []}
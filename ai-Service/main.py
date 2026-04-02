from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from recommender import CollaborativeFilter, ContentBasedFilter
from database import get_all_orders, get_all_products

app = FastAPI(title="E-commerce AI Service")

app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

# Load models on startup
cf_model = CollaborativeFilter()
cb_model = ContentBasedFilter()

@app.on_event("startup")
async def startup():
    orders = get_all_orders()
    products = get_all_products()
    if orders:
        cf_model.fit(orders)
    if products:
        cb_model.fit(products)

class RecommendRequest(BaseModel):
    user_id: str
    purchase_history: Optional[List[str]] = []

@app.post("/recommend")
async def recommend(req: RecommendRequest):
    # Try collaborative filtering first
    cf_ids = cf_model.predict(req.user_id, n=4)
    if len(cf_ids) >= 4:
        return {"recommended_ids": cf_ids}
    # Fall back to content-based
    cb_ids = cb_model.predict(req.purchase_history, n=4)
    combined = list(dict.fromkeys(cf_ids + cb_ids))[:4]
    return {"recommended_ids": combined}

@app.post("/retrain")
async def retrain():
    orders = get_all_orders()
    products = get_all_products()
    cf_model.fit(orders)
    cb_model.fit(products)
    return {"status": "Models retrained successfully"}

@app.get("/health")
async def health():
    return {"status": "ok"}
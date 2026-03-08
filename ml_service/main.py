"""
Step 4: ML Prediction API - Garment Export Prediction Service
FastAPI service that loads the trained model and serves predictions.
Run with: uvicorn ml_service.main:app --port 8000 --reload
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import json
import numpy as np
import os

# ─────────────────────────────────────────
# Load model + metadata at startup
# ─────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))

# ── Revenue model (unchanged) ──────────────────────────────
MODEL_PATH = os.path.join(BASE_DIR, "export_prediction_model.pkl")
META_PATH  = os.path.join(BASE_DIR, "encoder_metadata.json")

model    = joblib.load(MODEL_PATH)
with open(META_PATH, 'r') as f:
    metadata = json.load(f)

label_encoders = metadata["label_encoders"]

# ── Demand model (new — Step 2) ────────────────────────────
DEMAND_MODEL_PATH = os.path.join(BASE_DIR, "demand_prediction_model.pkl")
DEMAND_META_PATH  = os.path.join(BASE_DIR, "demand_encoder_metadata.json")

demand_model = joblib.load(DEMAND_MODEL_PATH)
with open(DEMAND_META_PATH, 'r') as f:
    demand_metadata = json.load(f)

demand_encoders = demand_metadata["label_encoders"]

app = FastAPI(title="VR Fashions Export Prediction API", version="1.0.0")

# Allow calls from the React admin dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────
class PredictionRequest(BaseModel):
    product_type: str          # e.g. "knitted wear"
    destination_country: str   # e.g. "usa"
    order_quantity: int        # e.g. 12000
    month: int                 # 1–12
    year: int                  # e.g. 2026

class PredictionResponse(BaseModel):
    predicted_value: float
    product_type: str
    destination_country: str
    order_quantity: int
    month: int
    year: int
    currency: str = "INR"
    model_used: str

# ── Demand Prediction models ───────────────────────────────
class DemandRequest(BaseModel):
    product_type: str         # e.g. "knitted wear"
    destination_country: str  # e.g. "usa"
    month: int                # 1–12
    year: int                 # e.g. 2026

class DemandResponse(BaseModel):
    predicted_demand: str     # "Low" | "Medium" | "High"
    product_type: str
    destination_country: str
    month: int
    year: int
    model_used: str

# ─────────────────────────────────────────
# Helper: encode a single input row
# ─────────────────────────────────────────
def encode_input(product_type: str, destination_country: str, order_quantity: int, month: int, year: int):
    def safe_encode(classes: list, value: str) -> int:
        val = value.lower().strip()
        if val in classes:
            return classes.index(val)
        return 0  # fallback to first class

    exporter_enc     = safe_encode(label_encoders["exporter_name"], "vr fashions")
    product_enc      = safe_encode(label_encoders["product_description"], product_type)
    country_enc      = safe_encode(label_encoders["destination_country"], destination_country)
    quarter          = (month - 1) // 3 + 1

    return [exporter_enc, product_enc, country_enc, order_quantity, year, month, quarter]

# ─────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "VR Fashions Export Prediction API is Online", "model": metadata["model_name"]}

@app.get("/health")
def health():
    return {"status": "healthy", "model": metadata["model_name"], "r2": metadata["performance"]["r2"]}

@app.post("/api/export/predict", response_model=PredictionResponse)
def predict_export(request: PredictionRequest):
    try:
        features = encode_input(
            request.product_type,
            request.destination_country,
            request.order_quantity,
            request.month,
            request.year
        )
        prediction = model.predict([features])[0]
        return PredictionResponse(
            predicted_value=round(float(prediction), 2),
            product_type=request.product_type,
            destination_country=request.destination_country,
            order_quantity=request.order_quantity,
            month=request.month,
            year=request.year,
            model_used=metadata["model_name"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────────────────────────────
# Demand Prediction — shared encoder helper  (Step 2 / Step 3)
# ─────────────────────────────────────────────────────────────────
def encode_demand_input(product_type: str, destination_country: str,
                        month: int, year: int) -> list:
    """Map raw text inputs → integer feature vector for the demand model."""
    def safe_encode(classes: list, value: str) -> int:
        val = value.lower().strip()
        return classes.index(val) if val in classes else 0

    product_enc = safe_encode(demand_encoders["product_description"], product_type)
    country_enc = safe_encode(demand_encoders["destination_country"], destination_country)
    return [product_enc, country_enc, month, year]


def _run_demand_prediction(request: DemandRequest) -> DemandResponse:
    """Core demand inference — shared by both demand endpoints."""
    features   = encode_demand_input(
        request.product_type,
        request.destination_country,
        request.month,
        request.year,
    )
    prediction = demand_model.predict([features])[0]
    return DemandResponse(
        predicted_demand    = str(prediction),
        product_type        = request.product_type,
        destination_country = request.destination_country,
        month               = request.month,
        year                = request.year,
        model_used          = demand_metadata["model_name"],
    )


# ── Step 3 canonical endpoint ────────────────────────────────────
@app.post("/api/export/demand", response_model=DemandResponse)
def predict_export_demand(request: DemandRequest):
    """
    **Step 3 — Demand Prediction**

    Predicts demand level (Low / Medium / High) for a product / country /
    month / year combination.

    Example request:
        { "product_type": "knitted wear", "destination_country": "usa",
          "month": 7, "year": 2026 }

    Example response:
        { "predicted_demand": "High", ... }
    """
    try:
        return _run_demand_prediction(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Legacy alias (Step 2) — kept for backward compatibility ──────
@app.post("/api/demand/predict", response_model=DemandResponse,
          include_in_schema=False)   # hidden from docs to avoid confusion
def predict_demand(request: DemandRequest):
    """Backward-compatible alias → delegates to /api/export/demand logic."""
    try:
        return _run_demand_prediction(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/export/forecast")
def bulk_forecast():
    """
    Pre-generate forecasts for the next 6 months across all known countries
    and product types. Used by the admin dashboard AI Insights section.
    """
    from datetime import datetime
    current_month = datetime.now().month
    current_year  = datetime.now().year

    products  = label_encoders["product_description"]
    countries = label_encoders["destination_country"]

    forecasts = []
    for i in range(1, 7):  # Next 6 months
        month = ((current_month - 1 + i) % 12) + 1
        year  = current_year + ((current_month - 1 + i) // 12)

        for product in products:
            for country in countries:
                # Revenue prediction
                rev_features = encode_input(product, country, 10000, month, year)
                rev_pred = model.predict([rev_features])[0]
                
                # Demand prediction (Step 3 integration)
                dem_features = encode_demand_input(product, country, month, year)
                dem_pred = demand_model.predict([dem_features])[0]
                
                forecasts.append({
                    "month"     : month,
                    "year"      : year,
                    "product"   : product,
                    "country"   : country,
                    "predicted_value": round(float(rev_pred), 2),
                    "predicted_demand": str(dem_pred)
                })

    # Aggregate top countries and top products by total predicted value
    import pandas as pd
    df = pd.DataFrame(forecasts)

    top_countries = (
        df.groupby("country")["predicted_value"].sum()
        .sort_values(ascending=False)
        .head(5)
        .to_dict()
    )
    top_products = (
        df.groupby("product")["predicted_value"].sum()
        .sort_values(ascending=False)
        .to_dict()
    )
    monthly_trend = (
        df.groupby(["year", "month"])["predicted_value"].sum()
        .reset_index()
        .rename(columns={"predicted_value": "total"})
        .to_dict(orient="records")
    )

    return {
        "status"          : "success",
        "months_forecasted": 6,
        "model"           : metadata["model_name"],
        "accuracy_r2"     : metadata["performance"]["r2"],
        "top_countries"   : top_countries,
        "top_products"    : top_products,
        "monthly_trend"   : monthly_trend,
        "detailed_forecast": forecasts[:12] # return first 12 matches for UI display
    }

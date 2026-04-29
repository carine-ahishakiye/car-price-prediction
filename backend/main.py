"""
main.py — FastAPI backend for Car Price Predictor
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator
import joblib, json, numpy as np
from pathlib import Path

# ── Load model artifacts ───────────────────────────────────────────────────────
BASE = Path(__file__).parent / "models"
try:
    model    = joblib.load(BASE / "car_price_model.joblib")
    encoders = joblib.load(BASE / "encoders.joblib")
    with open(BASE / "meta.json") as f:
        META = json.load(f)
except FileNotFoundError:
    raise RuntimeError("Models not found. Run: python train_model.py")

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(title="Car Price Predictor API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Schema ─────────────────────────────────────────────────────────────────────
class CarFeatures(BaseModel):
    brand:            str   = Field(..., example="Toyota")
    fuel:             str   = Field(..., example="Petrol")
    transmission:     str   = Field(..., example="Automatic")
    body_type:        str   = Field(..., example="Sedan")
    year:             int   = Field(..., ge=2005, le=2025)
    km_driven:        int   = Field(..., ge=0, le=250_000)
    engine_size:      float = Field(..., ge=0.8, le=6.0)
    previous_owners:  int   = Field(..., ge=1, le=4)

    @validator("brand")
    def validate_brand(cls, v):
        if v not in META["brands"]:
            raise ValueError(f"brand must be one of {META['brands']}")
        return v

    @validator("fuel")
    def validate_fuel(cls, v):
        if v not in META["fuels"]:
            raise ValueError(f"fuel must be one of {META['fuels']}")
        return v

    @validator("transmission")
    def validate_trans(cls, v):
        if v not in META["transmissions"]:
            raise ValueError(f"transmission must be one of {META['transmissions']}")
        return v

    @validator("body_type")
    def validate_body(cls, v):
        if v not in META["body_types"]:
            raise ValueError(f"body_type must be one of {META['body_types']}")
        return v


class PredictionResponse(BaseModel):
    predicted_price: float
    price_range:     dict
    confidence:      str
    currency:        str = "USD"

# ── Routes ─────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "message": "Car Price Predictor API is running"}

@app.get("/meta")
def get_meta():
    """Return valid options for each field."""
    return META

@app.post("/predict", response_model=PredictionResponse)
def predict(car: CarFeatures):
    try:
        cat_cols = ["brand","fuel","transmission","body_type"]
        enc_vals = [encoders[c].transform([getattr(car, c)])[0] for c in cat_cols]
        num_vals = [car.year, car.km_driven, car.engine_size, car.previous_owners]
        X = np.array([enc_vals + num_vals])

        price = float(model.predict(X)[0])
        price = max(2000, round(price, -2))

        margin = price * 0.08
        return PredictionResponse(
            predicted_price = price,
            price_range     = {"low": round(price - margin, -2), "high": round(price + margin, -2)},
            confidence      = "high" if price > 5000 else "medium",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

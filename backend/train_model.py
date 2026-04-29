"""
train_model.py — Train and save the car price prediction model.
Run once: python train_model.py
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib, json, os

# ── Synthetic training data ────────────────────────────────────────────────────
np.random.seed(42)
N = 5000

BRANDS   = ["Toyota","Honda","Ford","BMW","Mercedes","Audi","Tesla","Hyundai","Chevrolet","Nissan"]
FUELS    = ["Petrol","Diesel","Electric","Hybrid"]
TRANS    = ["Manual","Automatic"]
BODY     = ["Sedan","SUV","Hatchback","Coupe","Pickup","Van"]

brand    = np.random.choice(BRANDS, N)
fuel     = np.random.choice(FUELS,  N, p=[0.45,0.30,0.10,0.15])
trans    = np.random.choice(TRANS,  N, p=[0.35,0.65])
body     = np.random.choice(BODY,   N)
year     = np.random.randint(2005, 2025, N)
km       = np.random.randint(0, 250_000, N)
engine   = np.round(np.random.uniform(0.8, 6.0, N), 1)
owners   = np.random.randint(1, 5, N)

# Brand premium factor
brand_premium = {
    "BMW":1.8,"Mercedes":2.0,"Audi":1.7,"Tesla":1.6,
    "Toyota":1.1,"Honda":1.0,"Ford":0.95,"Hyundai":0.85,
    "Chevrolet":0.90,"Nissan":0.92
}

base_price = (
    8000
    + (year - 2005) * 600
    - km * 0.04
    + engine * 3000
    + np.array([brand_premium[b] for b in brand]) * 5000
    + (trans == "Automatic") * 2000
    + (fuel == "Electric") * 8000
    + (fuel == "Hybrid") * 3000
    - (owners - 1) * 1200
    + np.random.normal(0, 2500, N)
)
price = np.clip(base_price, 2000, 150000).round(-2)

df = pd.DataFrame({
    "brand":brand,"fuel":fuel,"transmission":trans,
    "body_type":body,"year":year,"km_driven":km,
    "engine_size":engine,"previous_owners":owners,"price":price
})

# ── Encode categoricals ────────────────────────────────────────────────────────
cat_cols = ["brand","fuel","transmission","body_type"]
encoders = {}
for c in cat_cols:
    le = LabelEncoder()
    df[c+"_enc"] = le.fit_transform(df[c])
    encoders[c] = le

features = [c+"_enc" for c in cat_cols] + ["year","km_driven","engine_size","previous_owners"]
X, y = df[features], df["price"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ── Train ──────────────────────────────────────────────────────────────────────
model = GradientBoostingRegressor(
    n_estimators=300, learning_rate=0.08,
    max_depth=5, subsample=0.85, random_state=42
)
model.fit(X_train, y_train)

preds = model.predict(X_test)
print(f"MAE : ${mean_absolute_error(y_test, preds):,.0f}")
print(f"R²  : {r2_score(y_test, preds):.4f}")

# ── Persist ────────────────────────────────────────────────────────────────────
os.makedirs("models", exist_ok=True)
joblib.dump(model,    "models/car_price_model.joblib")
joblib.dump(encoders, "models/encoders.joblib")

meta = {
    "brands":   BRANDS,
    "fuels":    FUELS,
    "transmissions": TRANS,
    "body_types":    BODY,
    "year_range":  [2005, 2025],
    "km_range":    [0, 250000],
    "engine_range": [0.8, 6.0],
}
with open("models/meta.json","w") as f:
    json.dump(meta, f, indent=2)

print("✅ Model saved to models/")

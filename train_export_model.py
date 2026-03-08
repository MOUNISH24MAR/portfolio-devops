"""
Step 3: Export Prediction ML Training
Garment Export Management System - VR Fashions

Architecture:
  MongoDB    -> Admin Dashboard Graphs (Operational Live Data)
  cleaned_export_data.csv -> ML Training (Export Prediction)

This script:
  1. Loads cleaned_export_data.csv
  2. Preprocesses features with encoding
  3. Trains Random Forest Regressor
  4. Evaluates model performance
  5. Saves export_prediction_model.pkl + encoder metadata
"""

import pandas as pd
import numpy as np
import joblib
import os
import json
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import warnings
warnings.filterwarnings('ignore')

# ─────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────
INPUT_CSV  = "cleaned_export_data.csv"
MODEL_OUT  = "ml_service/export_prediction_model.pkl"
META_OUT   = "ml_service/encoder_metadata.json"

os.makedirs("ml_service", exist_ok=True)

# ─────────────────────────────────────────
# 1. LOAD DATASET
# ─────────────────────────────────────────
print("\n[STEP 3] Loading cleaned export dataset...")
df = pd.read_csv(INPUT_CSV)
print(f"  Loaded {len(df)} records with columns: {df.columns.tolist()}")

# ─────────────────────────────────────────
# 2. FEATURE ENGINEERING
# ─────────────────────────────────────────
print("\n[STEP 3] Feature engineering...")

# Parse datetime if not already done
df['shipment_date'] = pd.to_datetime(df['shipment_date'], utc=True)
df['year']    = df['shipment_date'].dt.year
df['month']   = df['shipment_date'].dt.month
df['quarter'] = df['shipment_date'].dt.quarter

# Select feature columns
CATEGORICAL  = ['exporter_name', 'product_description', 'destination_country']
NUMERIC      = ['quantity', 'year', 'month', 'quarter']
TARGET       = 'value'   # Predict: export VALUE (revenue)

# ─────────────────────────────────────────
# 3. LABEL ENCODE CATEGORICALS
# ─────────────────────────────────────────
print("\n[STEP 3] Encoding categorical variables...")
encoders = {}
for col in CATEGORICAL:
    le = LabelEncoder()
    df[col + '_enc'] = le.fit_transform(df[col].astype(str))
    encoders[col] = list(le.classes_)
    print(f"  Encoded '{col}': {list(le.classes_)}")

# Build feature matrix
FEATURE_COLS = [c + '_enc' for c in CATEGORICAL] + NUMERIC
X = df[FEATURE_COLS].values
y = df[TARGET].values

print(f"\n  Feature shape: {X.shape}")
print(f"  Target stats: min={y.min():.0f}, max={y.max():.0f}, mean={y.mean():.0f}")

# ─────────────────────────────────────────
# 4. TRAIN / TEST SPLIT
# ─────────────────────────────────────────
print("\n[STEP 3] Splitting dataset (80% train / 20% test)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"  Training samples : {len(X_train)}")
print(f"  Testing  samples : {len(X_test)}")

# ─────────────────────────────────────────
# 5. TRAIN MODELS & PICK BEST
# ─────────────────────────────────────────
print("\n[STEP 3] Training models...")

models = {
    "RandomForest": RandomForestRegressor(n_estimators=150, max_depth=8, random_state=42, n_jobs=-1),
    "LinearRegression": LinearRegression()
}

results = {}
for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    mae  = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2   = r2_score(y_test, preds)
    results[name] = {"mae": mae, "rmse": rmse, "r2": r2, "model": model}
    print(f"\n  [{name}]")
    print(f"    MAE  : {mae:,.2f}  (avg prediction error in USD)")
    print(f"    RMSE : {rmse:,.2f}")
    print(f"    R2   : {r2:.4f}  (1.0 = perfect)")

# Pick best model by R2 score
best_name = max(results, key=lambda k: results[k]['r2'])
best_model = results[best_name]['model']
print(f"\n  Best Model: [{best_name}] (R2 = {results[best_name]['r2']:.4f})")

# ─────────────────────────────────────────
# 6. FEATURE IMPORTANCE (RandomForest only)
# ─────────────────────────────────────────
if best_name == "RandomForest":
    importances = dict(zip(FEATURE_COLS, best_model.feature_importances_))
    print("\n[STEP 3] Feature Importances:")
    for feat, imp in sorted(importances.items(), key=lambda x: -x[1]):
        print(f"  {feat:<35} {imp:.4f}")

# ─────────────────────────────────────────
# 7. SAVE MODEL + METADATA
# ─────────────────────────────────────────
print("\n[STEP 3] Saving model and encoder metadata...")

joblib.dump(best_model, MODEL_OUT)

metadata = {
    "model_name"   : best_name,
    "target"       : TARGET,
    "features"     : FEATURE_COLS,
    "categorical"  : CATEGORICAL,
    "numeric"      : NUMERIC,
    "label_encoders": encoders,
    "performance"  : {
        "mae" : float(results[best_name]['mae']),
        "rmse": float(results[best_name]['rmse']),
        "r2"  : float(results[best_name]['r2'])
    }
}

with open(META_OUT, 'w') as f:
    json.dump(metadata, f, indent=2)

print(f"\n[SUCCESS] Model saved -> {MODEL_OUT}")
print(f"[SUCCESS] Metadata  saved -> {META_OUT}")
print(f"\n--- Step 3 Complete. System ready for prediction API. ---\n")

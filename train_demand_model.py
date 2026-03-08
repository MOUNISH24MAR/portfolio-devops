"""
Step 2 - Demand Prediction: Train Classification Model
=======================================================
Loads the labelled dataset (export_with_demand.csv), engineers features,
trains a DecisionTreeClassifier to predict demand_level, evaluates it,
and saves the model + encoder metadata to ml_service/.

Output files:
    ml_service/demand_prediction_model.pkl
    ml_service/demand_encoder_metadata.json
"""

import os
import json
import joblib
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report

# -------------------------------------------------------------------
# Paths
# -------------------------------------------------------------------
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE  = os.path.join(BASE_DIR, "export_with_demand.csv")
ML_DIR      = os.path.join(BASE_DIR, "ml_service")
MODEL_PATH  = os.path.join(ML_DIR, "demand_prediction_model.pkl")
META_PATH   = os.path.join(ML_DIR, "demand_encoder_metadata.json")

# -------------------------------------------------------------------
# 1. Load dataset
# -------------------------------------------------------------------
print("[INFO] Loading dataset ...")
df = pd.read_csv(INPUT_FILE)
print(f"[INFO] Rows: {len(df)}  |  Columns: {list(df.columns)}")

# -------------------------------------------------------------------
# 2. Feature engineering
# -------------------------------------------------------------------
# Parse shipment_date and extract month / year (dataset already has them,
# but we re-derive to be safe in case they are missing or stale)
df["shipment_date"] = pd.to_datetime(df["shipment_date"], utc=True)
df["month"] = df["shipment_date"].dt.month
df["year"]  = df["shipment_date"].dt.year

FEATURE_COLS = ["product_description", "destination_country", "month", "year"]
TARGET_COL   = "demand_level"

print(f"\n[INFO] Features : {FEATURE_COLS}")
print(f"[INFO] Target   : {TARGET_COL}")

# -------------------------------------------------------------------
# 3. Label-encode categorical features
# -------------------------------------------------------------------
le_product = LabelEncoder()
le_country = LabelEncoder()

df["product_enc"] = le_product.fit_transform(df["product_description"])
df["country_enc"] = le_country.fit_transform(df["destination_country"])

# -------------------------------------------------------------------
# 4. Prepare X / y
# -------------------------------------------------------------------
X = df[["product_enc", "country_enc", "month", "year"]]
y = df[TARGET_COL]

print(f"\n[INFO] Class distribution:\n{y.value_counts().to_string()}")

# -------------------------------------------------------------------
# 5. Train / test split  (80 / 20, stratified to preserve class balance)
# -------------------------------------------------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f"\n[INFO] Training samples : {len(X_train)}")
print(f"[INFO] Testing  samples : {len(X_test)}")

# -------------------------------------------------------------------
# 6. Train DecisionTreeClassifier
# -------------------------------------------------------------------
print("\n[INFO] Training DecisionTreeClassifier ...")
clf = DecisionTreeClassifier(
    random_state=42,
    max_depth=8,          # prevents overfitting on a small dataset
    min_samples_leaf=2
)
clf.fit(X_train, y_train)

# -------------------------------------------------------------------
# 7. Evaluate
# -------------------------------------------------------------------
y_pred = clf.predict(X_test)
acc    = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred)

print(f"\n{'='*50}")
print(f"  Accuracy : {acc * 100:.2f}%")
print(f"{'='*50}")
print("\n  Classification Report:")
print(report)

# -------------------------------------------------------------------
# 8. Save model
# -------------------------------------------------------------------
joblib.dump(clf, MODEL_PATH)
print(f"[SUCCESS] Model saved  → {MODEL_PATH}")

# -------------------------------------------------------------------
# 9. Save encoder metadata (label mappings)
# -------------------------------------------------------------------
# Convert numpy arrays to plain Python lists for JSON serialisation
metadata = {
    "model_name"    : "DecisionTreeClassifier",
    "target"        : TARGET_COL,
    "features"      : ["product_enc", "country_enc", "month", "year"],
    "categorical"   : ["product_description", "destination_country"],
    "numeric"       : ["month", "year"],
    "label_encoders": {
        "product_description" : le_product.classes_.tolist(),
        "destination_country" : le_country.classes_.tolist(),
        "demand_level_classes": clf.classes_.tolist()
    },
    "performance"   : {
        "accuracy": round(acc, 6),
        "test_size": len(X_test),
        "train_size": len(X_train)
    }
}

with open(META_PATH, "w") as f:
    json.dump(metadata, f, indent=2)

print(f"[SUCCESS] Metadata saved → {META_PATH}")

# -------------------------------------------------------------------
# 10. Quick sanity-check prediction
# -------------------------------------------------------------------
sample = pd.DataFrame([{
    "product_enc": le_product.transform(["knitted wear"])[0],
    "country_enc": le_country.transform(["usa"])[0],
    "month"      : 3,
    "year"        : 2025
}])
result = clf.predict(sample)[0]
print(f"\n[SANITY CHECK] knitted wear | usa | month=3 | year=2025  →  Demand: {result}")
print("\n[DONE] Demand model training complete.")

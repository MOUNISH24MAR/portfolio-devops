"""
Step 1 - Demand Prediction: Create Demand Labels
=================================================
Loads the cleaned export dataset, applies demand classification rules
based on shipment quantity, and saves the result as a new file.

Rules:
    quantity < 7000        → "Low"
    7000 <= quantity <= 12000 → "Medium"
    quantity > 12000       → "High"

Output: export_with_demand.csv  (original file is NOT modified)
"""

import pandas as pd
import os

# -------------------------------------------------------------------
# Paths
# -------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE  = os.path.join(BASE_DIR, "cleaned_export_data.csv")
OUTPUT_FILE = os.path.join(BASE_DIR, "export_with_demand.csv")

# -------------------------------------------------------------------
# 1. Load dataset
# -------------------------------------------------------------------
print(f"[INFO] Loading dataset from: {INPUT_FILE}")
df = pd.read_csv(INPUT_FILE)

print(f"[INFO] Dataset loaded — {len(df)} rows, {len(df.columns)} columns")
print(f"[INFO] Columns: {list(df.columns)}")

# -------------------------------------------------------------------
# 2. Validate required column
# -------------------------------------------------------------------
if "quantity" not in df.columns:
    raise ValueError("[ERROR] Column 'quantity' not found in the dataset.")

# -------------------------------------------------------------------
# 3. Create demand_level column using vectorised pd.cut
# -------------------------------------------------------------------
df["demand_level"] = pd.cut(
    df["quantity"],
    bins=[0, 6999, 12000, float("inf")],   # right-inclusive boundaries
    labels=["Low", "Medium", "High"],
    right=True                              # intervals: (0,6999], (6999,12000], (12000,∞)
)

# pd.cut returns a Categorical; convert to plain string for CSV compatibility
df["demand_level"] = df["demand_level"].astype(str)

# -------------------------------------------------------------------
# 4. Quick summary of label distribution
# -------------------------------------------------------------------
print("\n[INFO] Demand level distribution:")
print(df["demand_level"].value_counts().to_string())

# -------------------------------------------------------------------
# 5. Save to new file (original untouched)
# -------------------------------------------------------------------
df.to_csv(OUTPUT_FILE, index=False)
print(f"\n[SUCCESS] Saved labelled dataset to: {OUTPUT_FILE}")

# -------------------------------------------------------------------
# 6. Preview first 5 rows of relevant columns
# -------------------------------------------------------------------
preview_cols = ["shipment_date", "product_description", "destination_country",
                "quantity", "value", "demand_level"]
print("\n[PREVIEW] First 5 rows:")
print(df[preview_cols].head().to_string(index=False))

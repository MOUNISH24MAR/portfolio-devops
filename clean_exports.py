import pandas as pd
import numpy as np
import os

def clean_export_data(input_file, output_file):
    """
    Loads, cleans, and prepares garment export data for Machine Learning analysis.
    """
    print(f"--- Starting Data Cleaning Process for: {input_file} ---")
    
    # 1. Load the dataset
    if not os.path.exists(input_file):
        print(f"Error: {input_file} not found.")
        return

    df = pd.read_csv(input_file)
    
    # 2. Inspect the dataset
    print("\n[INFO] Initial Dataset Inspection:")
    print("Columns:", df.columns.tolist())
    print("\nData Types:\n", df.dtypes)
    print("\nMissing Values:\n", df.isnull().sum())
    print("\nFirst 5 records:\n", df.head())

    # 3. Handle missing values
    # For categorical fields, we'll fill with 'unknown' or drop if critical
    critical_cols = ['shipment_date', 'quantity', 'value']
    df = df.dropna(subset=critical_cols)
    
    df['exporter_name'] = df['exporter_name'].fillna('Unknown')
    df['product_description'] = df['product_description'].fillna('Uncategorized')
    df['destination_country'] = df['destination_country'].fillna('Unknown')

    # 4. Convert shipment_date into proper datetime format
    df['shipment_date'] = pd.to_datetime(df['shipment_date'], errors='coerce')
    df = df.dropna(subset=['shipment_date']) # Remove rows with invalid dates

    # 5. Standardize text fields (strip spaces, convert to lowercase)
    text_cols = ['exporter_name', 'product_description', 'destination_country']
    for col in text_cols:
        df[col] = df[col].astype(str).str.strip().str.lower()

    # 6. Convert quantity and value columns into numeric types
    df['quantity'] = pd.to_numeric(df['quantity'], errors='coerce')
    df['value'] = pd.to_numeric(df['value'], errors='coerce')
    
    # Final check on numeric drops
    df = df.dropna(subset=['quantity', 'value'])

    # 7. Remove duplicate records
    initial_count = len(df)
    df = df.drop_duplicates()
    final_count = len(df)
    print(f"\n[INFO] Removed {initial_count - final_count} duplicate records.")

    # 8. Create new time-based columns
    df['year'] = df['shipment_date'].dt.year
    df['month'] = df['shipment_date'].dt.month
    df['quarter'] = df['shipment_date'].dt.quarter

    # 9. Save the cleaned dataset
    df.to_csv(output_file, index=False)
    print(f"\n[SUCCESS] Cleaned dataset saved as: {output_file}")
    
    # Final Summary
    print("\n[INFO] Final Dataset Summary:")
    print(f"Total Records: {len(df)}")
    print(f"Date Range: {df['shipment_date'].min()} to {df['shipment_date'].max()}")
    print(f"Total Export Value: ${df['value'].sum():,.2f}")

if __name__ == "__main__":
    # Settings
    INPUT_CSV = "exports_dataset.csv"
    OUTPUT_CSV = "cleaned_export_data.csv"
    
    clean_export_data(INPUT_CSV, OUTPUT_CSV)

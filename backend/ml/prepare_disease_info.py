"""
Script to compile raw dataset CSV files into a structured disease_info.json dictionary.
"""

import json
import ast
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data" / "raw_dataset"
OUTPUT_PATH = Path(__file__).resolve().parent / "disease_info.json"


def safe_parse_list(val):
    if pd.isna(val):
        return []
    val_str = str(val).strip()
    if val_str.startswith("[") and val_str.endswith("]"):
        try:
            return ast.literal_eval(val_str)
        except Exception:
            pass
    return [item.strip("'\" ") for item in val_str.split(",") if item.strip("'\" ")]


def prepare_disease_info():
    disease_map = {}

    # Load description.csv
    desc_path = DATA_DIR / "description.csv"
    if desc_path.exists():
        df_desc = pd.read_csv(desc_path)
        for _, row in df_desc.iterrows():
            d_name = str(row["Disease"]).strip()
            disease_map[d_name] = {
                "disease": d_name,
                "description": str(row["Description"]).strip(),
                "medications": [],
                "precautions": [],
                "diet": [],
                "workout": [],
            }

    # Load medications.csv
    med_path = DATA_DIR / "medications.csv"
    if med_path.exists():
        df_med = pd.read_csv(med_path)
        for _, row in df_med.iterrows():
            d_name = str(row["Disease"]).strip()
            if d_name not in disease_map:
                disease_map[d_name] = {
                    "disease": d_name,
                    "description": "No description available.",
                    "medications": [],
                    "precautions": [],
                    "diet": [],
                    "workout": [],
                }
            disease_map[d_name]["medications"] = safe_parse_list(row["Medication"])

    # Load precautions.csv
    prec_path = DATA_DIR / "precautions.csv"
    if prec_path.exists():
        df_prec = pd.read_csv(prec_path)
        for _, row in df_prec.iterrows():
            d_name = str(row["Disease"]).strip()
            if d_name not in disease_map:
                disease_map[d_name] = {
                    "disease": d_name,
                    "description": "No description available.",
                    "medications": [],
                    "precautions": [],
                    "diet": [],
                    "workout": [],
                }
            prec_cols = [c for c in df_prec.columns if "Precaution" in c]
            prec_list = [str(row[c]).strip() for c in prec_cols if pd.notna(row[c]) and str(row[c]).strip()]
            disease_map[d_name]["precautions"] = prec_list

    # Load diets.csv
    diet_path = DATA_DIR / "diets.csv"
    if diet_path.exists():
        df_diet = pd.read_csv(diet_path)
        for _, row in df_diet.iterrows():
            d_name = str(row["Disease"]).strip()
            if d_name not in disease_map:
                disease_map[d_name] = {
                    "disease": d_name,
                    "description": "No description available.",
                    "medications": [],
                    "precautions": [],
                    "diet": [],
                    "workout": [],
                }
            disease_map[d_name]["diet"] = safe_parse_list(row["Diet"])

    # Load workout.csv
    work_path = DATA_DIR / "workout.csv"
    if work_path.exists():
        df_work = pd.read_csv(work_path)
        for _, row in df_work.iterrows():
            d_name = str(row["Disease"]).strip()
            if d_name not in disease_map:
                disease_map[d_name] = {
                    "disease": d_name,
                    "description": "No description available.",
                    "medications": [],
                    "precautions": [],
                    "diet": [],
                    "workout": [],
                }
            disease_map[d_name]["workout"] = safe_parse_list(row.get("Workouts", row.get("workout", "")))

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(disease_map, f, indent=2)

    print(f"Successfully saved disease info for {len(disease_map)} diseases to {OUTPUT_PATH}")
    return disease_map


if __name__ == "__main__":
    prepare_disease_info()

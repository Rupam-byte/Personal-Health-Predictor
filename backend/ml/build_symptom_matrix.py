"""
Script to compute symptom-to-disease association matrix from raw dataset.
Saves backend/ml/symptom_disease_weights.json
"""

import json
from pathlib import Path
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = PROJECT_ROOT / "data" / "raw_dataset" / "Diseases_and_Symptoms_dataset.csv"
OUTPUT_PATH = Path(__file__).resolve().parent / "symptom_disease_weights.json"


def build_weights():
    df = pd.read_csv(DATA_PATH)
    features = [c for c in df.columns if c != "diseases"]
    disease_means = df.groupby("diseases")[features].mean()

    # Create mapping: disease -> list of active symptoms (mean > 0.1)
    weights = {}
    for disease, row in disease_means.iterrows():
        active = row[row > 0.05].to_dict()
        weights[str(disease)] = {k: round(float(v), 4) for k, v in active.items()}

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(weights, f, indent=2)

    print(f"Successfully generated symptom disease weights for {len(weights)} diseases -> {OUTPUT_PATH}")


if __name__ == "__main__":
    build_weights()

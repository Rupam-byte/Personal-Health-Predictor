"""Validate the symptom dataset and train the disease-classification model.

Run from the project root:
    python backend/ml/train_model.py

The script deliberately removes symptom profiles that have conflicting disease
labels.  Keeping them would make the training target internally inconsistent,
and a normal row-level split would also leak duplicate profiles into validation.
"""

from __future__ import annotations

import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = PROJECT_ROOT / "data" / "raw_dataset" / "Diseases_and_Symptoms_dataset.csv"
MODEL_DIR = Path(__file__).resolve().parent
MODEL_PATH = MODEL_DIR / "best_model.pkl"
SYMPTOM_PATH = MODEL_DIR / "symptom_list.json"
REPORT_PATH = MODEL_DIR / "training_report.json"
RANDOM_STATE = 42

# We use HistGradientBoostingClassifier as it is a highly precise, lightweight 
# gradient boosting algorithm (similar to LightGBM) natively supported by scikit-learn.
MODEL_PARAMS = {
    "learning_rate": 0.1,
    "max_iter": 200,
    "max_depth": 12,
    "min_samples_leaf": 5,
    "random_state": RANDOM_STATE,
}


def validate_and_clean(data: pd.DataFrame) -> tuple[pd.DataFrame, list[str], dict]:
    """Return a validated dataset without ambiguous symptom profiles."""
    if "diseases" not in data.columns:
        raise ValueError("Expected a 'diseases' target column.")

    features = [column for column in data.columns if column != "diseases"]
    if data.empty or not features:
        raise ValueError("The dataset has no training rows or symptom columns.")

    nulls = data.isna().sum()
    blank_strings = {
        column: int(data[column].astype(str).str.strip().eq("").sum())
        for column in data.select_dtypes(include="object").columns
        if data[column].astype(str).str.strip().eq("").any()
    }
    non_binary_values = int((~data[features].isin([0, 1])).to_numpy().sum())
    constant_features = data[features].columns[data[features].nunique(dropna=False).eq(1)].tolist()
    duplicate_rows = int(data.duplicated().sum())

    if nulls.any() or blank_strings or non_binary_values:
        problems = {
            "null_columns": nulls[nulls.gt(0)].to_dict(),
            "blank_string_columns": blank_strings,
            "non_binary_symptom_values": non_binary_values,
        }
        raise ValueError(f"Dataset validation failed: {problems}")

    # A feature profile may occur many times.  Retain it only if it maps to one
    # disease; contradictory labels cannot be learned reliably.
    label_counts = data.groupby(features, dropna=False)["diseases"].nunique()
    ambiguous_profiles = label_counts[label_counts.gt(1)].index
    profile_index = pd.MultiIndex.from_frame(data[features])
    ambiguous_set = set(ambiguous_profiles)
    cleaned = data.loc[~profile_index.isin(ambiguous_set)].copy()

    report = {
        "input_rows": int(len(data)),
        "input_features": int(len(features)),
        "input_classes": int(data["diseases"].nunique()),
        "null_values": 0,
        "blank_string_columns": blank_strings,
        "exact_duplicate_rows": duplicate_rows,
        "non_binary_symptom_values": non_binary_values,
        "constant_features": constant_features,
        "ambiguous_symptom_profiles_removed": int(len(ambiguous_profiles)),
        "rows_removed_for_ambiguous_profiles": int(len(data) - len(cleaned)),
        "training_rows": int(len(cleaned)),
        "training_classes": int(cleaned["diseases"].nunique()),
    }
    return cleaned, features, report


def main() -> None:
    data = pd.read_csv(DATA_PATH)
    cleaned, features, report = validate_and_clean(data)
    x = cleaned[features]
    y = cleaned["diseases"]

    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.20, random_state=RANDOM_STATE, stratify=y
    )
    validation_model = HistGradientBoostingClassifier(**MODEL_PARAMS)
    validation_model.fit(x_train, y_train)
    predicted = validation_model.predict(x_test)
    report["validation"] = {
        "split": "stratified 80/20 split after removing ambiguous profiles",
        "random_state": RANDOM_STATE,
        "accuracy": round(float(accuracy_score(y_test, predicted)), 6),
        "macro_f1": round(float(f1_score(y_test, predicted, average="macro")), 6),
        "test_rows": int(len(y_test)),
    }

    # Refit on every clean record for the application artifact.
    final_model = HistGradientBoostingClassifier(**MODEL_PARAMS)
    final_model.fit(x, y)
    joblib.dump(final_model, MODEL_PATH)
    SYMPTOM_PATH.write_text(json.dumps(features, indent=2), encoding="utf-8")
    REPORT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    print(f"Saved model: {MODEL_PATH}")


if __name__ == "__main__":
    main()

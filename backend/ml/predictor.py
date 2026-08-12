# ============================================================================
# HealthAI - ML Prediction Engine
#
# File:
# backend/ml/predictor.py
#
# ============================================================================

from __future__ import annotations

import json
import traceback
from pathlib import Path

import joblib
import pandas as pd


# ============================================================================
# PATHS
# ============================================================================

MODEL_DIR = Path(__file__).resolve().parent

MODEL_PATH = MODEL_DIR / "best_model.pkl"
SYMPTOM_PATH = MODEL_DIR / "symptom_list.json"
DISEASE_INFO_PATH = MODEL_DIR / "disease_info.json"


# ============================================================================
# GLOBALS
# ============================================================================

MODEL = None
SYMPTOMS = []
DISEASE_INFO = {}


# ============================================================================
# NORMALIZATION
# ============================================================================

def normalize_symptom(value):

    """
    Keep symptoms exactly as trained.

    IMPORTANT:
    Model was trained with spaces.

    Example:
        "abnormal appearing skin"

    NOT:
        "abnormal_appearing_skin"
    """

    if value is None:
        return ""

    return (
        str(value)
        .strip()
        .lower()
    )


# ============================================================================
# JSON LOADER
# ============================================================================

def load_json_file(path, default):

    if not path.is_file():

        print(
            "[ML WARNING] Missing:",
            path,
            flush=True,
        )

        return default

    try:

        with path.open(
            "r",
            encoding="utf-8",
        ) as file:

            return json.load(file)

    except Exception as exc:

        print(
            "[ML ERROR] JSON load failed:",
            repr(exc),
            flush=True,
        )

        traceback.print_exc()

        return default


# ============================================================================
# LOAD MODEL
# ============================================================================

def load_model():

    if not MODEL_PATH.exists():

        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}"
        )


    print(
        "[ML] Loading trained model:",
        MODEL_PATH,
        flush=True,
    )


    model = joblib.load(
        MODEL_PATH
    )


    print(
        "[ML] Model loaded:",
        type(model).__name__,
        flush=True,
    )


    return model



# ============================================================================
# LOAD SYMPTOMS
# ============================================================================

def load_symptoms():

    raw = load_json_file(
        SYMPTOM_PATH,
        [],
    )


    if not isinstance(
        raw,
        list,
    ):

        raise ValueError(
            "symptom_list.json must be list"
        )


    symptoms = []

    seen = set()


    for item in raw:

        symptom = normalize_symptom(
            item
        )


        if symptom and symptom not in seen:

            seen.add(
                symptom
            )

            symptoms.append(
                symptom
            )


    if not symptoms:

        raise ValueError(
            "No symptoms found"
        )


    return symptoms



# ============================================================================
# LOAD DISEASE INFO
# ============================================================================

def load_disease_info():

    data = load_json_file(
        DISEASE_INFO_PATH,
        {},
    )


    if isinstance(
        data,
        dict,
    ):

        return data


    return {}



# ============================================================================
# INITIALIZE
# ============================================================================

def initialize_predictor():

    global MODEL
    global SYMPTOMS
    global DISEASE_INFO


    print(
        "[ML] Initializing prediction engine...",
        flush=True,
    )


    MODEL = load_model()


    #
    # IMPORTANT:
    # Use model feature names.
    # They are the exact training columns.
    #

    if hasattr(
        MODEL,
        "feature_names_in_",
    ):

        SYMPTOMS = [
            normalize_symptom(x)
            for x in MODEL.feature_names_in_
        ]

    else:

        SYMPTOMS = load_symptoms()



    DISEASE_INFO = load_disease_info()


    print(
        "[ML] Symptoms loaded:",
        len(SYMPTOMS),
        flush=True,
    )


    print(
        "[ML] Disease information loaded:",
        len(DISEASE_INFO),
        flush=True,
    )


    print(
        "[ML] Prediction engine ready.",
        flush=True,
    )


    return True



# ============================================================================
# DISEASE INFO
# ============================================================================

def get_disease_info(name):

    if not name:

        return {}


    for key, value in DISEASE_INFO.items():

        if (
            str(key).lower().strip()
            ==
            str(name).lower().strip()
        ):

            return (
                value
                if isinstance(value, dict)
                else {}
            )


    return {}



# ============================================================================
# BUILD FEATURE VECTOR
# ============================================================================

def build_feature_vector(selected_symptoms):


    selected = {

        normalize_symptom(x)

        for x in selected_symptoms

    }


    row = {}


    for feature in SYMPTOMS:

        row[feature] = (

            1

            if feature in selected

            else 0

        )


    return pd.DataFrame(
        [row],
        columns=SYMPTOMS,
    )



# ============================================================================
# CONFIDENCE
# ============================================================================

def calculate_confidence(probabilities):

    if probabilities is None:

        return 0.0


    return round(
        float(max(probabilities)) * 100,
        2,
    )



# ============================================================================
# TOP CANDIDATES
# ============================================================================

def get_top_candidates(probabilities, limit=5):

    if probabilities is None:

        return []


    if not hasattr(
        MODEL,
        "classes_",
    ):

        return []


    results = []


    for disease, prob in zip(
        MODEL.classes_,
        probabilities,
    ):

        results.append({

            "disease":
                str(disease),

            "confidence":
                round(
                    float(prob) * 100,
                    2,
                ),

        })


    results.sort(
        key=lambda x: x["confidence"],
        reverse=True,
    )


    return results[:limit]



# ============================================================================
# MAIN PREDICTION
# ============================================================================

def predict_symptoms(symptoms):


    if MODEL is None:

        raise RuntimeError(
            "ML model not initialized"
        )


    if not isinstance(
        symptoms,
        list,
    ):

        raise TypeError(
            "Symptoms must be list"
        )



    clean = []


    for item in symptoms:

        value = normalize_symptom(
            item
        )


        if value and value not in clean:

            clean.append(
                value
            )


    if not clean:

        raise ValueError(
            "No symptoms provided"
        )



    X = build_feature_vector(
        clean
    )



    prediction = MODEL.predict(
        X
    )


    disease = str(
        prediction[0]
    )



    probabilities = None


    if hasattr(
        MODEL,
        "predict_proba",
    ):

        probabilities = (
            MODEL.predict_proba(X)[0]
        )



    confidence = calculate_confidence(
        probabilities
    )


    candidates = get_top_candidates(
        probabilities
    )



    info = get_disease_info(
        disease
    )



    medicines = info.get(
        "medications",
        [],
    )

    advice = info.get(
        "precautions",
        [],
    )

    diet = info.get(
        "diet",
        [],
    )

    workout = info.get(
        "workout",
        [],
    )



    risk = "unknown"


    if confidence >= 80:

        risk = "high"

    elif confidence >= 50:

        risk = "medium"

    elif confidence > 0:

        risk = "low"



    return {


        "predicted_disease":
            disease,


        "confidence":
            confidence,


        "risk_level":
            risk,


        "top_candidates":
            candidates,


        "disease_symptoms":
            clean,


        "description":
            str(
                info.get(
                    "description",
                    "",
                )
            ),


        "medicines":
            medicines
            if isinstance(medicines,list)
            else [],


        "advice":
            advice
            if isinstance(advice,list)
            else [],


        "diet":
            diet
            if isinstance(diet,list)
            else [],


        "workout":
            workout
            if isinstance(workout,list)
            else [],

    }



# ============================================================================
# STARTUP
# ============================================================================

try:

    initialize_predictor()


except Exception as exc:


    print(
        "[ML ERROR] Predictor failed:",
        repr(exc),
        flush=True,
    )


    traceback.print_exc()
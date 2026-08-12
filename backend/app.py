# ============================================================================
# HealthAI - Flask Backend
#
# File:
# Personalized-HealthCare-Predictor/backend/app.py
#
# Backend:
# http://127.0.0.1:5000
#
# Frontend:
# http://127.0.0.1:8000
#
# Responsibilities:
# - Flask application
# - Database initialization
# - Flask-Login configuration
# - Authentication blueprint
# - User/session APIs
# - Symptoms API
# - Prediction API
# - Prediction history API
#
# Authentication routes are provided by:
# backend/auth.py
#
# Database models are provided by:
# backend/models.py
#
# ML predictor:
# backend/ml/predictor.py
# ============================================================================

import os
import json
import traceback

from flask import (
    Flask,
    jsonify,
    request,
)

from flask_cors import CORS

from flask_login import (
    LoginManager,
    current_user,
    login_required,
)

from models import (
    db,
    User,
    PredictionHistory,
)

from auth import auth_bp


# ============================================================================
# ML PREDICTOR
# ============================================================================

try:
    from ml.predictor import predict_symptoms
    ML_PREDICTOR_AVAILABLE = True

    print(
        "[ML] Predictor imported successfully.",
        flush=True,
    )

except Exception as exc:
    predict_symptoms = None
    ML_PREDICTOR_AVAILABLE = False

    print(
        "[ML ERROR] Could not import ml.predictor:",
        repr(exc),
        flush=True,
    )

    traceback.print_exc()


# ============================================================================
# PATHS
# ============================================================================

BACKEND_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

PROJECT_DIR = os.path.dirname(
    BACKEND_DIR
)

ML_DIR = os.path.join(
    BACKEND_DIR,
    "ml",
)

SYMPTOM_FILE = os.path.join(
    ML_DIR,
    "symptom_list.json",
)

DATABASE_FILE = os.path.join(
    BACKEND_DIR,
    "healthai.db",
)


# ============================================================================
# SERVER CONFIGURATION
# ============================================================================

HOST = "127.0.0.1"

PORT = 5000

FRONTEND_URLS = [
    "http://127.0.0.1:8000",
    "http://localhost:8000",
]


# ============================================================================
# FLASK APPLICATION
# ============================================================================

app = Flask(
    __name__
)


# ============================================================================
# SECRET KEY
# ============================================================================

app.config["SECRET_KEY"] = os.environ.get(
    "HEALTHAI_SECRET_KEY",
    "healthai-development-secret-key-change-this",
)


# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================

database_uri = (
    "sqlite:///"
    + DATABASE_FILE.replace("\\", "/")
)

app.config["SQLALCHEMY_DATABASE_URI"] = (
    database_uri
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = (
    False
)


# ============================================================================
# SESSION CONFIGURATION
# ============================================================================

app.config["SESSION_COOKIE_HTTPONLY"] = True

app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

# Local development uses HTTP.
# Change to True only when using HTTPS.

app.config["SESSION_COOKIE_SECURE"] = False


# ============================================================================
# DATABASE INITIALIZATION
# ============================================================================

db.init_app(
    app
)


# ============================================================================
# FLASK-LOGIN
# ============================================================================

login_manager = LoginManager()

login_manager.init_app(
    app
)


# ============================================================================
# USER LOADER
# ============================================================================

@login_manager.user_loader
def load_user(user_id):

    try:

        return db.session.get(
            User,
            int(user_id),
        )

    except (
        ValueError,
        TypeError,
    ):

        return None

    except Exception as exc:

        print(
            "[LOGIN USER LOADER ERROR]",
            repr(exc),
            flush=True,
        )

        return None


# ============================================================================
# CORS
# ============================================================================

CORS(
    app,
    supports_credentials=True,
    origins=FRONTEND_URLS,
)


# ============================================================================
# AUTHENTICATION BLUEPRINT
# ============================================================================

app.register_blueprint(
    auth_bp
)


# ============================================================================
# LOGIN REQUIRED RESPONSE
# ============================================================================

@login_manager.unauthorized_handler
def unauthorized():

    return jsonify({
        "success": False,
        "error": "Authentication required.",
        "logged_in": False,
    }), 401


# ============================================================================
# SYMPTOM NORMALIZATION
# ============================================================================

def normalize_symptom(value):

    if value is None:
        return ""

    return (
        str(value)
        .strip()
        .lower()
    )

# ============================================================================
# LOAD SYMPTOMS
# ============================================================================

def load_symptoms():

    print(
        "[STARTUP] Loading symptom file:",
        SYMPTOM_FILE,
        flush=True,
    )

    if not os.path.isfile(
        SYMPTOM_FILE
    ):

        print(
            "[WARNING] Symptom file does not exist:",
            SYMPTOM_FILE,
            flush=True,
        )

        return []

    try:

        with open(
            SYMPTOM_FILE,
            "r",
            encoding="utf-8",
        ) as file:

            raw = json.load(file)

        if not isinstance(
            raw,
            list,
        ):

            print(
                "[ERROR] symptom_list.json must contain a JSON list.",
                flush=True,
            )

            return []

        symptoms = []

        seen = set()

        for item in raw:

            symptom = normalize_symptom(
                item
            )

            if (
                symptom
                and symptom not in seen
            ):

                seen.add(
                    symptom
                )

                symptoms.append(
                    symptom
                )

        print(
            "[STARTUP] Symptoms loaded:",
            len(symptoms),
            flush=True,
        )

        return symptoms

    except Exception as exc:

        print(
            "[ERROR] Could not load symptoms:",
            repr(exc),
            flush=True,
        )

        traceback.print_exc()

        return []


# Load once during startup.
SYMPTOM_LIST = load_symptoms()


# ============================================================================
# DATABASE INITIALIZATION
# ============================================================================

def initialize_database():

    print(
        "[STARTUP] Initializing database...",
        flush=True,
    )

    try:

        with app.app_context():

            db.create_all()

        print(
            "[STARTUP] Database ready:",
            DATABASE_FILE,
            flush=True,
        )

    except Exception as exc:

        print(
            "[DATABASE ERROR]",
            repr(exc),
            flush=True,
        )

        traceback.print_exc()

        raise


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route(
    "/health",
    methods=["GET"],
)
def health():

    return jsonify({
        "status": "healthy",
        "success": True,
        "server": "HealthAI Flask API",
        "host": HOST,
        "port": PORT,
        "database": True,
        "symptom_count": len(
            SYMPTOM_LIST
        ),
        "ml_predictor": ML_PREDICTOR_AVAILABLE,
    }), 200


# ============================================================================
# API ROOT
# ============================================================================

@app.route(
    "/api",
    methods=["GET"],
)
def api_root():

    return jsonify({
        "success": True,
        "name": "HealthAI API",
        "version": "1.0",

        "frontend": (
            "http://127.0.0.1:8000"
        ),

        "backend": (
            "http://127.0.0.1:5000"
        ),

        "endpoints": {

            "health":
                "/health",

            "symptoms":
                "/api/symptoms",

            "signup":
                "/api/signup",

            "login":
                "/api/login",

            "logout":
                "/api/logout",

            "forgot":
                "/api/forgot",

            "me":
                "/api/me",

            "predict":
                "/api/predict",

            "history":
                "/api/history",

            "history_record":
                "/api/history/<id>",
        },

    }), 200


# ============================================================================
# SYMPTOMS API
# ============================================================================

@app.route(
"/api/symptoms",
methods=["GET"],
)
def symptoms():

    return jsonify({
        "success": True,
        "count": len(SYMPTOM_LIST),

        # send complete list
        "symptoms": sorted(
            SYMPTOM_LIST
        ),
    }), 200

# ============================================================================
# NORMALIZE PREDICTION INPUT
# ============================================================================

def normalize_symptoms_input(data):

    if not isinstance(
        data,
        dict,
    ):

        return []

    symptoms = data.get(
        "symptoms"
    )

    if symptoms is None:

        symptoms = data.get(
            "selectedSymptoms"
        )

    if symptoms is None:

        symptoms = data.get(
            "symptoms_input"
        )

    if isinstance(
        symptoms,
        str,
    ):

        symptoms = [
            symptoms
        ]

    if not isinstance(
        symptoms,
        list,
    ):

        return []

    result = []

    seen = set()

    for item in symptoms:

        symptom = normalize_symptom(
            item
        )

        if (
            symptom
            and symptom not in seen
        ):

            seen.add(
                symptom
            )

            result.append(
                symptom
            )

    return result


# ============================================================================
# RISK CALCULATOR
# ============================================================================

def calculate_risk(
    confidence,
):

    try:

        confidence = float(
            confidence
        )

    except (
        TypeError,
        ValueError,
    ):

        confidence = 0.0

    if confidence >= 80:

        return "high"

    if confidence >= 50:

        return "medium"

    if confidence > 0:

        return "low"

    return "unknown"


# ============================================================================
# NORMALIZE ML RESULT
# ============================================================================

def normalize_ml_result(
    result,
    symptoms,
):

    if not isinstance(
        result,
        dict,
    ):

        raise ValueError(
            "ML predictor returned an invalid result."
        )

    predicted_disease = (
        result.get("predicted_disease")
        or result.get("disease")
        or result.get("prediction")
        or result.get("diagnosis")
        or result.get("condition")
        or "Unknown"
    )

    confidence_value = (
        result.get("confidence")
        if result.get("confidence") is not None
        else result.get("confidence_score")
    )

    if confidence_value is None:

        confidence_value = result.get(
            "probability",
            0.0,
        )

    try:

        confidence = float(
            confidence_value
        )

    except (
        TypeError,
        ValueError,
    ):

        confidence = 0.0

    # Support both 0.87 and 87.
    if (
        confidence > 0
        and confidence <= 1
    ):

        confidence *= 100.0

    confidence = max(
        0.0,
        min(
            100.0,
            confidence,
        )
    )

    risk_level = (
        result.get("risk_level")
        or result.get("risk")
        or calculate_risk(
            confidence
        )
    )

    top_candidates = (
        result.get("top_candidates")
        or result.get("other_conditions")
        or result.get("possible_conditions")
        or []
    )

    disease_symptoms = (
        result.get("disease_symptoms")
        or result.get("related_symptoms")
        or []
    )

    description = (
        result.get("description")
        or result.get("about")
        or result.get("explanation")
        or ""
    )

    medicines = (
        result.get("medicines")
        or result.get("medications")
        or result.get("recommended_medications")
        or []
    )

    advice = (
        result.get("advice")
        or result.get("precautions")
        or []
    )

    diet = (
        result.get("diet")
        or result.get("diet_plan")
        or []
    )

    workout = (
        result.get("workout")
        or result.get("workout_plan")
        or result.get("lifestyle")
        or []
    )

    return {
        "predicted_disease":
            str(predicted_disease),

        "confidence":
            round(
                confidence,
                2,
            ),

        "risk_level":
            str(risk_level),

        "top_candidates":
            top_candidates
            if isinstance(
                top_candidates,
                list,
            )
            else [],

        "disease_symptoms":
            disease_symptoms
            if isinstance(
                disease_symptoms,
                list,
            )
            else [],

        "description":
            str(description),

        "medicines":
            medicines
            if isinstance(
                medicines,
                list,
            )
            else [],

        "advice":
            advice
            if isinstance(
                advice,
                list,
            )
            else [],

        "diet":
            diet
            if isinstance(
                diet,
                list,
            )
            else [],

        "workout":
            workout
            if isinstance(
                workout,
                list,
            )
            else [],

        "symptoms_input":
            symptoms,
    }


# ============================================================================
# PREDICTION API
# ============================================================================

@app.route(
    "/api/predict",
    methods=["POST"],
)
@login_required
def predict():

    try:

        data = request.get_json(
            silent=True
        ) or {}

        symptoms = normalize_symptoms_input(
            data
        )

        if not symptoms:

            return jsonify({

                "success": False,

                "error":
                    "Please provide at least one symptom.",

            }), 400

        print(
            "[PREDICT]",
            "User:",
            current_user.id,
            "Symptoms:",
            symptoms,
            flush=True,
        )

        # ------------------------------------------------------------
        # REAL ML PREDICTION
        # ------------------------------------------------------------

        if not ML_PREDICTOR_AVAILABLE:

            return jsonify({

                "success": False,

                "error":
                    "ML prediction engine is unavailable.",

            }), 503

        print(
            "[PREDICT] Calling ML predictor...",
            flush=True,
        )

        ml_result = predict_symptoms(
            symptoms
        )

        print(
            "[PREDICT] Raw ML result:",
            ml_result,
            flush=True,
        )

        result = normalize_ml_result(
            ml_result,
            symptoms,
        )

        predicted_disease = (
            result.get(
                "predicted_disease"
            )
            or "Unknown"
        )

        confidence = float(
            result.get(
                "confidence",
                0.0,
            )
        )

        risk_level = (
            result.get(
                "risk_level"
            )
            or calculate_risk(
                confidence
            )
        )

        # ------------------------------------------------------------
        # SAVE PREDICTION HISTORY
        # ------------------------------------------------------------

        history = PredictionHistory(

            user_id=current_user.id,

            symptoms_input=symptoms,

            predicted_disease=(
                predicted_disease
            ),

            confidence=confidence,

            risk_level=risk_level,

            top_candidates=(
                result.get(
                    "top_candidates",
                    [],
                )
            ),

            disease_symptoms=(
                result.get(
                    "disease_symptoms",
                    [],
                )
            ),

            description=(
                result.get(
                    "description",
                    "",
                )
            ),

            medicines=(
                result.get(
                    "medicines",
                    [],
                )
            ),

            advice=(
                result.get(
                    "advice",
                    [],
                )
            ),

            diet=(
                result.get(
                    "diet",
                    [],
                )
            ),

            workout=(
                result.get(
                    "workout",
                    [],
                )
            ),
        )

        db.session.add(
            history
        )

        db.session.commit()

        # ------------------------------------------------------------
        # RESPONSE
        # ------------------------------------------------------------

        response = history.to_dict()

        response["success"] = True

        return jsonify(
            response
        ), 200

    except ValueError as exc:

        db.session.rollback()

        print(
            "[PREDICT VALIDATION ERROR]",
            repr(exc),
            flush=True,
        )

        traceback.print_exc()

        return jsonify({

            "success": False,

            "error":
                str(exc),

        }), 500

    except Exception as exc:

        db.session.rollback()

        print(
            "[PREDICT ERROR]",
            repr(exc),
            flush=True,
        )

        traceback.print_exc()

        return jsonify({

            "success": False,

            "error":
                "Unable to process prediction.",

        }), 500


# ============================================================================
# PREDICTION HISTORY
# ============================================================================

# ============================================================================
# PREDICTION HISTORY - CURRENT USER ONLY
# ============================================================================

@app.route(
    "/api/history",
    methods=["GET"],
)
@login_required
def prediction_history():

    try:

        print(
            "[HISTORY] CURRENT USER:",
            current_user.id,
            flush=True,
        )


        records = (
            PredictionHistory.query

            .filter(
                PredictionHistory.user_id == current_user.id
            )

            # IMPORTANT:
            # ID is safer than created_at
            # because sqlite timestamps can have same second value

            .order_by(
                PredictionHistory.id.desc()
            )

            .all()
        )


        history_data = []


        for record in records:

            item = record.to_dict()


            print(
                "[HISTORY RECORD]",
                {
                    "id": record.id,
                    "user_id": record.user_id,
                    "disease": record.predicted_disease,
                    "symptoms": record.symptoms_input,
                },
                flush=True,
            )


            history_data.append(
                item
            )


        return jsonify({

            "success": True,

            "count":
                len(history_data),

            "history":
                history_data,

        }), 200



    except Exception as exc:


        print(
            "[HISTORY ERROR]",
            repr(exc),
            flush=True,
        )


        traceback.print_exc()


        return jsonify({

            "success": False,

            "error":
                "Unable to load prediction history.",

        }), 500


# ============================================================================
# SINGLE HISTORY RECORD
# ============================================================================

@app.route(
    "/api/history/<int:history_id>",
    methods=["GET"],
)
@login_required
def get_history(
    history_id
):

    try:

        record = (
            PredictionHistory.query

            .filter_by(
                id=history_id,
                user_id=current_user.id,
            )

            .first()
        )

        if record is None:

            return jsonify({

                "success":
                    False,

                "error":
                    "Prediction not found.",

            }), 404

        return jsonify({

            "success":
                True,

            "prediction":
                record.to_dict(),

        }), 200

    except Exception as exc:

        print(
            "[HISTORY RECORD ERROR]",
            repr(exc),
            flush=True,
        )

        traceback.print_exc()

        return jsonify({

            "success":
                False,

            "error":
                "Unable to load prediction.",

        }), 500


# ============================================================================
# DELETE HISTORY RECORD
# ============================================================================

@app.route(
    "/api/history/<int:history_id>",
    methods=["DELETE"],
)
@login_required
def delete_history(
    history_id
):

    try:

        record = (
            PredictionHistory.query

            .filter_by(
                id=history_id,
                user_id=current_user.id,
            )

            .first()
        )

        if record is None:

            return jsonify({

                "success":
                    False,

                "error":
                    "Prediction not found.",

            }), 404

        db.session.delete(
            record
        )

        db.session.commit()

        return jsonify({

            "success":
                True,

            "message":
                "Prediction deleted.",

        }), 200

    except Exception as exc:

        db.session.rollback()

        print(
            "[DELETE HISTORY ERROR]",
            repr(exc),
            flush=True,
        )

        traceback.print_exc()

        return jsonify({

            "success":
                False,

            "error":
                "Unable to delete prediction.",

        }), 500


# ============================================================================
# GLOBAL 404
# ============================================================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({

        "success":
            False,

        "error":
            "API endpoint not found.",

        "path":
            request.path,

    }), 404


# ============================================================================
# GLOBAL 405
# ============================================================================

@app.errorhandler(405)
def method_not_allowed(error):

    return jsonify({

        "success":
            False,

        "error":
            "HTTP method not allowed.",

        "path":
            request.path,

    }), 405


# ============================================================================
# GLOBAL 500
# ============================================================================

@app.errorhandler(500)
def internal_error(error):

    try:

        db.session.rollback()

    except Exception:

        pass

    return jsonify({

        "success":
            False,

        "error":
            "Internal server error.",

    }), 500


# ============================================================================
# STARTUP INFORMATION
# ============================================================================

def print_startup():

    print()

    print("=" * 72)

    print(
        "                         HEALTHAI"
    )

    print("=" * 72)

    print(
        "PROJECT DIR :",
        PROJECT_DIR,
    )

    print(
        "BACKEND DIR :",
        BACKEND_DIR,
    )

    print(
        "ML DIR      :",
        ML_DIR,
    )

    print(
        "DATABASE    :",
        DATABASE_FILE,
    )

    print(
        "SYMPTOMS    :",
        len(SYMPTOM_LIST),
    )

    print(
        "ML PREDICTOR:",
        "READY"
        if ML_PREDICTOR_AVAILABLE
        else "UNAVAILABLE",
    )

    print()

    print(
        "Frontend:"
    )

    print(
        "http://127.0.0.1:8000"
    )

    print()

    print(
        "Flask API:"
    )

    print(
        "http://127.0.0.1:5000"
    )

    print()

    print(
        "Health:"
    )

    print(
        "GET  /health"
    )

    print()

    print(
        "API:"
    )

    print(
        "GET  /api"
    )

    print()

    print(
        "Symptoms:"
    )

    print(
        "GET  /api/symptoms"
    )

    print()

    print(
        "Authentication:"
    )

    print(
        "POST /api/signup"
    )

    print(
        "POST /api/login"
    )

    print(
        "POST /api/logout"
    )

    print(
        "POST /api/forgot"
    )

    print(
        "GET  /api/me"
    )

    print()

    print(
        "Prediction:"
    )

    print(
        "POST /api/predict"
    )

    print()

    print(
        "History:"
    )

    print(
        "GET    /api/history"
    )

    print(
        "GET    /api/history/<id>"
    )

    print(
        "DELETE /api/history/<id>"
    )

    print()

    print("=" * 72)

    print(
        "HEALTHAI BACKEND READY"
    )

    print("=" * 72)

    print()


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":

    initialize_database()

    print_startup()

    app.run(
        host=HOST,
        port=PORT,
        debug=True,
    )
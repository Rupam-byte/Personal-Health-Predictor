# ============================================================================
# HealthAI - Database Models
# Save as: models.py
# ============================================================================

from datetime import datetime

from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import (
    generate_password_hash,
    check_password_hash,
)


# ============================================================================
# DATABASE
# ============================================================================

db = SQLAlchemy()


# ============================================================================
# USER
# ============================================================================

class User(db.Model, UserMixin):
    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    name = db.Column(
        db.String(120),
        nullable=False,
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False,
        index=True,
    )

    password_hash = db.Column(
        db.String(255),
        nullable=False,
    )

    role = db.Column(
        db.String(20),
        nullable=False,
        default="user",
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    # ------------------------------------------------------------------------
    # BRUTE FORCE PROTECTION
    # ------------------------------------------------------------------------

    failed_attempts = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    locked_until = db.Column(
        db.DateTime,
        nullable=True,
    )

    # ------------------------------------------------------------------------
    # RELATIONSHIP
    # ------------------------------------------------------------------------

    predictions = db.relationship(
        "PredictionHistory",
        backref="user",
        lazy=True,
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    # ------------------------------------------------------------------------
    # PASSWORD
    # ------------------------------------------------------------------------

    def set_password(self, raw_password):
        if not isinstance(raw_password, str):
            raise TypeError("Password must be a string.")

        if not raw_password:
            raise ValueError("Password cannot be empty.")

        self.password_hash = generate_password_hash(
            raw_password
        )

    def check_password(self, raw_password):
        if not isinstance(raw_password, str):
            return False

        if not self.password_hash:
            return False

        try:
            return check_password_hash(
                self.password_hash,
                raw_password,
            )
        except Exception:
            return False

    # ------------------------------------------------------------------------
    # ACCOUNT LOCK
    # ------------------------------------------------------------------------

    def is_locked(self):
        return (
            self.locked_until is not None
            and self.locked_until > datetime.utcnow()
        )

    # ------------------------------------------------------------------------
    # SERIALIZATION
    # ------------------------------------------------------------------------

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
        }


# ============================================================================
# PREDICTION HISTORY
# ============================================================================

class PredictionHistory(db.Model):
    __tablename__ = "prediction_history"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # Symptoms entered by this account
    symptoms_input = db.Column(
        db.JSON,
        nullable=False,
    )

    # Main prediction
    predicted_disease = db.Column(
        db.String(120),
        nullable=False,
        index=True,
    )

    confidence = db.Column(
        db.Float,
        nullable=False,
    )

    risk_level = db.Column(
        db.String(20),
        nullable=False,
        index=True,
    )

    # Complete prediction report
    top_candidates = db.Column(
        db.JSON,
        nullable=True,
    )

    disease_symptoms = db.Column(
        db.JSON,
        nullable=True,
    )

    description = db.Column(
        db.Text,
        nullable=True,
    )

    medicines = db.Column(
        db.JSON,
        nullable=True,
    )

    advice = db.Column(
        db.JSON,
        nullable=True,
    )

    diet = db.Column(
        db.JSON,
        nullable=True,
    )

    workout = db.Column(
        db.JSON,
        nullable=True,
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    # ------------------------------------------------------------------------
    # SERIALIZATION
    # ------------------------------------------------------------------------

    def to_dict(self):
        return {
            "id": self.id,

            "user_id": self.user_id,

            "symptoms_input": (
                self.symptoms_input
                if isinstance(self.symptoms_input, list)
                else []
            ),

            "predicted_disease": (
                self.predicted_disease or ""
            ),

            "confidence": (
                float(self.confidence)
                if self.confidence is not None
                else 0.0
            ),

            "risk_level": (
                self.risk_level or "unknown"
            ),

            "top_candidates": (
                self.top_candidates
                if isinstance(self.top_candidates, list)
                else []
            ),

            "disease_symptoms": (
                self.disease_symptoms
                if isinstance(self.disease_symptoms, list)
                else []
            ),

            "description": (
                self.description or ""
            ),

            "medicines": (
                self.medicines
                if isinstance(self.medicines, list)
                else []
            ),

            "advice": (
                self.advice
                if isinstance(self.advice, list)
                else []
            ),

            "diet": (
                self.diet
                if isinstance(self.diet, list)
                else []
            ),

            "workout": (
                self.workout
                if isinstance(self.workout, list)
                else []
            ),

            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
        }

import re
import traceback

from flask import Blueprint, jsonify, request
from flask_login import (
    current_user,
    login_user,
    logout_user,
)
from werkzeug.security import (
    generate_password_hash,
    check_password_hash,
)

from models import db, User


# ============================================================================
# BLUEPRINT
# ============================================================================

auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api",
)


# ============================================================================
# HELPERS
# ============================================================================

def user_to_dict(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
    }


def valid_password(password):
    if len(password) < 8:
        return False

    if not re.search(r"[A-Z]", password):
        return False

    if not re.search(r"[a-z]", password):
        return False

    if not re.search(r"[0-9]", password):
        return False

    return True


# ============================================================================
# SIGNUP
# ============================================================================

@auth_bp.route("/signup", methods=["POST"])
def signup():

    try:

        data = request.get_json(silent=True) or {}

        name = str(
            data.get("name", "")
        ).strip()

        email = str(
            data.get("email", "")
        ).strip().lower()

        password = str(
            data.get("password", "")
        )

        if not name or not email or not password:

            return jsonify({
                "success": False,
                "error": "Name, email and password are required.",
            }), 400

        if not valid_password(password):

            return jsonify({
                "success": False,
                "error": (
                    "Password must be at least 8 characters "
                    "and contain uppercase, lowercase and number."
                ),
            }), 400

        existing_user = User.query.filter_by(
            email=email
        ).first()

        if existing_user:

            return jsonify({
                "success": False,
                "error": "An account with this email already exists.",
            }), 409

        user = User(
            name=name,
            email=email,
            password_hash=generate_password_hash(password),
        )

        db.session.add(user)
        db.session.commit()

        login_user(
            user,
            remember=False,
        )

        return jsonify({
            "success": True,
            "message": "Account created successfully.",
            "user": user_to_dict(user),
        }), 201

    except Exception as exc:

        db.session.rollback()

        print(
            "[SIGNUP ERROR]",
            repr(exc),
            flush=True,
        )

        traceback.print_exc()

        return jsonify({
            "success": False,
            "error": "Unable to create account.",
        }), 500


# ============================================================================
# LOGIN
# ============================================================================

@auth_bp.route("/login", methods=["POST"])
def login():

    try:

        data = request.get_json(silent=True) or {}

        email = str(
            data.get("email", "")
        ).strip().lower()

        password = str(
            data.get("password", "")
        )

        remember = bool(
            data.get("remember", False)
        )

        print(
            "[LOGIN] Attempt:",
            email,
            flush=True,
        )

        if not email or not password:

            return jsonify({
                "success": False,
                "error": "Email and password are required.",
            }), 400

        user = User.query.filter_by(
            email=email
        ).first()

        if user is None:

            print(
                "[LOGIN] User not found:",
                email,
                flush=True,
            )

            return jsonify({
                "success": False,
                "error": "Invalid email or password.",
            }), 401

        password_hash = getattr(
            user,
            "password_hash",
            None,
        )

        if not password_hash:

            print(
                "[LOGIN] Password hash missing:",
                user.id,
                flush=True,
            )

            return jsonify({
                "success": False,
                "error": "Account password is not configured.",
            }), 401

        password_valid = check_password_hash(
            password_hash,
            password,
        )

        if not password_valid:

            print(
                "[LOGIN] Password mismatch:",
                email,
                flush=True,
            )

            return jsonify({
                "success": False,
                "error": "Invalid email or password.",
            }), 401

        login_user(
            user,
            remember=remember,
        )

        print(
            "[LOGIN] SUCCESS:",
            user.id,
            email,
            flush=True,
        )

        return jsonify({
            "success": True,
            "message": "Login successful.",
            "user": user_to_dict(user),
        }), 200

    except Exception as exc:

        print(
            "[LOGIN ERROR]",
            repr(exc),
            flush=True,
        )

        traceback.print_exc()

        return jsonify({
            "success": False,
            "error": "Unable to process login.",
        }), 500


# ============================================================================
# FORGOT / RESET PASSWORD
# ============================================================================

@auth_bp.route("/forgot", methods=["POST"])
def forgot():

    print(
        "[FORGOT] POST REQUEST RECEIVED",
        flush=True,
    )

    try:

        data = request.get_json(silent=True)

        print(
            "[FORGOT] Request JSON:",
            data,
            flush=True,
        )

        if not isinstance(data, dict):

            return jsonify({
                "success": False,
                "error": "Invalid JSON request.",
            }), 400

        email = str(
            data.get("email", "")
        ).strip().lower()

        new_password = str(
            data.get("newPassword", "")
        )

        print(
            "[FORGOT] Email:",
            email,
            flush=True,
        )

        print(
            "[FORGOT] New password received:",
            bool(new_password),
            flush=True,
        )

        # --------------------------------------------------------------------
        # VALIDATION
        # --------------------------------------------------------------------

        if not email or not new_password:

            print(
                "[FORGOT] Missing email or new password.",
                flush=True,
            )

            return jsonify({
                "success": False,
                "error": "Email and new password are required.",
            }), 400

        if not valid_password(new_password):

            print(
                "[FORGOT] Invalid password format.",
                flush=True,
            )

            return jsonify({
                "success": False,
                "error": (
                    "Password must be at least 8 characters "
                    "and contain uppercase, lowercase and number."
                ),
            }), 400

        # --------------------------------------------------------------------
        # FIND USER
        # --------------------------------------------------------------------

        user = User.query.filter_by(
            email=email
        ).first()

        if user is None:

            print(
                "[FORGOT] USER NOT FOUND:",
                email,
                flush=True,
            )

            return jsonify({
                "success": False,
                "error": "No account was found with that email.",
            }), 404

        print(
            "[FORGOT] User found:",
            user.id,
            email,
            flush=True,
        )

        # --------------------------------------------------------------------
        # CREATE NEW HASH
        # --------------------------------------------------------------------

        new_hash = generate_password_hash(
            new_password
        )

        # --------------------------------------------------------------------
        # UPDATE EXACT SAME FIELD USED BY LOGIN
        # --------------------------------------------------------------------

        user.password_hash = new_hash

        # --------------------------------------------------------------------
        # COMMIT
        # --------------------------------------------------------------------

        db.session.commit()

        print(
            "[FORGOT] Database commit completed.",
            flush=True,
        )

        # --------------------------------------------------------------------
        # VERIFY DATABASE VALUE
        # --------------------------------------------------------------------

        db.session.expire(
            user
        )

        db.session.refresh(
            user
        )

        saved_hash = user.password_hash

        if not saved_hash:

            print(
                "[FORGOT] ERROR: password_hash is empty after commit.",
                flush=True,
            )

            return jsonify({
                "success": False,
                "error": "Password reset was not saved.",
            }), 500

        if not check_password_hash(
            saved_hash,
            new_password,
        ):

            print(
                "[FORGOT] ERROR: saved password verification failed.",
                flush=True,
            )

            return jsonify({
                "success": False,
                "error": "Password reset verification failed.",
            }), 500

        print(
            "[FORGOT] PASSWORD UPDATED SUCCESSFULLY:",
            email,
            "USER ID:",
            user.id,
            flush=True,
        )

        return jsonify({
            "success": True,
            "message": "Password reset successfully.",
        }), 200

    except Exception as exc:

        db.session.rollback()

        print(
            "[FORGOT ERROR]",
            repr(exc),
            flush=True,
        )

        traceback.print_exc()

        return jsonify({
            "success": False,
            "error": "Unable to reset password.",
        }), 500


# ============================================================================
# LOGOUT
# ============================================================================

@auth_bp.route("/logout", methods=["POST"])
def logout():

    try:

        logout_user()

        return jsonify({
            "success": True,
            "message": "Logged out successfully.",
        }), 200

    except Exception as exc:

        print(
            "[LOGOUT ERROR]",
            repr(exc),
            flush=True,
        )

        return jsonify({
            "success": False,
            "error": "Unable to logout.",
        }), 500


# ============================================================================
# CURRENT USER
# ============================================================================

@auth_bp.route("/me", methods=["GET"])
def me():

    if not current_user.is_authenticated:

        return jsonify({
            "success": True,
            "logged_in": False,
            "user": None,
        }), 200

    return jsonify({
        "success": True,
        "logged_in": True,
        "user": user_to_dict(current_user),
    }), 200

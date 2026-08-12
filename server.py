# ============================================================================
# HealthAI - Frontend Server
#
# File:
#     Personalized-HealthCare-Predictor/server.py
#
# RESPONSIBILITY:
#     Serve ONLY frontend files.
#
# FRONTEND:
#     http://127.0.0.1:8000
#
# BACKEND:
#     http://127.0.0.1:5000
#
# This server DOES NOT:
#     - authenticate users
#     - access the database
#     - run predictions
#     - handle API POST requests
#     - handle Flask routes
# ============================================================================

from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import unquote
import mimetypes
import os
import traceback


# ============================================================================
# PATHS
# ============================================================================

PROJECT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)


# ============================================================================
# SERVER CONFIGURATION
# ============================================================================

HOST = "127.0.0.1"
PORT = 8000

BACKEND_HOST = "127.0.0.1"
BACKEND_PORT = 5000

BACKEND_URL = (
    f"http://{BACKEND_HOST}:{BACKEND_PORT}"
)


# ============================================================================
# DEFAULT PAGE
# ============================================================================

DEFAULT_PAGE = "login.html"


# ============================================================================
# FRONTEND FILE TYPES
# ============================================================================

ALLOWED_EXTENSIONS = {
    ".html",
    ".css",
    ".js",
    ".json",

    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".webp",

    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
}


# ============================================================================
# MIME TYPES
# ============================================================================

MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",

    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".webp": "image/webp",

    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
}


# ============================================================================
# SAFE FILE PATH
# ============================================================================

def safe_file_path(request_path):
    """
    Convert browser URL into a safe project filesystem path.

    Prevents:
        ../
        ../../
        encoded path traversal
    """

    try:
        decoded_path = unquote(request_path)

        # Remove query string
        decoded_path = decoded_path.split(
            "?",
            1
        )[0]

        # Remove fragment
        decoded_path = decoded_path.split(
            "#",
            1
        )[0]

        # Root -> login.html
        if decoded_path in ("", "/"):
            decoded_path = "/" + DEFAULT_PAGE

        relative_path = decoded_path.lstrip("/")

        candidate = os.path.abspath(
            os.path.join(
                PROJECT_DIR,
                relative_path
            )
        )

        project_root = os.path.abspath(
            PROJECT_DIR
        )

        try:
            common = os.path.commonpath(
                [
                    project_root,
                    candidate
                ]
            )

        except ValueError:
            return None

        # Block ../ traversal
        if common != project_root:
            return None

        return candidate

    except Exception:
        return None


# ============================================================================
# RESPONSE HELPERS
# ============================================================================

def send_bytes(
    handler,
    status_code,
    content,
    content_type
):
    try:
        handler.send_response(
            status_code
        )

        handler.send_header(
            "Content-Type",
            content_type
        )

        handler.send_header(
            "Content-Length",
            str(len(content))
        )

        handler.send_header(
            "Cache-Control",
            "no-cache"
        )

        handler.end_headers()

        handler.wfile.write(
            content
        )

        handler.wfile.flush()

    except BrokenPipeError:
        print(
            "[WARNING] Browser disconnected.",
            flush=True
        )

    except ConnectionResetError:
        print(
            "[WARNING] Connection reset by browser.",
            flush=True
        )


# ============================================================================
# ERROR PAGE
# ============================================================================

def send_error_page(
    handler,
    status_code,
    message
):
    body = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">
    <title>HealthAI - Error</title>
</head>

<body>

    <h1>{status_code}</h1>

    <p>{message}</p>

</body>
</html>
"""

    send_bytes(
        handler,
        status_code,
        body.encode("utf-8"),
        "text/html; charset=utf-8"
    )


# ============================================================================
# HTTP HANDLER
# ============================================================================

class HealthAIFrontendHandler(
    BaseHTTPRequestHandler
):

    # ------------------------------------------------------------------------
    # LOGGING
    # ------------------------------------------------------------------------

    def log_message(
        self,
        format_string,
        *args
    ):
        print(
            "[HTTP]",
            self.client_address[0],
            "-",
            format_string % args,
            flush=True
        )

    # ------------------------------------------------------------------------
    # OPTIONS
    # ------------------------------------------------------------------------

    def do_OPTIONS(self):

        print(
            "[OPTIONS]",
            repr(self.path),
            flush=True
        )

        self.send_response(204)

        self.send_header(
            "Access-Control-Allow-Origin",
            "*"
        )

        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, HEAD, OPTIONS"
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "*"
        )

        self.send_header(
            "Content-Length",
            "0"
        )

        self.end_headers()

    # ------------------------------------------------------------------------
    # GET
    # ------------------------------------------------------------------------

    def do_GET(self):

        print(
            "[GET ENTERED]",
            repr(self.path),
            flush=True
        )

        try:

            path = self.path.split(
                "?",
                1
            )[0]

            # ================================================================
            # FRONTEND HEALTH
            # ================================================================

            if path == "/server-health":

                body = (
                    "HealthAI frontend server is running."
                ).encode("utf-8")

                send_bytes(
                    self,
                    200,
                    body,
                    "text/plain; charset=utf-8"
                )

                return

            # ================================================================
            # BLOCK BACKEND ROUTES
            #
            # These belong to Flask :5000.
            # ================================================================

            if (
                path == "/api"
                or path.startswith("/api/")
                or path == "/health"
                or path == "/predict"
            ):

                send_error_page(
                    self,
                    404,
                    (
                        "This is the HealthAI frontend server. "
                        "API requests must be sent to "
                        f"{BACKEND_URL}"
                    )
                )

                return

            # ================================================================
            # RESOLVE FILE
            # ================================================================

            file_path = safe_file_path(
                path
            )

            if file_path is None:

                print(
                    "[FORBIDDEN]",
                    path,
                    flush=True
                )

                send_error_page(
                    self,
                    403,
                    "Forbidden."
                )

                return

            # ================================================================
            # FILE EXISTS
            # ================================================================

            if not os.path.isfile(file_path):

                print(
                    "[FILE NOT FOUND]",
                    file_path,
                    flush=True
                )

                send_error_page(
                    self,
                    404,
                    "File not found."
                )

                return

            # ================================================================
            # EXTENSION
            # ================================================================

            extension = os.path.splitext(
                file_path
            )[1].lower()

            if extension not in ALLOWED_EXTENSIONS:

                print(
                    "[FILE TYPE BLOCKED]",
                    file_path,
                    flush=True
                )

                send_error_page(
                    self,
                    403,
                    "File type not allowed."
                )

                return

            # ================================================================
            # READ FILE
            # ================================================================

            with open(
                file_path,
                "rb"
            ) as file:

                content = file.read()

            # ================================================================
            # MIME TYPE
            # ================================================================

            content_type = MIME_TYPES.get(
                extension
            )

            if content_type is None:

                content_type, _ = (
                    mimetypes.guess_type(
                        file_path
                    )
                )

            if content_type is None:

                content_type = (
                    "application/octet-stream"
                )

            # ================================================================
            # SEND FILE
            # ================================================================

            send_bytes(
                self,
                200,
                content,
                content_type
            )

            print(
                "[FILE SERVED]",
                file_path,
                flush=True
            )

        except BrokenPipeError:

            print(
                "[WARNING] Browser disconnected.",
                flush=True
            )

        except ConnectionResetError:

            print(
                "[WARNING] Connection reset.",
                flush=True
            )

        except Exception as exc:

            print(
                "[GET ERROR]",
                repr(exc),
                flush=True
            )

            traceback.print_exc()

            try:

                send_error_page(
                    self,
                    500,
                    "Frontend server error."
                )

            except Exception:
                pass

    # ------------------------------------------------------------------------
    # HEAD
    # ------------------------------------------------------------------------

    def do_HEAD(self):

        print(
            "[HEAD ENTERED]",
            repr(self.path),
            flush=True
        )

        try:

            path = self.path.split(
                "?",
                1
            )[0]

            # Backend routes do not belong here
            if (
                path == "/api"
                or path.startswith("/api/")
                or path == "/health"
                or path == "/predict"
            ):

                self.send_response(404)

                self.send_header(
                    "Content-Length",
                    "0"
                )

                self.end_headers()

                return

            file_path = safe_file_path(
                path
            )

            if (
                file_path is None
                or not os.path.isfile(file_path)
            ):

                self.send_response(404)

                self.send_header(
                    "Content-Length",
                    "0"
                )

                self.end_headers()

                return

            extension = os.path.splitext(
                file_path
            )[1].lower()

            if extension not in ALLOWED_EXTENSIONS:

                self.send_response(403)

                self.send_header(
                    "Content-Length",
                    "0"
                )

                self.end_headers()

                return

            content_type = MIME_TYPES.get(
                extension,
                "application/octet-stream"
            )

            file_size = os.path.getsize(
                file_path
            )

            self.send_response(200)

            self.send_header(
                "Content-Type",
                content_type
            )

            self.send_header(
                "Content-Length",
                str(file_size)
            )

            self.send_header(
                "Cache-Control",
                "no-cache"
            )

            self.end_headers()

        except Exception as exc:

            print(
                "[HEAD ERROR]",
                repr(exc),
                flush=True
            )

            try:

                self.send_response(500)

                self.send_header(
                    "Content-Length",
                    "0"
                )

                self.end_headers()

            except Exception:
                pass

    # ------------------------------------------------------------------------
    # POST
    # ------------------------------------------------------------------------

    def do_POST(self):

        print(
            "[POST ENTERED]",
            repr(self.path),
            flush=True
        )

        # ================================================================
        # IMPORTANT
        #
        # The frontend server NEVER processes POST requests.
        #
        # All POST requests must go to Flask :5000.
        # ================================================================

        send_error_page(
            self,
            405,
            (
                "POST requests belong to the HealthAI Flask backend at "
                f"{BACKEND_URL}"
            )
        )


# ============================================================================
# MAIN
# ============================================================================

def main():

    print()
    print("=" * 72)
    print("                         HEALTHAI FRONTEND")
    print("=" * 72)

    print(
        "PROJECT ROOT:",
        PROJECT_DIR
    )

    print(
        "FRONTEND:",
        f"http://{HOST}:{PORT}"
    )

    print(
        "BACKEND:",
        BACKEND_URL
    )

    print()

    print("Pages:")
    print(
        f"  Login:      http://{HOST}:{PORT}/login.html"
    )
    print(
        f"  Signup:     http://{HOST}:{PORT}/signup.html"
    )
    print(
        f"  Forgot:     http://{HOST}:{PORT}/forgot.html"
    )
    print(
        f"  Home:       http://{HOST}:{PORT}/index.html"
    )
    print(
        f"  Prediction:  http://{HOST}:{PORT}/prediction.html"
    )
    print(
        f"  Diagnosis:   http://{HOST}:{PORT}/diagnosis.html"
    )

    print()

    print(
        "Frontend health:"
    )

    print(
        f"  http://{HOST}:{PORT}/server-health"
    )

    print()

    print(
        "Flask backend:"
    )

    print(
        f"  {BACKEND_URL}"
    )

    print()

    print("=" * 72)
    print(
        "WAITING FOR FRONTEND REQUESTS..."
    )
    print("=" * 72)

    server = HTTPServer(
        (
            HOST,
            PORT
        ),
        HealthAIFrontendHandler
    )

    try:

        server.serve_forever()

    except KeyboardInterrupt:

        print()
        print(
            "Frontend server stopped."
        )

    except Exception as exc:

        print()
        print(
            "[SERVER ERROR]",
            repr(exc)
        )

        traceback.print_exc()

    finally:

        server.server_close()

        print(
            "Frontend server closed."
        )


# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    main()
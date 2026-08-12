from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
import traceback

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SYMPTOM_FILE = os.path.join(
    BASE_DIR,
    "backend",
    "ml",
    "symptom_list.json"
)


def load_symptoms():
    print("Loading:", SYMPTOM_FILE, flush=True)

    with open(SYMPTOM_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise RuntimeError(
            "symptom_list.json must contain a JSON list"
        )

    result = []

    for item in data:
        value = str(item).strip().lower().replace(" ", "_")

        if value and value not in result:
            result.append(value)

    return result


try:
    SYMPTOMS = load_symptoms()

    print(
        "SUCCESS: loaded",
        len(SYMPTOMS),
        "symptoms",
        flush=True
    )

except Exception:
    print("FAILED TO LOAD SYMPTOMS", flush=True)
    traceback.print_exc()
    SYMPTOMS = []


class TestHandler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        print(
            "[HTTP]",
            self.client_address,
            format % args,
            flush=True
        )

    def send_json(self, status, data):

        body = json.dumps(
            data,
            ensure_ascii=False
        ).encode("utf-8")

        self.send_response(status)

        self.send_header(
            "Content-Type",
            "application/json; charset=utf-8"
        )

        self.send_header(
            "Content-Length",
            str(len(body))
        )

        self.send_header(
            "Access-Control-Allow-Origin",
            "*"
        )

        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS"
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        )

        self.end_headers()

        self.wfile.write(body)

    def do_OPTIONS(self):

        self.send_response(204)

        self.send_header(
            "Access-Control-Allow-Origin",
            "*"
        )

        self.send_header(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS"
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        )

        self.send_header(
            "Content-Length",
            "0"
        )

        self.end_headers()

    def do_GET(self):

        print(
            "REQUEST RECEIVED:",
            repr(self.path),
            flush=True
        )

        try:

            path = self.path.split("?", 1)[0]

            if path == "/api/symptoms":

                print(
                    "SYMPTOM API CALLED",
                    flush=True
                )

                self.send_json(
                    200,
                    {
                        "success": True,
                        "count": len(SYMPTOMS),
                        "symptoms": SYMPTOMS
                    }
                )

                print(
                    "SYMPTOM RESPONSE SENT",
                    flush=True
                )

                return

            if path == "/health":

                self.send_json(
                    200,
                    {
                        "status": "healthy",
                        "symptom_count": len(SYMPTOMS)
                    }
                )

                return

            self.send_json(
                404,
                {
                    "success": False,
                    "error": "Not found"
                }
            )

        except Exception as exc:

            print(
                "REQUEST ERROR:",
                repr(exc),
                flush=True
            )

            traceback.print_exc()

            try:
                self.send_json(
                    500,
                    {
                        "success": False,
                        "error": str(exc)
                    }
                )
            except Exception:
                traceback.print_exc()


print()
print("=" * 60)
print("TEST SERVER")
print("=" * 60)
print("Symptoms:", len(SYMPTOMS))
print("URL: http://127.0.0.1:5001")
print("API: http://127.0.0.1:5001/api/symptoms")
print("=" * 60)
print()

server = ThreadingHTTPServer(
    ("127.0.0.1", 5001),
    TestHandler
)

try:
    server.serve_forever()

except KeyboardInterrupt:
    print("Stopping...")

finally:
    server.server_close()
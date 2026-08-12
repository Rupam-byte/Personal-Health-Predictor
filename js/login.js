document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        console.error("[LOGIN] loginForm not found.");
        return;
    }

    console.log("[LOGIN] JavaScript loaded.");

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();
        event.stopPropagation();

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        const rememberInput = loginForm.querySelector(
            'input[type="checkbox"]'
        );

        if (!emailInput || !passwordInput) {
            console.error("[LOGIN] Required input missing.");
            alert("Login form is incomplete.");
            return;
        }

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        const remember = rememberInput
            ? rememberInput.checked
            : false;

        if (!email || !password) {
            alert(
                "Please enter your email and password."
            );
            return;
        }

        const submitButton = loginForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Logging in...";
        }

        try {

            console.log(
                "[LOGIN] Sending POST /api/login"
            );

            const response = await fetch(
                "http://127.0.0.1:5000/api/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        email: email,
                        password: password,
                        remember: remember
                    })
                }
            );

            console.log(
                "[LOGIN] HTTP status:",
                response.status
            );

            const result = await response.json();

            console.log(
                "[LOGIN] Server response:",
                result
            );

            if (response.ok && result.success) {

                if (result.user) {

                    localStorage.setItem(
                        "currentUser",
                        JSON.stringify(result.user)
                    );
                }

                alert("Login successful.");

                window.location.replace(
                    "index.html"
                );

                return;
            }

            alert(
                result.error ||
                "Invalid email or password."
            );

        } catch (error) {

            console.error(
                "[LOGIN] Connection error:",
                error
            );

            alert(
                "Unable to connect to HealthAI backend.\n\n" +
                "Make sure backend/app.py is running on:\n" +
                "http://127.0.0.1:5000"
            );

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Login";
            }
        }
    });


    // ------------------------------------------------------------------------
    // PASSWORD VISIBILITY
    // ------------------------------------------------------------------------

    const togglePassword = document.getElementById(
        "togglePassword"
    );

    const passwordInput = document.getElementById(
        "password"
    );

    if (togglePassword && passwordInput) {

        togglePassword.addEventListener(
            "click",
            () => {

                if (passwordInput.type === "password") {

                    passwordInput.type = "text";

                    togglePassword.classList.remove(
                        "fa-eye"
                    );

                    togglePassword.classList.add(
                        "fa-eye-slash"
                    );

                } else {

                    passwordInput.type = "password";

                    togglePassword.classList.remove(
                        "fa-eye-slash"
                    );

                    togglePassword.classList.add(
                        "fa-eye"
                    );
                }
            }
        );
    }
});

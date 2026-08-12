
document.addEventListener("DOMContentLoaded", () => {

    const signupForm = document.getElementById("signupForm");

    if (!signupForm) {
        console.error("[SIGNUP] signupForm not found.");
        return;
    }

    console.log("[SIGNUP] JavaScript loaded.");

    signupForm.addEventListener("submit", async (event) => {

        // VERY IMPORTANT:
        // Prevent normal browser GET submission.
        event.preventDefault();
        event.stopPropagation();

        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        if (!nameInput || !emailInput || !passwordInput) {
            console.error("[SIGNUP] Required input missing.");
            alert("Signup form is incomplete.");
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        if (!name || !email || !password) {
            alert("Please fill in all fields.");
            return;
        }

        if (password.length < 8) {
            alert("Password must be at least 8 characters.");
            return;
        }

        if (!/[A-Z]/.test(password)) {
            alert(
                "Password must include at least one uppercase letter."
            );
            return;
        }

        if (!/[a-z]/.test(password)) {
            alert(
                "Password must include at least one lowercase letter."
            );
            return;
        }

        if (!/[0-9]/.test(password)) {
            alert(
                "Password must include at least one number."
            );
            return;
        }

        const submitButton = signupForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Creating Account...";
        }

        try {

            console.log(
                "[SIGNUP] Sending POST /api/signup"
            );

            const response = await fetch(
                "http://127.0.0.1:5000/api/signup",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );

            console.log(
                "[SIGNUP] HTTP status:",
                response.status
            );

            const result = await response.json();

            console.log(
                "[SIGNUP] Server response:",
                result
            );

            if (response.ok && result.success) {

                if (result.user) {

                    localStorage.setItem(
                        "currentUser",
                        JSON.stringify(result.user)
                    );
                }

                alert(
                    "Account created successfully."
                );

                window.location.replace(
                    "index.html"
                );

                return;
            }

            alert(
                result.error ||
                "Unable to create account."
            );

        } catch (error) {

            console.error(
                "[SIGNUP] Connection error:",
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
                submitButton.textContent = "Create Account";
            }
        }
    });
});


document.addEventListener("DOMContentLoaded", function () {

    console.log("[FORGOT] DOM loaded.");

    const forgotForm = document.getElementById("forgotForm");

    if (!forgotForm) {
        console.error("[FORGOT] ERROR: #forgotForm was not found.");
        alert("Forgot-password form was not found.");
        return;
    }

    console.log("[FORGOT] Form found.");

    forgotForm.addEventListener("submit", async function (event) {

        event.preventDefault();
        event.stopPropagation();

        console.log("[FORGOT] SUBMIT EVENT FIRED.");

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("newPassword");

        if (!emailInput || !passwordInput) {
            console.error(
                "[FORGOT] Missing input:",
                {
                    email: !!emailInput,
                    newPassword: !!passwordInput
                }
            );

            alert("Reset password form is incomplete.");
            return;
        }

        const email = emailInput.value.trim().toLowerCase();
        const newPassword = passwordInput.value;

        console.log("[FORGOT] Email:", email);
        console.log(
            "[FORGOT] New password length:",
            newPassword.length
        );

        if (!email || !newPassword) {
            alert("Please enter your email and new password.");
            return;
        }

        if (newPassword.length < 8) {
            alert("Password must be at least 8 characters.");
            return;
        }

        if (!/[A-Z]/.test(newPassword)) {
            alert("Password must contain an uppercase letter.");
            return;
        }

        if (!/[a-z]/.test(newPassword)) {
            alert("Password must contain a lowercase letter.");
            return;
        }

        if (!/[0-9]/.test(newPassword)) {
            alert("Password must contain a number.");
            return;
        }

        const submitButton =
            forgotForm.querySelector('button[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Resetting...";
        }

        try {

            console.log(
                "[FORGOT] Sending POST:",
                "http://127.0.0.1:5000/api/forgot"
            );

            const response = await fetch(
                "http://127.0.0.1:5000/api/forgot",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        email: email,
                        newPassword: newPassword
                    })
                }
            );

            console.log(
                "[FORGOT] Response status:",
                response.status
            );

            const rawResponse = await response.text();

            console.log(
                "[FORGOT] Raw server response:",
                rawResponse
            );

            let result;

            try {
                result = JSON.parse(rawResponse);
            } catch (parseError) {

                console.error(
                    "[FORGOT] Invalid JSON response:",
                    parseError
                );

                alert(
                    "Backend returned an invalid response."
                );

                return;
            }

            console.log(
                "[FORGOT] Parsed response:",
                result
            );

            if (response.ok && result.success === true) {

                console.log(
                    "[FORGOT] PASSWORD RESET SUCCESS."
                );

                alert(
                    "Password reset successfully. Please login with your new password."
                );

                // Clear any old client-side user data.
                localStorage.removeItem("currentUser");

                window.location.replace("login.html");

                return;
            }

            console.error(
                "[FORGOT] Password reset failed:",
                result
            );

            alert(
                result.error ||
                "Unable to reset password."
            );

        } catch (error) {

            console.error(
                "[FORGOT] FETCH ERROR:",
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
                submitButton.textContent = "Reset Password";
            }
        }
    });

});

(function () {
    // Create Auth object to store authentication functions
    const Auth = {};

    // const App = window.App;


    // Handle seller registration
    Auth.register = (form) => {
        // Get form values
        const username = form.username.value.trim();
        const email = form.email.value.trim().toLowerCase();
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;

        // Store validation errors
        const errors = {};

        // Check if username is empty
        if (!username) {
            errors.username = "Username is required.";
        }

        // Check if email is empty
        if (!email) {
            errors.email = "Email is required.";
        }

        //Stackoverflow.com. Available at: https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript (Accessed: March 8, 2026).
        // Email format rule
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Check if email format is valid
        if (email && !emailPattern.test(email)) {
            errors.email = "Please enter a valid email (example: you@email.com)";
        }

        // Check if password is empty
        if (!password) {
            errors.password = "Password is required.";
        }

        if (!confirmPassword) {
            errors.confirmPassword = "Please confirm your password.";
        }

        if (password && confirmPassword && password !== confirmPassword) {
            errors.confirmPassword = "Passwords do not match.";
        }

        // Stackoverflow.com. Available at: https://stackoverflow.com/questions/12090077/javascript-regular-expression-password-validation-having-special-characters (Accessed: March 8, 2026).
        // Password format rule
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;// Password must contain at least one uppercase letter, one lower letter and one number. At least must be 8 character
        // Check if password is strong enough
        if (password && !passwordPattern.test(password)) {
            errors.password = "Password must have at least 8 characters, one uppercase letter, one lowercase letter, and one number.";
        }


        // Return validation result with status: errors and user data (username,email,password)
        return {
            ok: Object.keys(errors).length === 0,
            errors,
            data: { username, email, password }
        };
    };


    // Connect register page with register logic
    Auth.attachRegisterPage = () => {
        // Get register form
        const form = document.querySelector("#registerForm");
        if (!form) return;

        // Get message area
        const msg = document.querySelector("#formMsg");

        // Show error under field
        const setError = (field, text) => {
            const el = document.querySelector(`[data-error="${field}"]`);
            if (el) el.textContent = text || "";
        };

        // Run when form is submitted
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            // Clear old messages
            msg.textContent = "";
            //Clear error messages under each field
            ["username", "email", "password","confirmPassword", "general"].forEach(f => setError(f, ""));

            // Validate registration form, check that the user typed is correct
            const res = Auth.register(form);

            // Stop if validation fails
            if (!res.ok) {
                Object.entries(res.errors).forEach(([k, v]) => setError(k, v));
                return;
            }

            // Send registration data to backend
            fetch("api/register.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded" // Sending normal data
                },
                body: new URLSearchParams({
                    username: res.data.username || "", // Take username or empty
                    email: res.data.email,  // Take email
                    password: res.data.password // Take password
                })
            })
                .then(response => response.text())
                .then(data => {
                    // Success message, if registration was successful
                    if (data.includes("Seller registered successfully")) {
                        msg.textContent = "Registration successful. Redirecting to login...";
                        msg.className = "success";

                        // Go to login page, wait a little
                        setTimeout(() => (window.location.href = "login.html"), 650);
                        // Username already exists
                    } else if (data.includes("Username already exists")) {
                        setError("username", "This username is already taken.");
                        msg.textContent = "";
                        // Email already exists
                    } else if (data.includes("Email already exists")) {
                        setError("email", "This email is already registered.");
                        msg.textContent = "";
                        // Other error
                    } else {
                        msg.textContent = data;
                        msg.className = "error";
                    }
                })
                // Handle request error , network or request
                .catch(() => {
                    msg.textContent = "Something went wrong. Please try again.";
                    msg.className = "error";
                });
        });
    };

    // Connect login page with login logic
    Auth.attachLoginPage = () => {
        // Get login form
        const form = document.querySelector("#loginForm");
        if (!form) return;

        // Get message area
        const msg = document.querySelector("#formMsg");

        // Show error under field
        const setError = (field, text) => {
            const el = document.querySelector(`[data-error="${field}"]`);
            if (el) el.textContent = text || "";
        };

        // Run when form is submitted
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            // Clear old messages
            msg.textContent = "";
            ["email", "password", "general"].forEach(f => setError(f, ""));

            // Get input values
            const email = form.email.value.trim().toLowerCase();
            const password = form.password.value;

            // Check required fields
            if (!email) setError("email", "Email is required.");
            if (!password) setError("password", "Password is required.");

            // Stop if fields are empty
            if (!email || !password) return;

            // Send login request to backend
            fetch("api/login.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded" // Tell to the server that sending normal data like a regular html form
                },
                body: new URLSearchParams({
                    email,
                    password
                })
            })
                .then(response => response.json())
                .then(data => {
                    // If login is successful
                    if (data.success) {
                        // Save login status in local storage
                        localStorage.setItem("sellerLoggedIn", "true");
                        localStorage.setItem("currentSellerId", data.sellerId);

                        // Show success message
                        msg.textContent = "Login successful. Redirecting...";
                        msg.className = "success";

                        // Go to seller dashboard
                        setTimeout(() => {
                            window.location.href = "seller-dashboard.html";
                        }, 450);
                    } else {
                        // Show error message
                        msg.textContent = data.message || "Wrong email or password.";
                        msg.className = "error";
                    }
                })
                // Handle request error
                .catch(() => {
                    msg.textContent = "Something went wrong. Please try again.";
                    msg.className = "error";
                });
        });
    };

    // Run functions when page loads
    document.addEventListener("DOMContentLoaded", () => {
        // Attach register logic
        Auth.attachRegisterPage();
        // Attach login logic
        Auth.attachLoginPage();
    });

    window.Auth = Auth;
})();
//References:
//Stackoverflow.com. Available at: https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript (Accessed: March 8, 2026).
// Stackoverflow.com. Available at: https://stackoverflow.com/questions/12090077/javascript-regular-expression-password-validation-having-special-characters (Accessed: March 8, 2026).
// Stackoverflow.com. Available at: https://stackoverflow.com/questions/68389117/using-fetch-api-to-create-a-login-form?utm_source (Accessed: March 8, 2026).
//JavaScript string trim() W3schools.com. Available at: https://www.w3schools.com/jsref/jsref_trim_string.asp (Accessed: March 8, 2026).
//How to POST x-www-form-urlencoded data using Fetch API: Step-by-step guide with parameters xjavascript. Available at: https://www.xjavascript.com/blog/how-do-i-post-a-x-www-form-urlencoded-request-using-fetch/?utm_source (Accessed: March 8, 2026).


(function () {
// Create App object to store shared functions
    const App = {};

    /* CATEGORIES*/

    App.CATEGORIES = [
        "Clothing",
        "Electronics",
        "Furniture & Home",
        "Books",
        "Sports",
        "Kids",
        "Other"
    ];


    //HELPERS
    // Select one element from the page
    App.$ = (sel, root = document) => root.querySelector(sel);

    // Select many elements from the page
    App.$$ = (sel, root = document) =>
        Array.from(root.querySelectorAll(sel));


    // Get JSON data from localStorage
    App.getJSON = (key, fallback) => {
        try {
            const raw = localStorage.getItem(key);
            // Return fallback value if nothing is found
            if (!raw) return fallback;
            // Convert saved text to JavaScript object
            return JSON.parse(raw);
        } catch {
            // Return fallback value if JSON is invalid
            return fallback;
        }
    };

// Save JSON data to localStorage
    App.setJSON = (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    };

    //Stackoverflow.com. Available at: https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid (Accessed: March 5, 2026).
    //Crypto: randomUUID() method MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID (Accessed: March 5, 2026).
    // Create a unique id
    App.uuid = () => {
        // Use built-in random id if available
        if (crypto && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // Use custom id if randomUUID is not available
        return "id_" + Math.random().toString(16).slice(2) + "_" + Date.now();
    };



    //Stackoverflow.com. Available at: https://stackoverflow.com/questions/149055/how-to-format-numbers-as-currency-strings (Accessed: March 5, 2026).
    //Number.isNaN() MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN (Accessed: March 5, 2026).
    // Format number as euro price
    App.money = (n) => {
        const num = Number(n);

        // Return default value if number is invalid
        if (Number.isNaN(num)) return "€0";

        // Return formatted price
        return "€" + num.toFixed(2);
    };


    //AUTH STATE

    // Check if seller is logged in
    App.isLoggedIn = () => {
        return localStorage.getItem("sellerLoggedIn") === "true";
    };


    // Get current seller id
    App.currentSellerId = () => {
        return localStorage.getItem("currentSellerId") || "";
    };


    /*NAVBAR */

    // Show navbar on the page
    App.renderNavbar = () => {

        // Get navbar container
        const mount = App.$("#navbar");

        // Stop if navbar container does not exist
        if (!mount) return;

        // Check login status
        const loggedIn = App.isLoggedIn();

        // Create navbar HTML
        mount.innerHTML = `
      <div class="navbar">
        <div class="container">
          <div class="nav-inner">

<!-- Website logo and brand name -->
            <a class="brand" href="index.html">
              <img src="assets/logo4.png" alt="Logo" class="logo">
              <span>Second-Hand Market</span>
            </a>
            
            <!-- Burger button for mobile menu -->
            <button id="burgerBtn" class="burger">
              ☰
            </button>

            <div id="mobileMenu" class="nav-links">

              <a href="index.html">Home</a>
              <a href="products.html">Products</a>

              ${
            loggedIn
                ? `
<!-- Links shown when seller is logged in -->
                    <a href="seller-dashboard.html">Dashboard</a>
                    <button class="btn danger" id="logoutBtn">Logout</button>
                  `
                : `
<!-- Links shown when seller is not logged in -->
                    <a href="login.html">Login</a>
                    <a href="register.html">Register</a>
                  `
        }

              <button class="btn theme-btn" id="themeToggleBtn" aria-label="Toggle theme" title="Change theme">🌙</button>
            </div>

          </div>
        </div>
      </div>
    `;


        //Document: querySelector() method MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector (Accessed: March 5, 2026).
        //BURGER MENU

        // Get burger button and mobile menu
        const burger = document.querySelector("#burgerBtn");
        const menu = document.querySelector("#mobileMenu");

        // Open and close mobile menu
        if (burger && menu) {
            burger.addEventListener("click", () => {
                menu.classList.toggle("active");
            });
        }


        //EventTarget: addEventListener() method  MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener (Accessed: March 5, 2026).
        //LOGOUT
        // Get logout button
        const logoutBtn = document.querySelector("#logoutBtn");

        // Handle logout
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                // Update login state
                localStorage.setItem("sellerLoggedIn", "false");
                // Remove current seller id
                localStorage.removeItem("currentSellerId");
                // Redirect to home page
                window.location.href = "index.html";
            });
        }

    };
    //Element: classList property MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList (Accessed: March 5, 2026).
    //How to toggle between dark and light mode  W3schools.com. Available at: https://www.w3schools.com/howto/howto_js_toggle_dark_mode.asp (Accessed: March 5, 2026).
    //THEME TOGGLE
    // Handle dark mode and light mode
    App.initTheme = () => {
        // Get saved theme from localStorage
        const savedTheme = localStorage.getItem("theme");

        // Apply light mode if saved
        if (savedTheme === "light") {
            document.body.classList.add("light-mode");
        }

        // Get theme button
        const themeBtn = document.querySelector("#themeToggleBtn");

        // Stop if theme button does not exist
        if (!themeBtn) return;

        // Set correct icon when page loads
        themeBtn.textContent = document.body.classList.contains("light-mode")
            ? "☀️"
            : "🌙";

        // Change theme when button is clicked
        themeBtn.title = document.body.classList.contains("light-mode")
            ? "Light mode active"
            : "Dark mode active";

        themeBtn.addEventListener("click", () => {
            // Add or remove light mode class
            document.body.classList.toggle("light-mode");

            // Check current theme
            const isLight = document.body.classList.contains("light-mode");

            // Save selected theme
            localStorage.setItem("theme", isLight ? "light" : "dark");
            // Update button icon
            themeBtn.textContent = isLight ? "☀️" : "🌙";
            // Update button title
            themeBtn.title = isLight ? "Light mode active" : "Dark mode active";
        });
    };





    //FOOTER LOADER

    // Load footer HTML file into the page
    App.loadFooter = () => {

        // Get footer container
        const mount = document.querySelector("#footerMount");

        // Stop if footer container does not exist
        if (!mount) return;

        // Load footer file
        fetch("footer.html")
            .then(res => res.text())
            .then(html => {
                // Add footer HTML to the page
                mount.innerHTML = html;
            })
            // Ignore error if footer can not be loaded
            .catch(() => {});

    };


    //INIT

    // Run functions when page finishes loading
    document.addEventListener("DOMContentLoaded", () => {

        // Show navbar
        App.renderNavbar();
        // Start theme logic
        App.initTheme();
        // Load footer
        App.loadFooter();

    });


    window.App = App;

})();

//References:
//Window: localStorage property MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage (Accessed: March 5, 2026).
//Stackoverflow.com. Available at: https://stackoverflow.com/questions/2010892/how-to-store-objects-in-html5-localstorage-sessionstorage (Accessed: March 5, 2026).
//Crypto: randomUUID() method MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID (Accessed: March 5, 2026).
//Stackoverflow.com. Available at: https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid (Accessed: March 5, 2026).
//Stackoverflow.com. Available at: https://stackoverflow.com/questions/149055/how-to-format-numbers-as-currency-strings (Accessed: March 5, 2026).
//Number.isNaN() MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN (Accessed: March 5, 2026).
//EventTarget: addEventListener() method  MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener (Accessed: March 5, 2026).
//Document: querySelector() method MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector (Accessed: March 5, 2026).
//How to toggle between dark and light mode  W3schools.com. Available at: https://www.w3schools.com/howto/howto_js_toggle_dark_mode.asp (Accessed: March 5, 2026).
//Element: classList property MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Element/classList (Accessed: March 5, 2026).




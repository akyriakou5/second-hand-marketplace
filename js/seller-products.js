(function () {
    const App = window.App;

    const placeholderThumb = (title) => {
        const safe = title || "Product";

        // Return SVG image as base64 string
        // Stackoverflow.com. Available at: https://stackoverflow.com/questions/44570636/correct-way-to-escape-svg-in-data-uris (Accessed: March 5, 2026).
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
              <defs>
                <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stop-color="#38bdf8" stop-opacity=".25"/>
                  <stop offset="1" stop-color="#22c55e" stop-opacity=".18"/>
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="#0b1220"/>
              <rect x="40" y="40" width="720" height="520" rx="40" fill="url(#g)" stroke="#1f2937"/>
              <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
                font-family="system-ui,Segoe UI,Roboto" font-size="44" fill="#e5e7eb" opacity=".9">
                ${safe}
              </text>
              <text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle"
                font-family="system-ui,Segoe UI,Roboto" font-size="18" fill="#94a3b8" opacity=".9">
                No image
              </text>
            </svg>
        `)}`;
    };

    // Main function to load seller page
    const renderSellerPage = () => {
        // Get elements from HTML
        const grid = document.querySelector("#sellerProductsGrid");
        const titleEl = document.querySelector("#sellerTitle");
        const subtitleEl = document.querySelector("#sellerSubtitle");

        //Stop if grid does not exist
        if (!grid) return;

        // get seller_id from URL
        const params = new URLSearchParams(window.location.search);
        const sellerId = params.get("seller_id");

        // If seller_id is missing
        if (!sellerId) {
            //Show error message
            titleEl.textContent = "Seller not found";
            subtitleEl.textContent = "Missing seller information.";
            grid.innerHTML = "";
            return;
        }
        //Using the Fetch API MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch (Accessed: March 7, 2026).
        //send request to backed to get seller products
        fetch(`api/get_seller_products.php?seller_id=${encodeURIComponent(sellerId)}`)
            // Convert response to JSON
            .then(response => response.json())
            .then(products => {
                // If no products found
                if (!products.length) {
                    titleEl.textContent = "Seller Products";
                    subtitleEl.textContent = "No products found for this seller.";
                    //show empty message
                    grid.innerHTML = `
                        <div class="card" style="grid-column: 1 / -1;">
                            <h3>No products found</h3>
                            <p class="muted">This seller has not posted any products yet.</p>
                        </div>
                    `;
                    return;
                }

                // Get seller username
                const username = products[0].username || "Seller";
                // Update page title
                titleEl.textContent = `Products by ${username}`;
                subtitleEl.textContent = `${products.length} item(s)`;

                // Create HTML for all products
                grid.innerHTML = products.map(product => {
                    //Use image or placeholder
                    const img = product.image1 ? product.image1 : placeholderThumb(product.title);

                    return `
<!--Product card-->
        <article class="card product-card ${product.status === "sold" ? "sold-product" : ""}" data-id="${product.id}" role="button" tabindex="0">
<!--        Show SOLD label if the product is sold-->
            ${product.status === "sold" ? `<span class="sold-label">SOLD</span>` : ""}
<!--            Product Image-->
            <div class="product-thumb">
                <img src="${img}" alt="${(product.title || "Product").replaceAll('"', "&quot;")}">
            </div>
<!--            Product info-->
            <div class="product-body">
<!--            Product title-->
                <h3 class="product-title">${product.title || "Untitled"}</h3>
                
<!--                Price and category-->
                <div class="product-meta">
                    <span class="price">${App.money(product.price)}</span>
                    <span class="badge">${product.category || "Other"}</span>
                </div>
<!--                Short description-->
                <p class="muted small" style="margin-top:10px;">
                    ${((product.description || "").slice(0, 90) + ((product.description || "").length > 90 ? "…" : "")) || "—"}
                </p>
                
<!--                Product status-->
                <p class="small" style="margin-top:6px;">
                    Status:
                    <span class="${product.status === "sold" ? "sold-text" : "available-text"}">
                        ${product.status === "sold" ? "Sold" : "Available"}
                    </span>
                </p>
            </div>

        </article>
    `;
                }).join("");

                // Add click event to each product card
                document.querySelectorAll(".product-card").forEach(card => {

                    // Function to open product card
                    const open = () => {
                        const id = card.getAttribute("data-id");
                        window.location.href = `product.html?id=${encodeURIComponent(id)}`;
                    };

                    // click event
                    card.addEventListener("click", open);

                    // Keyboard support Enter or Space
                    card.addEventListener("keydown", (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            open();
                        }
                    });
                });
            })
            // Handles errors
            .catch(() => {
                titleEl.textContent = "Seller Products";
                subtitleEl.textContent = "Could not load seller products.";

                //Show error message
                grid.innerHTML = `
                    <div class="card" style="grid-column: 1 / -1;">
                        <h3>Error</h3>
                        <p class="muted">Please try again later.</p>
                    </div>
                `;
            });
    };

    document.addEventListener("DOMContentLoaded", renderSellerPage);
})();

//References:
// Stackoverflow.com. Available at: https://stackoverflow.com/questions/44570636/correct-way-to-escape-svg-in-data-uris (Accessed: March 5, 2026).
//Using the Fetch API MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch (Accessed: March 7, 2026).

(function () {
    // Create Products object
    const Products = {};
    const App = window.App;

    // This function gets all products from PHP / MySQL
    Products.getProducts = async () => {
        // Send request to API
        const response = await fetch("api/get_products.php");
        // Convert response to JSON
        const data = await response.json();
        // Return products
        return data;
    };

    // Render main products page
    Products.renderProductsPage = () => {
        // Get grid container
        const grid = document.querySelector("#productsGrid");
        if (!grid) return;

        // Get filters and search elements
        const categorySelect = document.querySelector("#categoryFilter");
        const searchInput = document.querySelector("#searchInput");
        const countEl = document.querySelector("#resultsCount");

        // Store all products
        let allProducts = [];
        // Pagination settings
        const productsPerPage = 9;
        let visibleCount = productsPerPage;

        // Fill category dropdown
        if (categorySelect) {
            categorySelect.innerHTML = `
                <option value="all">All categories</option>
                ${App.CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join("")}
            `;
        }

        // Placeholder image
        const placeholderThumb = (title) => {
            const safe = title || "Product";

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

        //String.Prototype.toLowerCase()  MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase (Accessed: March 7, 2026).
        //String.Prototype.localeCompare() MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare (Accessed: March 7, 2026).
        // Filter products
        const getFiltered = () => {
            const cat = categorySelect ? categorySelect.value : "all";
            const q = searchInput ? searchInput.value.trim().toLowerCase() : "";

            // Sort by newest first
            let filtered = allProducts.slice().sort((a, b) =>
                (b.created_at || "").localeCompare(a.created_at || "")
            );

            // Filter by category
            if (cat && cat !== "all") {
                filtered = filtered.filter(p => p.category === cat);
            }

            // Filter by search text
            if (q) {
                filtered = filtered.filter(p =>
                    (p.title || "").toLowerCase().includes(q) ||
                    (p.description || "").toLowerCase().includes(q)
                );
            }

            return filtered;
        };

        // Create load more button
        const renderLoadMoreButton = (totalItems) => {
            const oldBtnWrap = document.querySelector("#loadMoreWrap");
            if (oldBtnWrap) oldBtnWrap.remove();

            // Stop if all items are shown
            if (visibleCount >= totalItems) return;

            const wrap = document.createElement("div");
            wrap.id = "loadMoreWrap";
            wrap.style.textAlign = "center";
            wrap.style.marginTop = "18px";

            wrap.innerHTML = `
                <button class="btn" id="loadMoreBtn" type="button">Load More</button>
            `;

            grid.parentElement.appendChild(wrap);

            // Load more products when clicked
            const loadMoreBtn = document.querySelector("#loadMoreBtn");
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener("click", () => {
                    visibleCount += productsPerPage;
                    render();
                });
            }
        };

        // Render products on page
        const render = () => {
            const filteredItems = getFiltered();
            // Show only visible products
            const items = filteredItems.slice(0, visibleCount);

            // Update results count
            if (countEl) {
                countEl.textContent = `${filteredItems.length} result(s)`;
            }

            // Show message if no products
            if (filteredItems.length === 0) {
                grid.innerHTML = `
                    <div class="card" style="grid-column: 1 / -1;">
                        <h3>No products found</h3>
                        <p class="muted">Try changing the category filter or search.</p>
                    </div>
                `;

                const oldBtnWrap = document.querySelector("#loadMoreWrap");
                if (oldBtnWrap) oldBtnWrap.remove();

                return;
            }

            // Create HTML for products
            grid.innerHTML = items.map(p => {
                const img = p.image1 ? p.image1 : placeholderThumb(p.title);

                return `
                    <article class="card product-card" data-id="${p.id}" role="button" tabindex="0">
                        <div class="product-thumb">
                            <img src="${img}" alt="${(p.title || "Product").replaceAll('"', "&quot;")}">
                        </div>
                        <div class="product-body">
                            <h3 class="product-title">${p.title || "Untitled"}</h3>
                            <div class="product-meta">
                                <span class="price">${App.money(p.price)}</span>
                                <span class="badge">${p.category || "Other"}</span>
                            </div>
                            <p class="muted small" style="margin-top:10px;">
                                ${((p.description || "").slice(0, 90) + ((p.description || "").length > 90 ? "…" : "")) || "—"}
                            </p>
                        </div>
                    </article>
                `;
            }).join("");

            // Add click events to open product page
            App.$$(".product-card", grid).forEach(card => {
                const open = () => {
                    const id = card.getAttribute("data-id");
                    window.location.href = `product.html?id=${encodeURIComponent(id)}`;
                };

                card.addEventListener("click", open);

                card.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        open();
                    }
                });
            });

            renderLoadMoreButton(filteredItems.length);
        };

        // Reset and render when filter changes
        const resetAndRender = () => {
            visibleCount = productsPerPage;
            render();
        };

        if (categorySelect) categorySelect.addEventListener("change", resetAndRender);
        if (searchInput) searchInput.addEventListener("input", resetAndRender);

        // Load products from backend
        Products.getProducts()
            .then(products => {
                allProducts = products;
                render();
            })
            .catch(error => {
                console.error("Error loading products:", error);
                grid.innerHTML = `
                    <div class="card" style="grid-column: 1 / -1;">
                        <h3>Could not load products</h3>
                        <p class="muted">Please try again later.</p>
                    </div>
                `;
            });
    };

    // Render single product page
    Products.renderProductDetailsPage = () => {
        const mount = document.querySelector("#productDetails");
        if (!mount) return;

        // Get product id from URL
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");

        const placeholder = (label) => {
            return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
                  <rect width="100%" height="100%" fill="#0b1220"/>
                  <rect x="40" y="40" width="720" height="520" rx="40" fill="rgba(255,255,255,.03)" stroke="#1f2937"/>
                  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle"
                    font-family="system-ui,Segoe UI,Roboto" font-size="34" fill="#94a3b8">
                    ${label}
                  </text>
                </svg>
            `)}`;
        };


        // Get all products from the backed
        Products.getProducts()
            .then(products => {
                // Find the product that matches the id from the URL
                const product = products.find(p => String(p.id) === String(id));

                // Check if the product does not exist
                if (!product) {
                    // Show message when product is not found
                    mount.innerHTML = `
                        <div class="card">
                            <h2>Product not found</h2>
                            <p class="muted">This product may have been removed or the link is incorrect.</p>
                            <div style="margin-top:12px;">
                                <a class="btn primary" href="products.html">Back to Products</a>
                            </div>
                        </div>
                    `;
                    return;
                }

                // Create array with available product images only
                const images = [product.image1, product.image2, product.image3].filter(Boolean);
                // Use product images or a placeholder image if no image exists
                const imgs = images.length ? images : [placeholder("No Image")];



                mount.innerHTML = `
                    <div class="card">
                     <!-- Product gallery section -->
                        <div class="gallery">
                        <!-- Main product image -->
                            <div class="main-image">
                                <img id="mainImg" src="${imgs[0]}" alt="${(product.title || "Product").replaceAll('"', "&quot;")}">
                            </div>

                            <div>
                            <!-- Thumbnail images -->
                                <div class="thumbs" id="thumbs">
                                    ${imgs.map((src, idx) => `
                                        <div class="thumb" data-idx="${idx}" title="View image ${idx + 1}">
                                            <img src="${src}" alt="Thumbnail ${idx + 1}">
                                        </div>
                                    `).join("")}
                                </div>
                                
                                <!-- Product category, price and date -->
                                <div style="margin-top:14px" class="notice">
                                
                                 <!-- Product category -->
                                    <div class="badge">${product.category}</div>
                                    <div style="margin-top:10px">
                                    
                                    <!-- Product price -->
                                        <div class="price" style="font-size:22px">${App.money(product.price)}</div>
                                        
                                        <!-- Product post date -->
                                        <div class="muted small">
                                           Posted: ${new Date(product.created_at).toLocaleDateString('en-GB', {
                                               day: '2-digit',  month: '2-digit', year: 'numeric'})}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                         <!-- Product text details -->
                        <div class="section" style="padding:16px 0 0;">
                        <!-- Product title -->
                            <h2 style="margin:0 0 8px;">${product.title}</h2>
                            <!-- Product description -->
                            <p class="muted" style="margin:0; line-height:1.7">${product.description}</p>
                            <!-- Seller and action buttons -->
                            <div class="inline" style="margin-top:14px;">
                         
                         <!-- Seller information -->
                      <div class="notice" style="flex:1;">
                         <div class="small muted">Seller</div>
                              <div style="font-weight:900; margin-top:6px;">
                                     <a href="seller.html?seller_id=${product.seller_id}" style="color:inherit; text-decoration:underline;">
                                       ${product.username}
                                           </a>
                              </div>
                      </div>
<!--The anchor element MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a (Accessed: March 8, 2026).-->
<!--EncodeURIComponent()  MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent (Accessed: March 8, 2026).-->
                            <!-- Button to email the seller --> 
                       <a class="btn primary"
              href="mailto:${product.email}?subject=${encodeURIComponent(`Interested in your product: ${product.title}`)}&body=${encodeURIComponent(
                  `Hello,I am interested in your product: ${product.title}.
                  Price: ${App.money(product.price)}
                  Category: ${product.category}
                  Is this product still available? Thank you.`)}"> Email Seller
              </a>
              <a class="btn" href="products.html">Back</a>
              </div> 
               </div>
                    </div>
                     `;

                // Show full product details on the page
                const mainImg = document.querySelector("#mainImg");
                // Add click event to each thumbnail
                document.querySelectorAll("#thumbs .thumb").forEach(t => {
                    t.addEventListener("click", () => {

                        // Get the image index from the clicked thumbnail
                        const idx = Number(t.getAttribute("data-idx"));
                        // Change the main image
                        mainImg.src = imgs[idx];
                    });
                });
            })
            // Handle error if product details can not be loaded
            .catch(error => {
                console.error("Error loading product details:", error);

                // Show error message on the page
                mount.innerHTML = `
                    <div class="card">
                        <h2>Could not load product</h2>
                        <p class="muted">Please try again later.</p>
                        <div style="margin-top:12px;">
                            <a class="btn primary" href="products.html">Back to Products</a>
                        </div>
                    </div>
                `;
            });
    };

    // Run functions when page loads
    document.addEventListener("DOMContentLoaded", () => {
        // Load products page if products grid exists
        Products.renderProductsPage();
        // Load single product details page if product details area exists
        Products.renderProductDetailsPage();
    });

    window.Products = Products;
})();

//References
//String.Prototype.toLowerCase()  MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLowerCase (Accessed: March 7, 2026).
//String.Prototype.localeCompare() MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare (Accessed: March 7, 2026).
//Document: querySelectorAll() method MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll (Accessed: March 7, 2026).
//The anchor element MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/a (Accessed: March 8, 2026).
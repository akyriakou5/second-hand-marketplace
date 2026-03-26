(function () {
    // create seller to store all function
    const Seller = {};
    const App = window.App;

    // This variable stores the product id when user edits a product
    let editingProductId = null;

    // This array stores old images when user edits a product
    let existingImages = ["", "", ""];

    // Protect dashboard page
    // If user is not logged in, go to login page
    Seller.guardDashboard = () => {
        // Check if current page is dashboard
        const isDashboard =
            document.body &&
            document.body.dataset &&
            document.body.dataset.page === "dashboard";

        // Stop if not dashboard page
        if (!isDashboard) return;

        // Redirect to login if not logged in
        if (!App.isLoggedIn()) {
            window.location.href = "login.html";
        }
    };
    //Stackoverflow.com. Available at: https://stackoverflow.com/questions/36280818/how-to-convert-file-to-base64-in-javascript (Accessed: March 5, 2026).
    //Convert image file to base64 string

    Seller.fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            // File reader to read file
            const reader = new FileReader();

            // When file is loaded
            reader.onload = () => resolve(String(reader.result));
            // If error occurs
            reader.onerror = () => reject(new Error("Failed to read file"));
            // Read file as base64
            reader.readAsDataURL(file);
        });
    };


    // Show preview from selected files
    Seller.renderFilePreviews = async (files, previewWrap) => {
        // Clear old previews
        previewWrap.innerHTML = "";
        // Stop if no files
        if (!files.length) return;
        // Loop through files
        for (const file of files) {
            // Convert file to base64
            const b64 = await Seller.fileToBase64(file);
            // Create preview element
            const div = document.createElement("div");
            // Add preview to page
            div.className = "preview";
            div.innerHTML = `<img src="${b64}" alt="preview">`;

            previewWrap.appendChild(div);
        }
    };


    // Show preview from existing base64 images
    // This is used when user clicks Edit
    Seller.renderExistingPreviews = (images, previewWrap) => {
        // Clear old previews
        previewWrap.innerHTML = "";
        // Remove empty images
        const validImages = images.filter(Boolean);
        // Stop if no images
        if (!validImages.length) return;

        // Show each image
        validImages.forEach(image => {
            const div = document.createElement("div");
            div.className = "preview";
            div.innerHTML = `<img src="${image}" alt="preview">`;
            previewWrap.appendChild(div);
        });
    };

    //Document: querySelector() method MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector (Accessed: March 6, 2026).
    // Create, Update product form
    Seller.attachCreateProductForm = () => {
        // Get form and elements
        const form = document.querySelector("#createProductForm");
        if (!form) return;

        const msg = document.querySelector("#formMsg");
        const categorySelect = document.querySelector("#category");
        const imageInput = document.querySelector("#images");
        const previewWrap = document.querySelector("#imagePreviews");
        const submitBtn = document.querySelector("#submitProductBtn");

        //Stackoverflow.com. Available at: https://stackoverflow.com/questions/9895082/javascript-populate-drop-down-list-with-array (Accessed: March 6, 2026).
        // Fill category dropdown
        if (categorySelect) {
            categorySelect.innerHTML = `
                <option value="">Select category</option>
                ${App.CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join("")}
            `;
        }

        // Show error under a field
        const setError = (field, text) => {
            const el = document.querySelector(`[data-error="${field}"]`);
            if (el) el.textContent = text || "";
        };

        // Clear old errors and messages
        const clearErrors = () => {
            ["title", "category", "description", "price", "images"]
                .forEach(field => setError(field, ""));

            if (msg) {
                msg.textContent = "";
                msg.className = "";
            }
        };

        // Check image rules
        const validateImages = (files) => {
            const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

            if (files.length > 3) {
                return "Max 3 images allowed.";
            }

            for (const file of files) {
                if (!allowed.includes(file.type)) {
                    return "Allowed image types: jpg, jpeg, png, webp.";
                }
            }

            return "";
        };

        // When user chooses images
        imageInput.addEventListener("change", async () => {
            clearErrors();

            const files = Array.from(imageInput.files || []);
            const imageError = validateImages(files);

            // Show error if invalid images
            if (imageError) {
                setError("images", imageError);
                imageInput.value = "";
                previewWrap.innerHTML = "";
                return;
            }

            // Show previews
            try {
                await Seller.renderFilePreviews(files, previewWrap);
            } catch {
                setError("images", "Could not preview images.");
            }
        });
        //HTMLFormElement: submit event MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event (Accessed: March 6, 2026).
        // When user submits the form
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            clearErrors();

            // Get form values
            const title = form.title.value.trim();
            const category = form.category.value;
            const description = form.description.value.trim();
            const priceRaw = form.price.value.trim();

            const files = Array.from(imageInput.files || []);
            const errors = {};

            // Basic validation
            if (!title) errors.title = "Title is required.";
            if (!category) errors.category = "Category is required.";
            if (!description) errors.description = "Description is required.";
            if (!priceRaw) errors.price = "Price is required.";

            const price = Number(priceRaw);

            if (priceRaw && (Number.isNaN(price) || price <= 0)) {
                errors.price = "Price must be a positive number.";
            }

            const imageError = validateImages(files);
            if (imageError) {
                errors.images = imageError;
            }

            //Object.Keys()  MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys (Accessed: March 6, 2026).
            // Stop if there are errors
            if (Object.keys(errors).length > 0) {
                Object.entries(errors).forEach(([key, value]) => {
                    setError(key, value);
                });
                return;
            }

            //Promise.All()  MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all (Accessed: March 6, 2026).
            // Convert images to base64
            let images = ["", "", ""];

            if (files.length > 0) {
                try {
                    const b64s = await Promise.all(files.map(Seller.fileToBase64));
                    images = [b64s[0] || "", b64s[1] || "", b64s[2] || ""];
                } catch {
                    setError("images", "Failed to process images.");
                    return;
                }
            } else {
                // If user is editing and did not choose new images,
                // keep the old images
                images = existingImages;
            }


            //Using the Fetch API  MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch (Accessed: March 6, 2026).
            // UPDATE PRODUCT
            if (editingProductId) {
                fetch("api/update_product.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: new URLSearchParams({
                        product_id: editingProductId,
                        title: title,
                        category: category,
                        description: description,
                        price: price,
                        image1: images[0] || "",
                        image2: images[1] || "",
                        image3: images[2] || ""
                    })
                })
                    .then(response => response.text())
                    .then(data => {
                        if (data.includes("Product updated successfully")) {
                            if (msg) {
                                msg.textContent = "Product updated successfully!";
                                msg.className = "success";
                            }

                            // Reset form after update
                            form.reset();
                            previewWrap.innerHTML = "";
                            editingProductId = null;
                            existingImages = ["", "", ""];

                            if (submitBtn) {
                                submitBtn.textContent = "Create Product";
                            }

                            Seller.renderMyProducts();
                        } else {
                            if (msg) {
                                msg.textContent = data;
                                msg.className = "error";
                            }
                        }
                    })
                    .catch(() => {
                        if (msg) {
                            msg.textContent = "Something went wrong.";
                            msg.className = "error";
                        }
                    });

                return;
            }

            //Using the Fetch API MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch (Accessed: March 7, 2026).
            // CREATE PRODUCT
            fetch("api/create_product.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    seller_id: App.currentSellerId(),
                    title: title,
                    category: category,
                    description: description,
                    price: price,
                    image1: images[0] || "",
                    image2: images[1] || "",
                    image3: images[2] || ""
                })
            })
                .then(response => response.text())
                .then(data => {
                    if (data.includes("Product created successfully")) {
                        if (msg) {
                            msg.textContent = "Product created successfully!";
                            msg.className = "success";
                        }

                        form.reset();
                        previewWrap.innerHTML = "";
                        existingImages = ["", "", ""];

                        Seller.renderMyProducts();
                    } else {
                        if (msg) {
                            msg.textContent = data;
                            msg.className = "error";
                        }
                    }
                })
                .catch(() => {
                    if (msg) {
                        msg.textContent = "Something went wrong.";
                        msg.className = "error";
                    }
                });
        });
    };

    // ----------------------------------------------------
    // Update product status
    // ----------------------------------------------------
    Seller.toggleStatus = async (productId, currentStatus) => {
        const newStatus = currentStatus === "sold" ? "available" : "sold";

        try {
            const res = await fetch("api/update_status.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    product_id: productId,
                    status: newStatus
                })
            });

            const data = await res.json();

            if (data.success) {
                Seller.renderMyProducts();
            } else {
                alert(data.message || "Failed to update product status.");
            }
        } catch {
            alert("Something went wrong while updating status.");
        }
    };

    // ----------------------------------------------------
    // Load products of the logged-in seller
    // Show Edit, Status and Delete buttons
    // ----------------------------------------------------
    Seller.renderMyProducts = () => {
        const mount = document.querySelector("#myProducts");
        if (!mount) return;

        const sellerId = App.currentSellerId();

        fetch(`api/get_my_products.php?seller_id=${sellerId}`)
            .then(response => response.json())
            .then(products => {
                if (products.length === 0) {
                    mount.innerHTML = `
                        <div class="notice muted">
                            You have not posted any products yet.
                        </div>
                    `;
                    return;
                }

                mount.innerHTML = `
                    <table class="table mobile-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(product => `
                                <tr>
                                    <td data-label="Title">${product.title}</td>

                                    <td data-label="Category">
                                        <span class="badge">${product.category}</span>
                                    </td>

                                    <td data-label="Price">${App.money(product.price)}</td>

                                    <td data-label="Status">
                                        <span class="badge ${product.status === "sold" ? "sold-badge" : "available-badge"}">
                                            ${product.status}
                                        </span>
                                    </td>

<!--Date.Prototype.toLocaleDateString()  MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString (Accessed: March 7, 2026).-->
                                    <td data-label="Created">${new Date(product.created_at).toLocaleDateString('en-GB', {
                                           day: '2-digit',
                                           month: '2-digit',
                                           year: 'numeric'
                                        })}</td>

                                    <td data-label="Action">
                                        <button class="btn" data-edit="${product.id}" type="button">
                                            Edit
                                        </button>

                                        <button class="btn" data-status="${product.id}" data-current-status="${product.status}" type="button">
                                            ${product.status === "sold" ? "Mark as Available" : "Mark as Sold"}
                                        </button>

                                        <button class="btn danger" data-del="${product.id}" type="button">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                `;

                // -----------------------------------------
                // EDIT PRODUCT
                // Fill the form with old product data
                // -----------------------------------------
                mount.querySelectorAll("[data-edit]").forEach(button => {
                    button.addEventListener("click", () => {
                        const productId = button.getAttribute("data-edit");
                        const product = products.find(p => String(p.id) === String(productId));

                        if (!product) return;

                        const form = document.querySelector("#createProductForm");
                        const previewWrap = document.querySelector("#imagePreviews");
                        const submitBtn = document.querySelector("#submitProductBtn");

                        // Save the product id so we know we are editing
                        editingProductId = product.id;

                        // Save old images
                        existingImages = [
                            product.image1 || "",
                            product.image2 || "",
                            product.image3 || ""
                        ];

                        // Fill the form
                        form.title.value = product.title || "";
                        form.category.value = product.category || "";
                        form.description.value = product.description || "";
                        form.price.value = product.price || "";

                        // Show old image previews
                        Seller.renderExistingPreviews(existingImages, previewWrap);

                        // Change button text
                        if (submitBtn) {
                            submitBtn.textContent = "Update Product";
                        }

                        // Scroll to top so user can see the form
                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });
                    });
                });

                // -----------------------------------------
                // UPDATE STATUS
                // -----------------------------------------
                mount.querySelectorAll("[data-status]").forEach(button => {
                    button.addEventListener("click", () => {
                        const productId = button.getAttribute("data-status");
                        const currentStatus = button.getAttribute("data-current-status");

                        Seller.toggleStatus(productId, currentStatus);
                    });
                });

                // -----------------------------------------
                // DELETE PRODUCT
                // -----------------------------------------
                mount.querySelectorAll("[data-del]").forEach(button => {
                    button.addEventListener("click", () => {
                        const productId = button.getAttribute("data-del");

                        const confirmDelete = confirm(
                            "Are you sure you want to delete this product?\n\nThis action can not be undone."
                        );
                        if (!confirmDelete) {
                            return;
                        }

                        fetch("api/delete_product.php", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                            body: new URLSearchParams({
                                product_id: productId
                            })
                        })
                            .then(response => response.text())
                            .then(data => {
                                if (data.includes("successfully")) {
                                    Seller.renderMyProducts();
                                } else {
                                    alert(data);
                                }
                            })
                            .catch(() => {
                                alert("Error deleting product");
                            });
                    });
                });
            })
            .catch(() => {
                mount.innerHTML = `
                    <div class="notice error">
                        Could not load your products.
                    </div>
                `;
            });
    };

    // ----------------------------------------------------
    // Run all functions when page loads
    // ----------------------------------------------------
    document.addEventListener("DOMContentLoaded", () => {
        Seller.guardDashboard();
        Seller.attachCreateProductForm();
        Seller.renderMyProducts();

        const viewBtn = document.querySelector("#viewMyProductsBtn");

        if (viewBtn) {
            viewBtn.addEventListener("click", (e) => {
                e.preventDefault();

                const sellerId = App.currentSellerId();

                if (!sellerId) {
                    alert("You must be logged in.");
                    return;
                }

                window.location.href = `seller.html?seller_id=${sellerId}`;
            });
        }
    });

    window.Seller = Seller;
})();

//References:
//Stackoverflow.com. Available at: https://stackoverflow.com/questions/36280818/how-to-convert-file-to-base64-in-javascript (Accessed: March 5, 2026).
//Document: querySelector() method MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector (Accessed: March 6, 2026).
//Stackoverflow.com. Available at: https://stackoverflow.com/questions/9895082/javascript-populate-drop-down-list-with-array (Accessed: March 6, 2026).
//HTMLFormElement: submit event MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event (Accessed: March 6, 2026).
//Object.Keys()  MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys (Accessed: March 6, 2026).
//Promise.All()  MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all (Accessed: March 6, 2026).
//Using the Fetch API  MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch (Accessed: March 6, 2026).
//Using the Fetch API MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch (Accessed: March 7, 2026).
//Date.Prototype.toLocaleDateString()  MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString (Accessed: March 7, 2026).









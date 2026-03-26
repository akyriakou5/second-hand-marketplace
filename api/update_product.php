<?php
// Connect to database
require "config.php";

// Allow only POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    die("Invalid request");
}

// Get product data sent from JavaScript
// If a value does not exist, an empty string is used
$product_id   = $_POST["product_id"] ?? "";
$title        = $_POST["title"] ?? "";
$category     = $_POST["category"] ?? "";
$description  = $_POST["description"] ?? "";
$price        = $_POST["price"] ?? "";
$image1       = $_POST["image1"] ?? "";
$image2       = $_POST["image2"] ?? "";
$image3       = $_POST["image3"] ?? "";

// Check if required fields are missing
// If important data is missing, stop the script
if (!$product_id || !$title || !$category || !$description || !$price) {
    die("Missing required fields");
}

// SQL query to update an existing product
// The product is identified by its unique id
$sql = "UPDATE products 
        SET title = ?, category = ?, description = ?, price = ?, image1 = ?, image2 = ?, image3 = ?
        WHERE id = ?";

// Prepare the SQL query
// Prepared statements help protect the database from SQL injection
$stmt = $conn->prepare($sql);

// Bind values to the SQL query
// This connects the variables with the placeholders (?) in the query
$stmt->bind_param(
    "sssdsssi", // s - string, d - decimal/double, i - integer
    $title,
    $category,
    $description,
    $price,
    $image1,
    $image2,
    $image3,
    $product_id
);

// Execute the query and update the product
if ($stmt->execute()) {
    echo "Product updated successfully"; // If update is successful, return a success message
} else {
    echo "Database error: " . $stmt->error; // If something goes wrong, return the database error
}
//References
//PHP MySQL prepared statements W3schools.com. Available at: https://www.w3schools.com/php/php_mysql_prepared_statements.asp (Accessed: March 1, 2026).

?>
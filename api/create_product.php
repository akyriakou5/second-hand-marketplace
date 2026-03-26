<?php

// Connect to database file
// this allows this script to communicate with MySQL database
require "config.php";

// Allow only POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    die("Invalid request");
}

// Get data from JavaScript - seller dashboard form
$seller_id   = $_POST["seller_id"] ?? "";
$title       = $_POST["title"] ?? "";
$category    = $_POST["category"] ?? "";
$description = $_POST["description"] ?? "";
$price       = $_POST["price"] ?? "";
$image1      = $_POST["image1"] ?? "";
$image2      = $_POST["image2"] ?? "";
$image3      = $_POST["image3"] ?? "";

// Check if required fields are missing. If any important field is empty, the script stops and shows an error
if (!$seller_id || !$title || !$category || !$description || !$price) {
    die("Missing required fields"); //PHP die() function  W3schools.com. Available at: https://www.w3schools.com/php/func_misc_die.asp (Accessed: March 1, 2026).
}

$status = "available";
// Insert product into database, The values will be added to the products table
$sql = "INSERT INTO products (seller_id, title, category, description, price, image1, image2, image3, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

// Prepare the SQL query
//PHP MySQL prepared statements W3schools.com. Available at: https://www.w3schools.com/php/php_mysql_prepared_statements.asp (Accessed: March 1, 2026).
$stmt = $conn->prepare($sql);

// Bind values to the query, sends the values safely to the database
$stmt->bind_param("isssdssss", $seller_id, $title, $category, $description, $price, $image1, $image2, $image3, $status); // type argument can be one of four types:  i - integer (whole number), d - double (floating point number), s - string (text), b - binary (image, PDF, etc.)

// Run the query
if ($stmt->execute()) { // If it works, a success message is returned
    echo "Product created successfully";
} else { // If something goes wrong, show the database error
    echo "Database error: " . $stmt->error;
}

// References
//PHP die() function W3schools.com. Available at: https://www.w3schools.com/php/func_misc_die.asp (Accessed: March 1, 2026).
//PHP MySQL prepared statements W3schools.com. Available at: https://www.w3schools.com/php/php_mysql_prepared_statements.asp (Accessed: March 1, 2026).
?>



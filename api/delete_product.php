<?php

// Connect to database
require "config.php";

// Allow only POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    die("Invalid request");
}

// Get product id from JavaScript, if no value is provided use an empty string
$product_id = $_POST["product_id"] ?? "";

// Check if product id exists, if it id empty, the script stops and shows an error
if (empty($product_id)) {
    die("Missing product id");
}

// SQL query to delete product from the database
// The product will be removed from the products table using its id
$sql = "DELETE FROM products WHERE id = ?";

// Prepare query
// This protects the database from SQL injection attacks
$stmt = $conn->prepare($sql);

// Bind product id, "i" means the value is an integer
$stmt->bind_param("i",$product_id);

// Run query
if ($stmt->execute()) {// If successful return a confirmation message
    echo "Product deleted successfully";
} else { // if an error happens shw the database error
    echo "Database error: " . $stmt->error;
}
// References
//PHP die() function W3schools.com. Available at: https://www.w3schools.com/php/func_misc_die.asp (Accessed: March 1, 2026).
//PHP MySQL prepared statements W3schools.com. Available at: https://www.w3schools.com/php/php_mysql_prepared_statements.asp (Accessed: March 1, 2026).

?>
<?php

// Connect to database
require "config.php";

// Allow only GET requests
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    die("Invalid request");
}

// Get seller id from URL, if no value is provided, use an empty string
$seller_id = $_GET["seller_id"] ?? "";

// Check if seller id exists.
// If is missing, stop the script and show an error
if (empty($seller_id)) {
    die("Missing seller id");
}

// SQL query to get only this seller's products
$sql = "SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC";

// Prepare query, help protect the database from SQL injection
$stmt = $conn->prepare($sql);

// Bind seller id to the query,"i" means the value is an integer
$stmt->bind_param("i", $seller_id);

// Run query
$stmt->execute();

// Get results returned by the database
$result = $stmt->get_result();

// Create empty array to store the products
$products = [];

// Loop thought each row returned by the database
// Each product is added to the array
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

// Return the result as JSON
header("Content-Type: application/json"); //// Tell the browser that the repsonse will be in Json format
// Json php W3schools.com. Available at: https://www.w3schools.com/js/js_json_php.asp (Accessed: March 3, 2026).
echo json_encode($products);  //PHP and JSON  W3schools.com. Available at: https://www.w3schools.com/php/php_json.asp (Accessed: March 3, 2026).

//References
//SQL ORDER BY keyword  W3schools.com. Available at: https://www.w3schools.com/sql/sql_orderby.asp (Accessed: March 3, 2026).
//PHP MySQL prepared statements W3schools.com. Available at: https://www.w3schools.com/php/php_mysql_prepared_statements.asp (Accessed: March 1, 2026).
//PHP mysqli fetch_assoc() Function  W3schools.com. Available at: https://www.w3schools.com/php/func_mysqli_fetch_assoc.asp (Accessed: March 3, 2026).
//PHP and JSON  W3schools.com. Available at: https://www.w3schools.com/php/php_json.asp (Accessed: March 3, 2026).
// Json php W3schools.com. Available at: https://www.w3schools.com/js/js_json_php.asp (Accessed: March 3, 2026).
?>
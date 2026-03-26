<?php

// Include the database connection file
require "config.php";

// Allow only GET requests
if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    die("Invalid request");
}

// Get seller id from URL
$seller_id = $_GET["seller_id"] ?? "";

// Check if seller id exists
if (empty($seller_id)) {
    die("Missing seller id");
}

// SQL query to get seller username and seller products
$sql = "SELECT products.*, sellers.username
        FROM products
        JOIN sellers ON products.seller_id = sellers.id
        WHERE products.seller_id = ?
        ORDER BY products.created_at DESC";

// Prepare the SQL query
$stmt = $conn->prepare($sql);

// Bind seller id
$stmt->bind_param("i", $seller_id);

// Run query
$stmt->execute();

// Get results
$result = $stmt->get_result();

// Create empty array
$products = [];

// Put every row into the array
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

// Return JSON
header("Content-Type: application/json");
echo json_encode($products);

?>
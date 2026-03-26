<?php

require "config.php";// Load database connection

header('Content-Type: application/json; charset=utf-8');// return JSON data

// SQL query to get all available products with seller info
$sql = "SELECT products.*, sellers.username, sellers.email
        FROM products
        JOIN sellers ON products.seller_id = sellers.id
        WHERE products.status = 'available'
        ORDER BY products.id DESC";

$result = $conn->query($sql); // Run the query

// Check if query failed
if ($result === false) {
    error_log("get_products.php SQL error: " . $conn->error);

    http_response_code(500); // Send error status
    echo json_encode([ // Send error message as JSON
        "success" => false,
        "message" => "Query failed"
    ]);
    exit;// Stop script
}

$products = [];// Create empty array for products

// Loop through all rows from database
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

echo json_encode($products);// Send products as JSON response
exit;// End script
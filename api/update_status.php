<?php
include "config.php";

// Tell the browser that the response will be in JSON format
header("Content-Type: application/json");

// Get raw data sent from JavaScript (JSON format)
$data = json_decode(file_get_contents("php://input"), true);

// Get product id from request
$product_id = $data["product_id"] ?? null;
// Get new status available / sold
$status = $data["status"] ?? "";

// Check if required data is missing
if (!$product_id || !$status) {
    // Return error message
    echo json_encode([
        "success" => false,
        "message" => "Missing product id or status."
    ]);
    // Stop script execution
    exit;
}
// SQL query to update product status
$sql = "UPDATE products SET status = ? WHERE id = ?";
// Prepare SQL query to make it secure
$stmt = $conn->prepare($sql);
// Bind values to the query s = string, i = integer
$stmt->bind_param("si", $status, $product_id);

// Execute the query
if ($stmt->execute()) {
    // Return success response
    echo json_encode([
        "success" => true,
        "message" => "Product status updated."
    ]);
} else {
    // Return error response if something goes wrong
    echo json_encode([
        "success" => false,
        "message" => "Failed to update product status."
    ]);
}
?>
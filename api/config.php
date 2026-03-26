<?php

mysqli_report(MYSQLI_REPORT_OFF);

$host = "localhost"; // Server name
$username = "root";// Database username
$password = ""; // Database password
$database = "secondhand_products"; // Database name

// Create a new database connection
$conn = new mysqli($host, $username, $password, $database);

// Check if the connection failed
if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);

    // Send HTTP status code 500 (server error)
    http_response_code(500);
    // Set response type to JSON
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);
    // Stop the script
    exit;
}

// Set character encoding to support UTF-8 including special characters
$conn->set_charset("utf8mb4");

//PHP mysqli set_charset() Function  W3schools.com. Available at: https://www.w3schools.com/Php/func_mysqli_set_charset.asp (Accessed: March 1 2026).
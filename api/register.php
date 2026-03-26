<?php
// Include the database connection file
require "config.php";

// Get data sent from the register form
$username = $_POST['username'] ?? "";
$email    = $_POST['email'] ?? "";
$password = $_POST['password'] ?? "";

// Check if required fields are empty
if (!$username || !$email || !$password) {
    die("Missing required fields");
}

// Check if username already exists
$sqlCheckUser = "SELECT id FROM sellers WHERE username = ?";
$stmtUser = $conn->prepare($sqlCheckUser);
$stmtUser->bind_param("s", $username);
$stmtUser->execute();
$resultUser = $stmtUser->get_result();

if ($resultUser->num_rows > 0) {
    die("Username already exists");
}

// Check if email already exists
$sqlCheckEmail = "SELECT id FROM sellers WHERE email = ?";
$stmtEmail = $conn->prepare($sqlCheckEmail);
$stmtEmail->bind_param("s", $email);
$stmtEmail->execute();
$resultEmail = $stmtEmail->get_result();

if ($resultEmail->num_rows > 0) {
    die("Email already exists");
}

// Hash the password for security
// This means I do not store the real password in the database
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert new seller into database
$sql = "INSERT INTO sellers (username, email, password) VALUES (?, ?, ?)";

// Prepare the SQL query (protects from SQL injection)
$stmt = $conn->prepare($sql);

// Bind values to the query
$stmt->bind_param("sss", $username, $email, $hashedPassword);

// Execute query
if ($stmt->execute()) {
    echo "Seller registered successfully";
} else {
    echo "Error: " . $stmt->error;
}

//References
// //Stackoverflow.com. Available at: https://stackoverflow.com/questions/30279321/how-to-use-phps-password-hash-to-hash-and-verify-passwords (Accessed: March 1, 2026).
// //PHP MySQL prepared statements W3schools.com. Available at: https://www.w3schools.com/php/php_mysql_prepared_statements.asp (Accessed: March 1, 2026)
?>
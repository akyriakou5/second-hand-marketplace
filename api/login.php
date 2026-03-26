<?php
// Include the database connection file
require "config.php";


// Allow only POST requests
//Login data should be sent using POST from the login form
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    die("Invalid request");
}

// Get the email and password sent from the login form, if the values are missing, use an empty string
$email = $_POST["email"] ?? "";
$password = $_POST["password"] ?? "";

// Check if email or password is empty, if one of them is missing, stop the script and show an error
if (empty($email) || empty($password)) {
    die("Please enter email and password.");
}

// SQL query to find the seller using the email
// Only one seller should match this email
$sql = "SELECT id, email, password FROM sellers WHERE email = ?";
$stmt = $conn->prepare($sql);

// Bind the email to the SQL query
// "s" means the value is a string
$stmt->bind_param("s", $email);

$stmt->execute(); // Execute the query and search the database

// Get the result from the database
$result = $stmt->get_result();
$seller = $result->fetch_assoc();

// Check if a seller was found and verify the password
// password_verify compares the entered password with the hashed password stored in the database
if ($seller && password_verify($password, $seller["password"])) {
    // If login is correct, return success and the seller id
    echo json_encode([
        "success" => true,
        "sellerId" => $seller["id"]
    ]);
} else {
    // If login fails, return an error message
    echo json_encode([
        "success" => false,
        "message" => "Wrong email or password."
    ]);
}
// References
//PHP die() function W3schools.com. Available at: https://www.w3schools.com/php/func_misc_die.asp (Accessed: March 1, 2026).
// Json php W3schools.com. Available at: https://www.w3schools.com/js/js_json_php.asp (Accessed: March 3, 2026).
//PHP and JSON  W3schools.com. Available at: https://www.w3schools.com/php/php_json.asp (Accessed: March 3, 2026).
//Password hashing and verification in PHP (2020) GeeksforGeeks. Available at: https://www.geeksforgeeks.org/php/how-to-encrypt-and-decrypt-passwords-using-php/ (Accessed: March 1, 2026).
//PHP mysqli fetch_assoc() Function  W3schools.com. Available at: https://www.w3schools.com/php/func_mysqli_fetch_assoc.asp (Accessed: March 3, 2026).
?>


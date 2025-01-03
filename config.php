<?php
// $host = "localhost";
// $username = "root";
// $password = "";
// $dbname = "uno";

$host = "mysql.caesar.elte.hu";
$username = "czati";
$password = "8Em9QyQaFHgvF4as";
$dbname = "czati";

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
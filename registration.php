<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'header.php';
require 'config.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $sql = "INSERT INTO Users (UserName, PasswordHash) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $username, $password);

    if ($stmt->execute()) {
        echo "Registration successful! <a href='index.php'>Login</a>";
    } else {
        echo "Error: " . $conn->error;
    }
    $stmt->close();
}
?>

    <main class="container mt-5">
        <h2 class="text-center">Register</h2>
        <?php if (isset($success_message)): ?>
            <div class="alert alert-success text-center"><?= $success_message; ?></div>
        <?php elseif (isset($error_message)): ?>
            <div class="alert alert-danger text-center"><?= htmlspecialchars($error_message); ?></div>
        <?php endif; ?>
        <form method="POST" action="" class="mx-auto w-50">
            <div class="mb-3">
                <label for="username" class="form-label">Username:</label>
                <input type="text" name="username" id="username" class="form-control" required>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password:</label>
                <input type="password" name="password" id="password" class="form-control" required>
            </div>
            <div class="text-center">
                <button type="submit" class="btn btn-primary">Register</button>
            </div>
        </form>
        <p class="text-center mt-3">Already have an account? <a href="login.php">Login here</a></p>
    </main>
</body>
</html>

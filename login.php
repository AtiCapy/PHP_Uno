<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once 'config.php';
require_once 'header.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    $sql = "SELECT * FROM Users WHERE UserName = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        die("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("s", $username);

    if (!$stmt->execute()) {
        die("Execute failed: " . $stmt->error);
    }

    $result = $stmt->get_result();


    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        if (password_verify($password, $user['PasswordHash'])) {
            $_SESSION['UserID'] = $user['UserID'];
            $_SESSION['UserName'] = $user['UserName'];
            header("Location: index.php");
            exit;
        } else {
            echo "Invalid username or password.";
        }
    } else {
        echo "Invalid username or password.";
    }
    $stmt->close();
}
?>

    <main class="container mt-5">
        <h2 class="text-center">Login</h2>
        <?php if (isset($error_message)): ?>
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
                <button type="submit" class="btn btn-primary">Login</button>
            </div>
        </form>
        <p class="text-center mt-3">Don't have an account? <a href="registration.php">Register here</a></p>
    </main>
</body>
</html>

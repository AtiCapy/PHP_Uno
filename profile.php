<?php
require_once 'config.php';
require_once 'header.php';

if (!isset($_SESSION['UserID'])) {
    header('Location: login.php');
    exit();
}

$userId = $_SESSION['UserID'];
$sql = "SELECT UserName, CardsPlayed, CardsDrawn, TurnsPlayed, MostCardsInHand FROM Users WHERE UserID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
} else {
    echo "Error: User not found.";
    exit();
}
$stmt->close();
?>

    <main class="container mt-5">
        <div class="row justify-content-center mt-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header bg-primary text-white text-center">
                        <h4>Your Stats</h4>
                    </div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item">
                                <strong>Cards Played:</strong> <?= $user['CardsPlayed']; ?>
                            </li>
                            <li class="list-group-item">
                                <strong>Cards Drawn:</strong> <?= $user['CardsDrawn']; ?>
                            </li>
                            <li class="list-group-item">
                                <strong>Turns Played:</strong> <?= $user['TurnsPlayed']; ?>
                            </li>
                            <li class="list-group-item">
                                <strong>Most Cards In Hand:</strong> <?= $user['MostCardsInHand']; ?>
                            </li>
                        </ul>
                    </div>
                    <div class="card-footer text-center">
                        <a href="index.php" class="btn btn-secondary">Back to Game</a>
                    </div>
                </div>
            </div>
        </div>
    </main>
</body>
</html>

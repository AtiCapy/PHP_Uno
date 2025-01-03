<?php
require_once 'config.php';
require_once 'header.php';

$sql = "
    SELECT 
        (SELECT UserName FROM Users WHERE CardsPlayed = (SELECT MAX(CardsPlayed) FROM Users)) AS TopCardsPlayedUser,
        (SELECT MAX(CardsPlayed) FROM Users) AS TopCardsPlayed,
        (SELECT UserName FROM Users WHERE CardsDrawn = (SELECT MAX(CardsDrawn) FROM Users)) AS TopCardsDrawnUser,
        (SELECT MAX(CardsDrawn) FROM Users) AS TopCardsDrawn,
        (SELECT UserName FROM Users WHERE TurnsPlayed = (SELECT MAX(TurnsPlayed) FROM Users)) AS TopTurnsPlayedUser,
        (SELECT MAX(TurnsPlayed) FROM Users) AS TopTurnsPlayed,
        (SELECT UserName FROM Users WHERE MostCardsInHand = (SELECT MAX(MostCardsInHand) FROM Users)) AS TopMostCardsUser,
        (SELECT MAX(MostCardsInHand) FROM Users) AS TopMostCards
";

$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    $stats = $result->fetch_assoc();
} else {
    echo "No stats available.";
    exit();
}
?>

    <main class="container mt-5">
        <h1 class="text-center">Global Stats</h1>
        <div class="row justify-content-center mt-4">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-primary text-white text-center">
                        <h4>Highest Stats</h4>
                    </div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item">
                                <strong>Most Cards Played:</strong> 
                                <?= htmlspecialchars($stats['TopCardsPlayedUser']); ?> (<?= $stats['TopCardsPlayed']; ?>)
                            </li>
                            <li class="list-group-item">
                                <strong>Most Cards Drawn:</strong> 
                                <?= htmlspecialchars($stats['TopCardsDrawnUser']); ?> (<?= $stats['TopCardsDrawn']; ?>)
                            </li>
                            <li class="list-group-item">
                                <strong>Most Turns Played:</strong> 
                                <?= htmlspecialchars($stats['TopTurnsPlayedUser']); ?> (<?= $stats['TopTurnsPlayed']; ?>)
                            </li>
                            <li class="list-group-item">
                                <strong>Most Cards in Hand:</strong> 
                                <?= htmlspecialchars($stats['TopMostCardsUser']); ?> (<?= $stats['TopMostCards']; ?>)
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
<?php
require 'config.php';
session_start();

$userId = $_SESSION['UserID'] ?? null;

if (!$userId) {
    http_response_code(401);
    echo json_encode(['error' => 'User not authenticated']);
    exit;
}

$updates = json_decode(file_get_contents('php://input'), true);

if (!is_array($updates) || empty($updates)) {
    http_response_code(400);
    echo json_encode(['error' => 'No valid updates provided']);
    exit;
}

$conn->begin_transaction();

try {
    foreach ($updates as $action => $value) {
        switch ($action) {
            case 'incrementCardsPlayed':
                $sql = "UPDATE Users SET CardsPlayed = CardsPlayed + ? WHERE UserID = ?";
                break;
            case 'incrementCardsDrawn':
                $sql = "UPDATE Users SET CardsDrawn = CardsDrawn + ? WHERE UserID = ?";
                break;
            case 'incrementTurnsPlayed':
                $sql = "UPDATE Users SET TurnsPlayed = TurnsPlayed + ? WHERE UserID = ?";
                break;
            case 'updateMostCardsInHand':
                $sql = "UPDATE Users SET MostCardsInHand = GREATEST(MostCardsInHand, ?) WHERE UserID = ?";
                break;
            default:
                continue;
        }

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $value, $userId);
        $stmt->execute();
    }

    $conn->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['error' => 'Failed to update stats: ' . $e->getMessage()]);
}
?>

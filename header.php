<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="style.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
    <title>PHP Uno</title>
    <link rel="icon" href="data:,">
</head>
<body>
    <header class="header">
        <nav>
            <a href="https://github.com/AtiCapy/PHP_Uno">github</a> 
            <a href="index.php">Game</a>
            <?php if (isset($_SESSION['UserID'])): ?>
                <a href="profile.php"><?= htmlspecialchars($_SESSION['UserName']); ?>'s Profile</a>
                <a href="logout.php">Logout</a>
            <?php else: ?>
                <a href="login.php">Login</a>
                <a href="registration.php">Registration</a>
            <?php endif; ?>
            <a href="stats.php">Stats</a>
            </nav>
    </header>

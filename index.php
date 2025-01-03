<?php
require_once 'header.php';

if (!isset($_SESSION['UserID'])) {
    echo "<h2 class='text-center'>You must log in to play the game.</h2>";
    exit;
}

?>
    
<script> const userID = <?= json_encode($_SESSION['UserID']); ?>; </script>
<script src="script.js" defer></script>

    <main class="body-content container-fluid mt-4">
        <div class="row justify-content-center">
            <div class="col-md-4 col-sm-6 mb-3">
                <div id="menu" class="stat-container p-4 bg-light rounded shadow">
                    <div class="text-center mb-3">
                        <h2 id="title" class="text-primary">Uno</h2>
                    </div>
                    <div class="d-grid gap-2">
                        <button class="btn btn-secondary btn-lg" onclick="clickStart()">Start</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="row justify-content-center">
            <div id="game" class="col-lg-6 col-md-8 col-sm-10">
                <div class="p-4 bg-white rounded shadow">
                    <div id="gameDiv" class="mb-4">
                        <canvas id="gameCanvas" class="w-100 border rounded"></canvas>
                    </div>
                    <div class="row">
                        <div id="handDiv" class="col-md-9 scroll-container border rounded p-3 mb-3">
                            <div id="cardContainer" class="d-flex flex-wrap gap-2"></div>
                        </div>
                        <div class="col-md-3 d-flex flex-column align-items-center gap-3">
                            <button id="btnDrawCard" class="btn btn-secondary w-100" onclick="drawCard()">Draw Card</button>
                            <div class="stat-container text-center">
                                <p id="cardCount" class="mb-1">Opponent has 7 cards</p>
                                <p id="deckCount">92 cards in deck</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</body>
</html>
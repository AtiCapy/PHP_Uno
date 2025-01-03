// Több elkébzelésem is volt, hogyan is csináljam ezt meg.
// Ezért lehet maradt néhány kódrész ami fölösleges
console.log("Logged-in User ID:", userID);
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let canPlay = true;
let statUpdates = {};
let maxCardsInHand = 0;

function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

function StartGame() {
    if (gameController.gameOver) {
        resetGame();
    }

    document.getElementById("menu").style.visibility = "hidden";
    document.getElementById("game").style.visibility = "visible";
}

const CardColor = {
    Red: 'Red',
    Green: 'Green',
    Blue: 'Blue',
    Yellow: 'Yellow',
    Wild: 'Wild'
};

const CardType = {
    Number: 'Number',
    Draw2: 'Draw2',
    Draw4Wild: 'Draw4Wild',
    Skip: 'Skip',
    Wild: 'Wild'
};

class Card {
    constructor(color, type, num = -1) {
        this.color = color;
        this.type = type;
        this.num = num;
        this.isHovered = false;
        this.isAnimating = false;
    }

    getText(){
        if (this.type === CardType.Wild) return ["Wild"];
        if (this.type === CardType.Draw4Wild) return ["Wild", "Draw 4"];
        if (this.type === CardType.Skip) return [this.color, "Skip"];
        if (this.type === CardType.Draw2) return [this.color, "Draw 2"];
        if (this.type === CardType.Number) return [this.color, this.num === 0 ? "0" : this.num];
        return [""];
    }

    render(){
        const cardElement = document.createElement("button");
        cardElement.classList.add("uno-card");
        cardElement.style.backgroundColor = this.color === "Wild" ? "gray" : this.color.toLowerCase();

        const textLines = this.getText();
        cardElement.innerHTML = textLines.map(line => `<div>${line}</div>`).join("");
        return cardElement;
    }

    draw(x, y) {
        ctx.fillStyle = this.color === 'Wild' ? 'gray' : this.color.toLowerCase();
        ctx.fillRect(x, y, 40, 64);
    
        ctx.font = "14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "black";
        ctx.fillStyle = "white";
    
        const textLines = this.getText();
        textLines.forEach((line, index) => {
            const textY = y + 32 + (index * 16) - (textLines.length === 2 ? 8 : 0);
            ctx.strokeText(line, x + 20, textY);
            ctx.fillText(line, x + 20, textY);
        });
    }
    
}


class Deck {
    constructor() {
        this.cards = [];
        this.initDeck();
    }

    initDeck() {
        const colors = [CardColor.Red, CardColor.Green, CardColor.Blue, CardColor.Yellow];
        for (const color of colors) {
            for (let i = 0; i <= 9; i++) {
                this.cards.push(new Card(color, CardType.Number, i));
                if (i !== 0) this.cards.push(new Card(color, CardType.Number, i));
            }
            this.cards.push(new Card(color, CardType.Draw2));
            this.cards.push(new Card(color, CardType.Skip));
        }
        for (let i = 0; i < 4; i++) {
            this.cards.push(new Card(CardColor.Wild, CardType.Wild));
            this.cards.push(new Card(CardColor.Wild, CardType.Draw4Wild));
        }
    }

    drawCard() {
        if (this.cards.length > 0){
            const index = Math.floor(Math.random() * this.cards.length);
            return this.cards.splice(index, 1)[0];
        }
    }
}

class Hand {
    constructor(deck) {
        this.cards = [];
        for (let i = 0; i < 7; i++) {
            this.cards.push(deck.drawCard());
        }
    }

    playCard(index) {
        return this.cards.splice(index, 1)[0];
    }

    isPlayable(card, topCard) {
        return (
            card.color === topCard.color || 
            (card.type === CardType.Number && card.num === topCard.num) || 
            card.color === CardColor.Wild
        );
    }
}

class Pile {
    constructor(deck) {
        this.cards = [];
        this.setFirstCard(deck);
    }

    setFirstCard(deck) {
        let firstCard;

        while (true) {
            firstCard = deck.drawCard();
            if (firstCard.type === CardType.Number) {
                this.cards.push(firstCard);
                break;
            } else {
                deck.cards.push(firstCard);
            }
        }
    }

    drawPile() {
        const topCard = this.cards[this.cards.length - 1];
        topCard.draw(canvas.width / 2 - 15, canvas.height / 2 - 30);
    }

    addCard(card) {
        this.cards.push(card);
    }

    getTopCard() {
        return this.cards[this.cards.length - 1];
    }
}


class Player {
    constructor(deck) {
        this.hand = [];
        this.deck = deck;

        for (let i = 0; i < 7; i++) {
            this.hand.push(this.deck.drawCard());
        }
    }

    drawCard() {
        if (this.deck.cards.length > 0){
            const card = this.deck.drawCard();
            this.hand.push(card);
            return card;
        }
    }

    getPlayableCards(topCard) {
        return this.hand.filter(card => this.isPlayable(card, topCard));
    }

    isPlayable(card, topCard) {
        return (
            card.color === topCard.color ||
            (card.type === CardType.Number && card.num === topCard.num) ||
            card.color === CardColor.Wild
        );
    }

    playCard(index) {
        return this.hand.splice(index, 1)[0];
    }
}

class MachinePlayer extends Player {
    makeMove(topCard) {
        const playableCards = this.getPlayableCards(topCard);
        
        let chosenCard = null;
        
        if (playableCards.length > 0) {
            chosenCard = playableCards[Math.floor(Math.random() * playableCards.length)];
            this.hand.splice(this.hand.indexOf(chosenCard), 1);
        } else {
            this.drawCard(); 
        }

        return { player: this, card: chosenCard };
    }
}

class GameController {
    constructor(deck, player1, player2, pile) {
        this.deck = deck;
        this.player1 = player1;
        this.player2 = player2;
        this.pile = pile;
        this.currentTurn = this.player1;
        this.waitingForColorSelection = false;
        this.gameOver = false;
        this.turn = 0;
    }

    async applyCardEffect(card) {
        if (card.type === CardType.Draw2) {
            this.drawCards(this.getOpponentHand(), 2);
        } else if (card.type === CardType.Skip) {
            this.switchTurn();
        } else if (card.type === CardType.Wild || card.type === CardType.Draw4Wild) {
            if (this.currentTurn === this.player1) this.waitingForColorSelection = true;
            await this.handleWildCardEffect(card);
        }
    }

    getOpponentHand() {
        return this.currentTurn === this.player1 ? this.player2.hand : this.player1.hand;
    }

    drawCards(hand, count) {
        for (let i = 0; i < count; i++) {
            if (this.deck.cards.length > 0){
                hand.push(this.deck.drawCard());
            }
        }
        if (this.currentTurn === this.player2) { // ÚJ
            queueStatUpdate('incrementCardsDrawn', count);
            queueStatUpdate('updateMostCardsInHand', this.player1.hand.length);
        }
        updateCardContainer();
    }


    playerDrawCard() {
        this.currentTurn.drawCard();
        if (this.currentTurn === this.player1) { // ÚJ
            queueStatUpdate('incrementCardsDrawn', 1);
            queueStatUpdate('updateMostCardsInHand', this.player1.hand.length);
        }
        updateCardContainer();

        this.switchTurn();
        this.playTurn();
    }

    handleWildCardEffect(card) {
        return new Promise((resolve) => {
            const selectColor = (chosenColor) => {
                this.pile.getTopCard().color = chosenColor;
                if (card.type === CardType.Draw4Wild) {
                    this.drawCards(this.getOpponentHand(), 4);
                }
                this.waitingForColorSelection = false;
                resolve();
            };

            if (this.currentTurn === this.player1) {
                showColorSelection(selectColor);
            } else {
                const randomColor = ["Red", "Green", "Blue", "Yellow"][Math.floor(Math.random() * 4)];
                selectColor(randomColor);
            }
            updateCardContainer();
        });  
    }

    async processMove(move) {
        const { player, card } = move;

        if (player !== this.currentTurn) {
            console.warn("Not this player's turn!");
            return;
        }

        if (card) {
            this.pile.addCard(card);
            await this.applyCardEffect(card);
            updateCardContainer();
            pile.drawPile();
        }

        this.switchTurn();
        this.playTurn();
        // Aszinkronikus ez a metódus, mert meg kell várni a szín kiválasztását a gépnek
        // próbáltam máshogyan, ezért lehet néhány helyen fölöslegesen van 'waitingForColorSelection'

    }

    playTurn() {
        if (this.waitingForColorSelection || this.gameOver) return;

        if (this.currentTurn === this.player1) {
        } else {
            const topCard = this.pile.getTopCard();
            const move = this.player2.makeMove(topCard);
            if (!move.card) {
                this.switchTurn();
            } else {
                this.processMove(move);
            }
        }
    }

    updateCardCount() {
        const cardCount = machinePlayer.hand.length;
        const deckCount = deck.cards.length;
        document.getElementById("cardCount").textContent = `Opponent has ${cardCount} card${cardCount !== 1 ? 's' : ''}`;
        document.getElementById("deckCount").textContent = `${deckCount} card${deckCount !== 1 ? 's' : ''} in deck`;
    }

    switchTurn() {
        this.currentTurn = this.currentTurn === this.player1 ? this.player2 : this.player1;
        this.winCondition();
        this.updateCardCount();
        console.log(this.deck.cards.length);
        console.log(player.hand);
        console.log(machinePlayer.hand);
        console.log(pile.cards[pile.cards.length - 1]);
        console.log(
            (this.currentTurn === this.player1 ? "end machine's turn" : "end player's turn") +
                "turn: " +
                this.turn
        );

        if (this.currentTurn === this.player1){ // ÚJ
            queueStatUpdate('incrementTurnsPlayed');
        }

        this.turn++;
    }

    winCondition() {
        if (this.player1.hand.length === 0) {
            this.endGame("You won!");
        } else if (this.player2.hand.length === 0) {
            this.endGame("You lost!");
        }
    }

    endGame(message) {
        this.gameOver = true;
        const menu = document.getElementById("menu");
        document.getElementById("game").style.visibility = "hidden";
        menu.style.visibility = "visible";
        document.getElementById("title").textContent = message;
        if (message == "You won!"){
            menu.classList.remove("stat-container");
            menu.classList.remove("loss");
            menu.classList.add("win");
        } else if (message == "You lost!"){
            menu.classList.remove("stat-container");
            menu.classList.remove("win");
            menu.classList.add("loss");
        }
    }
}


const deck = new Deck();
const player = new Player(deck);
const machinePlayer = new MachinePlayer(deck);
const pile = new Pile(deck);
const gameController = new GameController(deck, player, machinePlayer, pile);

GameController.prototype.playTurn = function () {
    if (this.waitingForColorSelection) return;

    const topCard = this.pile.getTopCard();

    if (this.currentTurn === this.player1) {
        return;
    } else if (this.currentTurn === this.player2) {
        const move = this.player2.makeMove(topCard);
        if (move.card) {
            machinePlayCard(move.card);
        } else {
            this.switchTurn();
        }
    }
};

function resetGame(deck, player, machinePlayer, pile) {
    deck.cards = [];
    deck.initDeck();

    player.hand = [];
    for (let i = 0; i < 7; i++) {
        player.hand.push(deck.drawCard());
    }

    machinePlayer.hand = [];
    for (let i = 0; i < 7; i++) {
        machinePlayer.hand.push(deck.drawCard());
    }

    pile.cards = [];
    pile.setFirstCard(deck);

    gameController.deck = deck;
    gameController.player1 = player;
    gameController.player2 = machinePlayer;
    gameController.pile = pile;
    gameController.currentTurn = player;
    gameController.waitingForColorSelection = false;
    gameController.gameOver = false;
    gameController.turn = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pile.drawPile();
    updateCardContainer();

    console.log("Game has been fully reset.");
}

function StartGame(deck, player, machinePlayer, pile) {
    if (gameController.gameOver) {
        resetGame(deck, player, machinePlayer, pile);
    }

    document.getElementById("menu").style.visibility = "hidden";
    document.getElementById("game").style.visibility = "visible";
    gameController.updateCardCount();
}

function clickStart(){
    StartGame(deck, player, machinePlayer, pile);
}

function createCards() {
    const cardContainer = document.getElementById("cardContainer");
    player.hand.forEach(card => {
        const cardElement = card.render();
        cardContainer.appendChild(cardElement);
    });
    updateCardContainer();
    gameController.updateCardCount();
}

pile.drawPile();
createCards();

function drawCard() {
    if (gameController.deck.cards.length > 0){
        if (!gameController.waitingForColorSelection) {
            gameController.playerDrawCard();
        }
    } else {
        gameController.switchTurn();
        document.getElementById("btnDrawCard").textContent = "Skip turn";
    }
    
}

function updateCardContainer() {
    const cardContainer = document.getElementById("cardContainer");
    cardContainer.innerHTML = "";

    queueStatUpdate('updateMostCardsInHand', player.hand.length); // ÚJ

    const topCard = pile.getTopCard();

    player.hand.forEach((card, index) => {
        const cardElement = card.render();

        const isPlayable = player.isPlayable(card, topCard);
        cardElement.disabled = !isPlayable;
        cardElement.classList.toggle("playable", isPlayable);

        cardElement.onclick = () => {
            if (isPlayable) {
                playCard(index);
            }
        };

        cardContainer.appendChild(cardElement);
    });
}

function playCard(index) {
    if (!canPlay || gameController.waitingForColorSelection) {
        return;
    }

    canPlay = false;

    const playedCard = player.playCard(index);
    const startX = canvas.width / 2 - 25;
    const startY = canvas.height - 100;
    const endX = canvas.width / 2 - 20;
    const endY = canvas.height / 2 - 35;

    animateCard(playedCard, startX, startY, endX, endY, () => {
        gameController.processMove({ player: gameController.player1, card: playedCard });

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pile.drawPile();
        updateCardContainer();
        queueStatUpdate('incrementCardsPlayed'); // ÚJ
        canPlay = true;
    });
}

function showColorSelection(onColorSelected) {
    const colorOptions = ["Red", "Green", "Blue", "Yellow"];
    const colorContainer = document.createElement("div");
    colorContainer.classList.add("color-selection");
    colorContainer.classList.add("row");
    colorContainer.classList.add("justify-content-center");

    colorOptions.forEach(color => {
        const colorButton = document.createElement("button");
        colorButton.innerText = color;
        colorButton.classList.add("col-1");
        colorButton.style.backgroundColor = color.toLowerCase();
        colorButton.onclick = () => {
            onColorSelected(color);
            document.body.removeChild(colorContainer);
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pile.drawPile();
        };
        colorContainer.appendChild(colorButton);
    });

    document.body.appendChild(colorContainer);
}

function animateCard(card, startX, startY, endX, endY, callback) {
    const duration = 500;
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pile.drawPile();
        card.draw(currentX, currentY);

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            callback();
        }
    }

    requestAnimationFrame(step);
}

function machinePlayCard(card) {
    canPlay = false;

    const startX = canvas.width / 2 - 25;
    const startY = 20;
    const endX = canvas.width / 2 - 20;
    const endY = canvas.height / 2 - 35;

    animateCard(card, startX, startY, endX, endY, () => {
        gameController.processMove({ player: gameController.player2, card });

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pile.drawPile();
        updateCardContainer();
        canPlay = true;
    });
}

// ÚJ

function queueStatUpdate(action, value = 1) {
    if (action === 'updateMostCardsInHand') {
        maxCardsInHand = Math.max(maxCardsInHand, value);
        statUpdates[action] = maxCardsInHand;
        console.log(`Queued update: ${action} = ${statUpdates[action]} (max: ${maxCardsInHand})`);
    } else {
        if (statUpdates[action]) {
            statUpdates[action] += value;
        } else {
            statUpdates[action] = value;
        }
        console.log(`Queued update: ${action} = ${statUpdates[action]}`);
    }
}

async function sendStatUpdates() {
    if (Object.keys(statUpdates).length === 0) return;

    console.log("Sending stat updates:", statUpdates);

    try {
        const response = await fetch('update_stats.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(statUpdates),
        });

        if (!response.ok) {
            console.error('Failed to send stat updates:', await response.text());
        } else {
            console.log('Stat updates successful');
            statUpdates = {};
            maxCardsInHand = 0;
        }
    } catch (error) {
        console.error('Error sending stat updates:', error);
    }
    console.log("Payload being sent:", statUpdates);
}

setInterval(sendStatUpdates, 5000);
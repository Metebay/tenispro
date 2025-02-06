const paddle1 = document.getElementById('paddle1');
const paddle2 = document.getElementById('paddle2');
const ball = document.getElementById('ball');
const singlePlayerButton = document.getElementById('singlePlayer');
const multiPlayerButton = document.getElementById('multiPlayer');
const score1Element = document.getElementById('score1');
const score2Element = document.getElementById('score2');
const difficultySelect = document.getElementById('difficulty');
const winnerMessage = document.getElementById('winnerMessage');

// Ses elementleri
const paddleSound = document.getElementById('paddleSound');
const scoreSound = document.getElementById('scoreSound');
const wallSound = document.getElementById('wallSound');

// Oyun ayarları
const config = {
    paddleSpeed: 8,
    initialBallSpeed: 5,
    maxBallSpeed: 12,
    speedIncrease: 0.3,
    winningScore: 5,
    computerReaction: {
        easy: 0.8,
        medium: 0.9,
        hard: 0.95
    }
};

let gameState = {
    paddle1Y: 200,
    paddle2Y: 200,
    ballX: 391,
    ballY: 241,
    ballSpeedX: config.initialBallSpeed,
    ballSpeedY: config.initialBallSpeed,
    score1: 0,
    score2: 0,
    isGameActive: false,
    isSinglePlayer: true,
    currentDifficulty: 'medium'
};

// Oyun başlatma
function initializeGame() {
    gameState.isGameActive = true;
    document.querySelector('.menu').style.opacity = '0';
    resetBall();
    gameLoop();
}

// Top resetleme
function resetBall() {
    gameState.ballX = 391;
    gameState.ballY = 241;
    gameState.ballSpeedX = config.initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
    gameState.ballSpeedY = config.initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
}

// Çarpışma kontrolü
function checkCollision() {
    // Duvarlarla çarpışma
    if (gameState.ballY <= 0 || gameState.ballY >= 482) {
        gameState.ballSpeedY *= -1;
        wallSound.currentTime = 0;
        wallSound.play();
    }

    // Raketlerle çarpışma
    const paddleCollision = (paddleY, isLeft) => {
        const paddleCenter = paddleY + 45;
        const hitPosition = (gameState.ballY - paddleCenter) / 45;
        const angle = hitPosition * (Math.PI/4);
        
        const speed = Math.hypot(gameState.ballSpeedX, gameState.ballSpeedY);
        gameState.ballSpeedX = speed * Math.cos(angle) * (isLeft ? 1 : -1);
        gameState.ballSpeedY = speed * Math.sin(angle);
        
        // Hız sınırı
        const currentSpeed = Math.hypot(gameState.ballSpeedX, gameState.ballSpeedY);
        if (currentSpeed < config.maxBallSpeed) {
            gameState.ballSpeedX *= 1 + config.speedIncrease;
            gameState.ballSpeedY *= 1 + config.speedIncrease;
        }

        paddleSound.currentTime = 0;
        paddleSound.play();
    };

    if (gameState.ballX <= 32 && 
        gameState.ballY + 18 >= gameState.paddle1Y && 
        gameState.ballY <= gameState.paddle1Y + 90) {
        paddleCollision(gameState.paddle1Y, true);
    }

    if (gameState.ballX >= 750 && 
        gameState.ballY + 18 >= gameState.paddle2Y && 
        gameState.ballY <= gameState.paddle2Y + 90) {
        paddleCollision(gameState.paddle2Y, false);
    }
}

// Bilgisayar AI
function computerAI() {
    if (gameState.isSinglePlayer) {
        const reactionSpeed = config.computerReaction[gameState.currentDifficulty];
        const targetY = gameState.ballY - 45 + 
                       (Math.random() - 0.5) * 30 * (1 - reactionSpeed);
        
        gameState.paddle1Y += (targetY - gameState.paddle1Y) * 0.1 * reactionSpeed;
        gameState.paddle1Y = Math.max(0, Math.min(410, gameState.paddle1Y));
    }
}

// Skor güncelleme
function updateScore() {
    if (gameState.ballX <= 0) {
        gameState.score2++;
        score2Element.textContent = gameState.score2;
        scoreSound.play();
        checkWinner();
        resetBall();
    }
    if (gameState.ballX >= 782) {
        gameState.score1++;
        score1Element.textContent = gameState.score1;
        scoreSound.play();
        checkWinner();
        resetBall();
    }
}

// Kazanan kontrolü
function checkWinner() {
    if (gameState.score1 >= config.winningScore) {
        showWinner("OYUNCU 1 KAZANDI!");
    } else if (gameState.score2 >= config.winningScore) {
        showWinner(gameState.isSinglePlayer ? "BİLGİSAYAR KAZANDI!" : "OYUNCU 2 KAZANDI!");
    }
}

function showWinner(message) {
    winnerMessage.textContent = message;
    winnerMessage.style.opacity = '1';
    gameState.isGameActive = false;
    setTimeout(() => {
        winnerMessage.style.opacity = '0';
        resetGame();
    }, 3000);
}

function resetGame() {
    gameState.score1 = 0;
    gameState.score2 = 0;
    score1Element.textContent = '0';
    score2Element.textContent = '0';
    document.querySelector('.menu').style.opacity = '1';
}

// Oyun döngüsü
function gameLoop() {
    if (!gameState.isGameActive) return;

    gameState.ballX += gameState.ballSpeedX;
    gameState.ballY += gameState.ballSpeedY;

    checkCollision();
    updateScore();
    computerAI();

    // Görsel güncellemeler
    paddle1.style.top = `${gameState.paddle1Y}px`;
    paddle2.style.top = `${gameState.paddle2Y}px`;
    ball.style.left = `${gameState.ballX}px`;
    ball.style.top = `${gameState.ballY}px`;

    requestAnimationFrame(gameLoop);
}

// Kontroller
document.addEventListener('keydown', (e) => {
    if (!gameState.isGameActive) return;

    switch(e.key) {
        case 'w':
            gameState.paddle1Y = Math.max(gameState.paddle1Y - config.paddleSpeed, 0);
            break;
        case 's':
            gameState.paddle1Y = Math.min(gameState.paddle1Y + config.paddleSpeed, 410);
            break;
        case 'ArrowUp':
            gameState.paddle2Y = Math.max(gameState.paddle2Y - config.paddleSpeed, 0);
            break;
        case 'ArrowDown':
            gameState.paddle2Y = Math.min(gameState.paddle2Y + config.paddleSpeed, 410);
            break;
    }
});

// Menü etkileşimleri
singlePlayerButton.addEventListener('click', () => {
    gameState.isSinglePlayer = true;
    gameState.currentDifficulty = difficultySelect.value;
    initializeGame();
});

multiPlayerButton.addEventListener('click', () => {
    gameState.isSinglePlayer = false;
    initializeGame();
});

// Zorluk seçimi
difficultySelect.addEventListener('change', () => {
    gameState.currentDifficulty = difficultySelect.value;
});

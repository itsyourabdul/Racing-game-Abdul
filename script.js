const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

let score = 0;
let gameRunning = false;
let speed = 5;

// Player car
const player = {
    x: 180,
    y: 450,
    width: 40,
    height: 70,
    speed: 8
};

// Road lines
let roadLines = [];
for (let i = 0; i < 10; i++) {
    roadLines.push({ y: i * 80 });
}

// Obstacles (oncoming cars)
let obstacles = [];
let frameCount = 0;

// Keyboard controls
const keys = {};

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

function drawRoad() {
    // Road background
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Road sides
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 80, canvas.height);
    ctx.fillRect(canvas.width - 80, 0, 80, canvas.height);

    // Road lines
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 8;
    roadLines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 5, line.y);
        ctx.lineTo(canvas.width / 2 - 5, line.y + 40);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + 5, line.y);
        ctx.lineTo(canvas.width / 2 + 5, line.y + 40);
        ctx.stroke();

        line.y += speed;
        if (line.y > canvas.height) line.y = -60;
    });
}

function drawPlayer() {
    ctx.fillStyle = '#0f0';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Simple car details
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 5, player.y + 10, player.width - 10, 20); // windshield
}

function drawObstacles() {
    ctx.fillStyle = '#f00';
    obstacles.forEach((obs, index) => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        
        obs.y += speed + 2; // obstacles move faster
        
        // Remove off-screen obstacles
        if (obs.y > canvas.height) {
            obstacles.splice(index, 1);
            score += 10;
        }
    });
}

function checkCollision() {
    for (let obs of obstacles) {
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            return true;
        }
    }
    return false;
}

function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRoad();
    drawPlayer();
    drawObstacles();

    // Player movement
    if (keys['ArrowLeft'] && player.x > 90) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - 90 - player.width) player.x += player.speed;
    if (keys['ArrowUp']) speed = Math.min(12, speed + 0.2); // boost

    // Spawn obstacles
    frameCount++;
    if (frameCount % 60 === 0) {
        const obsWidth = 40;
        const obsX = 100 + Math.random() * (canvas.width - 200 - obsWidth);
        obstacles.push({
            x: obsX,
            y: -70,
            width: obsWidth,
            height: 70
        });
    }

    // Increase difficulty
    if (score > 0 && score % 200 === 0) {
        speed = Math.min(15, speed + 0.5);
    }

    score += 1;
    scoreElement.textContent = `Score: ${Math.floor(score)}`;

    if (checkCollision()) {
        gameRunning = false;
        finalScoreElement.textContent = `Score: ${Math.floor(score)}`;
        gameOverScreen.style.display = 'flex';
    } else {
        requestAnimationFrame(gameLoop);
    }
}

function startGame() {
    score = 0;
    speed = 5;
    obstacles = [];
    player.x = 180;
    frameCount = 0;
    gameRunning = true;
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    scoreElement.textContent = 'Score: 0';
    gameLoop();
}

// Button events
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Show start screen initially
startScreen.style.display = 'flex';

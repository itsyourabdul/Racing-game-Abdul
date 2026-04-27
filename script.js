<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Racing Game</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #111;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .game-container {
            position: relative;
            width: 400px;
            text-align: center;
        }

        #game-area {
            border: 4px solid #fff;
            background: #222;
            overflow: hidden;
        }

        canvas {
            display: block;
        }

        #score {
            position: absolute;
            top: 10px;
            left: 10px;
            font-size: 20px;
            font-weight: bold;
            z-index: 10;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }

        #start-screen, #game-over {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 20;
        }

        #start-screen h1, #game-over h1 {
            font-size: 48px;
            margin: 0 0 20px 0;
            text-shadow: 3px 3px 6px #000;
        }

        button {
            padding: 12px 30px;
            font-size: 20px;
            background: #ff0;
            color: #000;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 20px;
        }

        button:hover {
            background: #ffd700;
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="game-container">
        <div id="score">Score: 0</div>
        <div id="game-area">
            <canvas id="canvas" width="400" height="600"></canvas>
        </div>
        <div id="start-screen">
            <h1>Racing Game</h1>
            <p>Use Arrow Keys ← → to move<br>↑ to boost speed</p>
            <button id="start-btn">Start Game</button>
        </div>
        <div id="game-over">
            <h1>Game Over</h1>
            <p id="final-score">Score: 0</p>
            <button id="restart-btn">Play Again</button>
        </div>
    </div>

    <script>
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
        let baseSpeed = 300;        // pixels per second
        let currentSpeed = baseSpeed;

        // Player car
        const player = {
            x: 180,
            y: 450,
            width: 40,
            height: 70,
            speed: 350   // pixels per second
        };

        // Road lines
        let roadLines = [];
        for (let i = 0; i < 12; i++) {
            roadLines.push({ y: i * 70 });
        }

        // Obstacles
        let obstacles = [];
        let lastSpawn = 0;

        // Keyboard
        const keys = {};
        let lastTime = 0;

        window.addEventListener('keydown', e => keys[e.key] = true);
        window.addEventListener('keyup', e => keys[e.key] = false);

        function drawRoad() {
            // Background
            ctx.fillStyle = '#333';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Shoulders
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, 80, canvas.height);
            ctx.fillRect(canvas.width - 80, 0, 80, canvas.height);

            // Center lines
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 8;

            roadLines.forEach(line => {
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 - 5, line.y);
                ctx.lineTo(canvas.width / 2 - 5, line.y + 35);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 + 5, line.y);
                ctx.lineTo(canvas.width / 2 + 5, line.y + 35);
                ctx.stroke();
            });
        }

        function drawPlayer() {
            ctx.fillStyle = '#0f0';
            ctx.fillRect(player.x, player.y, player.width, player.height);
            
            // Windshield
            ctx.fillStyle = '#000';
            ctx.fillRect(player.x + 5, player.y + 12, player.width - 10, 22);
        }

        function drawObstacles() {
            ctx.fillStyle = '#f00';
            obstacles.forEach(obs => {
                ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            });
        }

        function update(deltaTime) {
            const dt = deltaTime / 1000; // seconds

            // Move road lines
            roadLines.forEach(line => {
                line.y += currentSpeed * dt;
                if (line.y > canvas.height) line.y -= 840; // seamless loop
            });

            // Move obstacles
            for (let i = obstacles.length - 1; i >= 0; i--) {
                obstacles[i].y += (currentSpeed + 80) * dt; // obstacles faster

                if (obstacles[i].y > canvas.height) {
                    obstacles.splice(i, 1);
                    score += 10;
                }
            }

            // Player movement
            if (keys['ArrowLeft'] && player.x > 85) {
                player.x -= player.speed * dt;
            }
            if (keys['ArrowRight'] && player.x < canvas.width - 85 - player.width) {
                player.x += player.speed * dt;
            }

            // Boost
            if (keys['ArrowUp']) {
                currentSpeed = Math.min(550, currentSpeed + 400 * dt);
            } else {
                currentSpeed = Math.max(baseSpeed, currentSpeed - 300 * dt);
            }

            // Spawn obstacles
            if (Date.now() - lastSpawn > 800) {
                const obsWidth = 40;
                const obsX = 100 + Math.random() * (canvas.width - 200 - obsWidth);
                obstacles.push({
                    x: obsX,
                    y: -80,
                    width: obsWidth,
                    height: 70
                });
                lastSpawn = Date.now();
            }

            // Increase difficulty
            if (score > 0 && Math.floor(score) % 250 === 0) {
                baseSpeed = Math.min(480, baseSpeed + 20);
            }

            score += 30 * dt;
            scoreElement.textContent = `Score: ${Math.floor(score)}`;
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

        function gameLoop(timestamp) {
            if (!gameRunning) return;

            if (!lastTime) lastTime = timestamp;
            const deltaTime = timestamp - lastTime;
            lastTime = timestamp;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            update(deltaTime);
            drawRoad();
            drawPlayer();
            drawObstacles();

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
            baseSpeed = 300;
            currentSpeed = baseSpeed;
            obstacles = [];
            player.x = 180;
            lastSpawn = Date.now();
            lastTime = 0;
            gameRunning = true;

            startScreen.style.display = 'none';
            gameOverScreen.style.display = 'none';
            scoreElement.textContent = 'Score: 0';

            requestAnimationFrame(gameLoop);
        }

        startBtn.addEventListener('click', startGame);
        restartBtn.addEventListener('click', startGame);

        // Show start screen
        startScreen.style.display = 'flex';
    </script>
</body>
</html>

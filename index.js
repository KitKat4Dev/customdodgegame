const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let playerImageSrc = '';
let obstacleImageSrc = '';
let player;
let obstacles = [];
let score = 0;
let highScore = 0;
let gameInterval;
let music = new Audio();
let difficultyFactor = 1;

// Player Class
class Player {
    constructor(x, y, imageSrc, size) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        this.image = new Image();
        this.image.src = imageSrc;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    move(dx, dy) {
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x + dx));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y + dy));
    }
}

// Obstacle Class with random colors and scaling difficulty
class Obstacle {
    constructor(x, y, imageSrc, size) {
        this.x = x;
        this.y = y;
        this.width = size;
        this.height = size;
        this.image = new Image();
        this.image.src = imageSrc;
        this.speed = 2 * difficultyFactor;
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = -this.height;
            this.x = Math.random() * (canvas.width - this.width);
            score++;
            document.getElementById('score').innerText = 'Score: ' + score;
        }
    }
}

// Initialize Game
function startGame() {
    const playerSize = parseInt(document.getElementById('playerSize').value);
    const obstacleSize = parseInt(document.getElementById('obstacleSize').value);
    player = new Player(canvas.width / 2 - playerSize / 2, canvas.height / 2 - playerSize / 2, playerImageSrc, playerSize);
    obstacles = [];
    score = 0;

    const obstacleCount = parseInt(document.getElementById('obstacleCount').value);
    for (let i = 0; i < obstacleCount; i++) {
        obstacles.push(new Obstacle(Math.random() * (canvas.width - obstacleSize), Math.random() * -canvas.height, obstacleImageSrc, obstacleSize));
    }

    music.play();
    gameInterval = setInterval(gameLoop, 1000 / 60);
}

// Main Game Loop with collision detection
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw();
    obstacles.forEach(obstacle => {
        obstacle.update();
        obstacle.draw();
        if (collision(player, obstacle)) {
            clearInterval(gameInterval);
            music.pause();
            alert("Game Over! Your score: " + score);
            if (score > highScore) {
                highScore = score;
                document.getElementById('highScore').innerText = 'High Score: ' + highScore;
            }
        }
    });
}

// Collision Detection Function
function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Event Listeners for controls and settings
document.getElementById('playerImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = event => playerImageSrc = event.target.result;
    reader.readAsDataURL(file);
});

document.getElementById('obstacleImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = event => obstacleImageSrc = event.target.result;
    reader.readAsDataURL(file);
});

document.getElementById('startGame').addEventListener('click', startGame);
document.getElementById('stopGame').addEventListener('click', () => clearInterval(gameInterval));

// Player movement controls
document.addEventListener('keydown', event => {
    const moveAmount = 15;
    if (player) {
        if (event.key === 'a') player.move(-moveAmount, 0);
        if (event.key === 'd') player.move(moveAmount, 0);
        if (event.key === 'w') player.move(0, -moveAmount);
        if (event.key === 's') player.move(0, moveAmount);
    }
});

// Modal functionality for settings
const settingsButton = document.getElementById('settingsButton');
const settingsModal = document.getElementById('settingsModal');
settingsButton.onclick = () => settingsModal.style.display = 'block';
settingsModal.querySelector('.close').onclick = () => settingsModal.style.display = 'none';
document.getElementById('difficulty').addEventListener('change', event => {
    difficultyFactor = event.target.value === 'easy' ? 0.5 : event.target.value === 'medium' ? 1 : 1.5;
});

// Upload music functionality
document.getElementById('musicUpload').addEventListener('change', e => {
    const reader = new FileReader();
    reader.onload = event => {
        music.src = event.target.result;
        music.loop = true;
    };
    reader.readAsDataURL(e.target.files[0]);
});

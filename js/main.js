// js/main.js

// Importing Classes and Utilities
import InputHandler from './utils/InputHandler.js';
import Rocket from './classes/Rocket.js';
import Obstacle from './classes/Obstacle.js';
import Enemy from './classes/Enemy.js';
import PowerUp from './classes/PowerUp.js';
import Particle from './classes/Particle.js';
import { detectCollision } from './utils/Collision.js';
import { getHighScore, setHighScore } from './utils/Storage.js';

// Initialize Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set Canvas Dimensions (80% of the viewport)
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

// Load Images
const images = {
    rocket: new Image(),
    obstacle: new Image(),
    enemy: new Image(),
    powerup: new Image(),
    explosion: new Image(),
};

images.rocket.src = 'assets/images/rocket.png';
images.obstacle.src = 'assets/images/obstacle.png';
images.enemy.src = 'assets/images/enemy.png';
images.powerup.src = 'assets/images/powerup.png';
images.explosion.src = 'assets/images/explosion.png';

// Load Sounds
const sounds = {
    thrustSound: document.getElementById('thrustSound'),
    collisionSound: document.getElementById('collisionSound'),
    powerupSound: document.getElementById('powerupSound'),
    backgroundMusic: document.getElementById('backgroundMusic'),
    explosionSound: document.getElementById('explosionSound'),
    levelUpSound: document.getElementById('levelUpSound'),
};

// Configure Background Music
sounds.backgroundMusic.volume = 0.3;
sounds.backgroundMusic.loop = true;

// Initialize Input Handler
const input = new InputHandler();

// Initialize Rocket
const rocket = new Rocket(canvas, images, sounds, input);

// Game Variables
let obstacles = [];
let enemies = [];
let powerUps = [];
let particles = [];
let score = 0;
let highScore = getHighScore();
let level = 1;
const levelThreshold = 1000; // Points to reach next level
let gameOver = false;
let spawnTimer = 0;
let enemySpawnTimer = 0;
let powerUpSpawnTimer = 0;

// UI Elements
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
highScoreElement.textContent = `High Score: ${highScore}`;

const pauseButton = document.getElementById('pause-button');
const settingsButton = document.getElementById('settings-button');
const settingsMenu = document.getElementById('settings-menu');
const closeSettingsButton = document.getElementById('close-settings');
const bgMusicToggle = document.getElementById('bg-music-toggle');
const thrustSoundToggle = document.getElementById('thrust-sound-toggle');

let isPaused = false;

// Game Over Screen Elements
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

// Start Screen Elements
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');

// Power-Up Effect Variables
let isShielded = false;
let shieldTimer = 0;
let speedBoost = false;
let speedTimer = 0;

// Handle Pause Functionality
pauseButton.addEventListener('click', () => {
    togglePause();
});

// Handle Restart Functionality
restartButton.addEventListener('click', () => {
    resetGame();
});

// Handle Settings Menu
settingsButton.addEventListener('click', () => {
    settingsMenu.style.display = 'block';
});

closeSettingsButton.addEventListener('click', () => {
    settingsMenu.style.display = 'none';
});

bgMusicToggle.addEventListener('change', () => {
    sounds.backgroundMusic.muted = !bgMusicToggle.checked;
});

thrustSoundToggle.addEventListener('change', () => {
    sounds.thrustSound.muted = !thrustSoundToggle.checked;
});

/**
 * Toggles the pause state of the game.
 */
function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        sounds.backgroundMusic.pause();
        sounds.thrustSound.pause();
        gameOverScreen.style.display = 'block';
        pauseButton.innerHTML = '<img src="assets/images/icons/play-button.png" alt="Play">';
    } else {
        sounds.backgroundMusic.play();
        if (rocket.isThrusting) sounds.thrustSound.play();
        gameOverScreen.style.display = 'none';
        pauseButton.innerHTML = '<img src="assets/images/icons/pause-button.png" alt="Pause">';
    }
}

/**
 * Resets the game to its initial state.
 */
function resetGame() {
    obstacles = [];
    enemies = [];
    powerUps = [];
    particles = [];
    score = 0;
    level = 1;
    gameOver = false;
    spawnTimer = 0;
    enemySpawnTimer = 0;
    powerUpSpawnTimer = 0;
    isShielded = false;
    shieldTimer = 0;
    speedBoost = false;
    speedTimer = 0;

    // Reset Rocket Position and Rotation
    rocket.x = canvas.width / 2;
    rocket.y = canvas.height - 100;
    rocket.rotation = 0;

    // Update UI
    scoreElement.textContent = `Score: ${score}`;
    gameOverScreen.style.display = 'none';

    // Play Background Music
    sounds.backgroundMusic.play();

    // Start Game Loop
    requestAnimationFrame(gameLoop);
}

/**
 * Spawns a new obstacle.
 */
function spawnObstacle() {
    obstacles.push(new Obstacle(canvas, images.obstacle));
}

/**
 * Spawns a new enemy.
 */
function spawnEnemy() {
    enemies.push(new Enemy(canvas, images.enemy));
}

/**
 * Spawns a new power-up with a random type.
 */
function spawnPowerUp() {
    const types = ['score', 'shield', 'speed'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerUps.push(new PowerUp(canvas, images.powerup, type));
}

/**
 * Handles the application of power-up effects based on type.
 * @param {string} type - The type of power-up collected.
 */
function handlePowerUp(type) {
    switch (type) {
        case 'score':
            score += 100;
            break;
        case 'shield':
            isShielded = true;
            shieldTimer = 5000; // Shield lasts for 5 seconds
            break;
        case 'speed':
            speedBoost = true;
            rocket.speed += 3;
            speedTimer = 5000; // Speed boost lasts for 5 seconds
            break;
        default:
            break;
    }
}

/**
 * Creates an explosion particle effect at the specified coordinates.
 * @param {number} x - The x-coordinate of the explosion.
 * @param {number} y - The y-coordinate of the explosion.
 */
function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(canvas, x, y, '#FF4500'));
    }
    sounds.explosionSound.play();
}

/**
 * Updates active power-up effects.
 * @param {number} deltaTime - The time elapsed since the last frame.
 */
function updatePowerUps(deltaTime) {
    if (isShielded) {
        shieldTimer -= deltaTime;
        if (shieldTimer <= 0) {
            isShielded = false;
        }
    }

    if (speedBoost) {
        speedTimer -= deltaTime;
        if (speedTimer <= 0) {
            speedBoost = false;
            rocket.speed -= 3;
        }
    }
}

/**
 * Toggles game over state and updates the UI accordingly.
 */
function handleGameOver() {
    if (gameOver) {
        sounds.backgroundMusic.pause();
        sounds.thrustSound.pause();
        gameOverScreen.style.display = 'block';
        finalScoreElement.textContent = `Your Score: ${score}`;
    }
}

/**
 * Updates the score and handles level progression.
 */
function updateScoreAndLevel() {
    score += 1;
    scoreElement.textContent = `Score: ${score}`;

    if (score >= level * levelThreshold) {
        level++;
        sounds.levelUpSound.play();
        // Increase rocket speed for added difficulty
        rocket.speed += 0.5;
    }
}

/**
 * Updates all game entities and handles their interactions.
 * @param {number} deltaTime - The time elapsed since the last frame.
 */
function updateEntities(deltaTime) {
    // Update Rocket
    rocket.update();

    // Update Obstacles
    obstacles.forEach((obstacle, index) => {
        obstacle.update();

        // Check Collision with Rocket
        if (detectCollision(rocket, obstacle)) {
            if (isShielded) {
                // Destroy the obstacle and create explosion
                obstacles.splice(index, 1);
                createExplosion(obstacle.x, obstacle.y);
            } else {
                sounds.collisionSound.play();
                createExplosion(obstacle.x, obstacle.y);
                gameOver = true;
                setHighScore(score);
                highScoreElement.textContent = `High Score: ${getHighScore()}`;
            }
        }

        // Remove Off-Screen Obstacles
        if (obstacle.isOffScreen()) {
            obstacles.splice(index, 1);
        }
    });

    // Update Enemies
    enemies.forEach((enemy, index) => {
        enemy.update();

        // Check Collision with Rocket
        if (detectCollision(rocket, enemy)) {
            if (isShielded) {
                // Destroy the enemy and create explosion
                enemies.splice(index, 1);
                createExplosion(enemy.x, enemy.y);
            } else {
                sounds.collisionSound.play();
                createExplosion(enemy.x, enemy.y);
                gameOver = true;
                setHighScore(score);
                highScoreElement.textContent = `High Score: ${getHighScore()}`;
            }
        }

        // Remove Off-Screen Enemies
        if (enemy.isOffScreen()) {
            enemies.splice(index, 1);
        }
    });

    // Update PowerUps
    powerUps.forEach((powerUp, index) => {
        powerUp.update();

        // Check Collision with Rocket
        if (detectCollision(rocket, powerUp)) {
            sounds.powerupSound.play();
            handlePowerUp(powerUp.type);
            powerUps.splice(index, 1);
        }

        // Remove Off-Screen PowerUps
        if (powerUp.isOffScreen()) {
            powerUps.splice(index, 1);
        }
    });

    // Update Particles
    particles.forEach((particle, index) => {
        particle.update();
        if (particle.isFaded()) {
            particles.splice(index, 1);
        }
    });

    // Update Active Power-Ups
    updatePowerUps(deltaTime);
}

/**
 * Draws all game entities. (Handled within individual update methods)
 */
function drawEntities() {
    // All entities are drawn within their respective update methods.
}

/**
 * The main game loop that updates and renders the game continuously.
 * @param {number} timestamp - The current time.
 */
function gameLoop(timestamp) {
    if (isPaused) return;

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // Clear Canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and Draw Entities
    updateEntities(deltaTime);
    drawEntities();
    updateScoreAndLevel();

    // Spawn Obstacles based on Timer and Level
    spawnTimer += deltaTime;
    const obstacleSpawnInterval = Math.max(500, 2000 - level * 100); // Decrease interval with level
    if (spawnTimer > obstacleSpawnInterval) {
        spawnObstacle();
        spawnTimer = 0;
    }

    // Spawn Enemies based on Timer and Level
    enemySpawnTimer += deltaTime;
    const enemySpawnInterval = Math.max(1000, 5000 - level * 200); // Decrease interval with level
    if (enemySpawnTimer > enemySpawnInterval) {
        spawnEnemy();
        enemySpawnTimer = 0;
    }

    // Spawn PowerUps based on Timer
    powerUpSpawnTimer += deltaTime;
    if (powerUpSpawnTimer > 7000) { // Fixed spawn rate
        spawnPowerUp();
        powerUpSpawnTimer = 0;
    }

    // Handle Game Over State
    handleGameOver();

    // Continue the Game Loop if Not Over
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Initialize Last Time for Delta Time Calculation
let lastTime = 0;

/**
 * Starts the game after user interaction to comply with autoplay restrictions.
 */
function startGame() {
    // Hide Start Screen
    startScreen.style.display = 'none';

    // Play Background Music
    sounds.backgroundMusic.play().catch(error => {
        console.error('Background music playback failed:', error);
    });

    // Start the Game Loop once all images are loaded
    Promise.all(Object.values(images).map(img => {
        return new Promise((resolve) => {
            if (img.complete) {
                resolve();
            } else {
                img.onload = resolve;
                img.onerror = () => {
                    console.error('Failed to load image:', img.src);
                    resolve(); // Resolve anyway to prevent stalling
                };
            }
        });
    })).then(() => {
        console.log('All images loaded. Starting game.');
        requestAnimationFrame(gameLoop);
    });
}


// Handle Start Button Click
startButton.addEventListener('click', () => {
    startGame();
});

// Handle Window Resize for Responsive Design
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
});

// Game elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverScreen = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const finalScoreElement = document.getElementById('finalScore');

const orientationWarning = document.getElementById('orientation-warning');
// Game constants
const GRID_SIZE = 20;
const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 400;

// Game variables
let gameRunning = false;
let score = 0;
let highScore = parseInt(localStorage.getItem('starSnakeHighScore')) || 0;
let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let food = { x: 15, y: 15 };
let gameLoopTimeout;
let isPaused = false;
let changingDirection = false;
let pauseScreen = null;

// Speed settings
const INITIAL_SPEED = 200; // Slower start (higher is slower)
const MIN_SPEED = 60; // Fastest speed (lower is faster)
const SPEED_INCREMENT_SCORE = 10; // Increase speed every 10 points
let currentGameSpeed = INITIAL_SPEED;

// Audio for snake movement
const hissSound = new Audio('Snake Hiss.wav');
hissSound.loop = true;
hissSound.volume = 0.4; // Adjust volume as needed

// Initialize
highScoreElement.textContent = highScore;

// Create pause screen
function createPauseScreen() {
    if (pauseScreen) return;
    
    pauseScreen = document.createElement('div');
    pauseScreen.className = 'game-screen';
    pauseScreen.style.display = 'none';
    pauseScreen.innerHTML = `
        <h2>⏸️ Game Paused</h2>
        <p>Take a break and come back when ready!</p>
        <div class="button-row">
            <button class="menu-btn" onclick="resumeGame()">Resume</button>
            <button class="menu-btn" onclick="returnToMenu()">Main Menu</button>
        </div>
        <div class="key-hint">SPACE to resume • ESC for menu</div>
    `;
    document.querySelector('.game-container').appendChild(pauseScreen);
}

// Generate food
function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
            y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE))
        };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

// Draw star
function drawStar(x, y, size, color) {
    const centerX = x * GRID_SIZE + GRID_SIZE / 2;
    const centerY = y * GRID_SIZE + GRID_SIZE / 2;
    
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? size : size * 0.4;
        const angle = (i * Math.PI) / 5;
        const px = centerX + Math.cos(angle) * radius;
        const py = centerY + Math.sin(angle) * radius;
        
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

// Draw snake segment
function drawSnakeSegment(x, y, isHead = false) {
    const centerX = x * GRID_SIZE + GRID_SIZE / 2;
    const centerY = y * GRID_SIZE + GRID_SIZE / 2;
    const radius = GRID_SIZE / 2 - 2;
    
    ctx.save();
    
    if (isHead) {
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, '#90EE90');
        gradient.addColorStop(1, '#228B22');
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(centerX - 4, centerY - 4, 2, 0, 2 * Math.PI);
        ctx.arc(centerX + 4, centerY - 4, 2, 0, 2 * Math.PI);
        ctx.fill();
    } else {
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, '#98FB98');
        gradient.addColorStop(1, '#32CD32');
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    ctx.restore();
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw background stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * CANVAS_WIDTH;
        const y = Math.random() * CANVAS_HEIGHT;
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Draw food
    drawStar(food.x, food.y, 8, '#FFD700');
    
    // Draw snake
    snake.forEach((segment, index) => {
        drawSnakeSegment(segment.x, segment.y, index === 0);
    });
}

// Update game
function update() {
    if (!gameRunning || isPaused) return;
    
    // Allow the direction to be changed for the next tick
    changingDirection = false;

    // Calculate new head position
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // Check wall collision
    if (head.x < 0 || head.x >= CANVAS_WIDTH / GRID_SIZE || 
        head.y < 0 || head.y >= CANVAS_HEIGHT / GRID_SIZE) {
        gameOver();
        return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 1;
        scoreElement.textContent = score;
        generateFood();
        playEatSound();

        // Increase speed as score goes up
        if (score > 0 && score % SPEED_INCREMENT_SCORE === 0 && currentGameSpeed > MIN_SPEED) {
            currentGameSpeed = Math.max(MIN_SPEED, currentGameSpeed - 5); // Decrease interval by 5ms
        }
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    clearTimeout(gameLoopTimeout);
    stopHissSound();
    
    playGameOverSound();
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('starSnakeHighScore', highScore);
        highScoreElement.textContent = highScore;
    }
    
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'block';
}

// Start game
function startGame() {
    gameRunning = true;
    isPaused = false;
    score = 0;
    changingDirection = false;

    // Reset speed
    currentGameSpeed = INITIAL_SPEED;
    scoreElement.textContent = score;
    
    // Reset snake with initial direction
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 }; // Start moving right automatically
    
    // Generate food
    generateFood();
    
    // Hide all screens
    hideAllScreens();
    
    // Start game loop
    if (gameLoopTimeout) clearTimeout(gameLoopTimeout);
    gameLoop();
    
    playHissSound();
    
    // Initial draw
    draw();
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;

    update();
    draw();

    gameLoopTimeout = setTimeout(gameLoop, currentGameSpeed);
}

// Pause game
function pauseGame() {
    if (!gameRunning) return;
    
    isPaused = true;
    clearTimeout(gameLoopTimeout);
    stopHissSound();
    if (!pauseScreen) createPauseScreen();
    pauseScreen.style.display = 'block';
}

// Resume game
function resumeGame() {
    playHissSound();
    isPaused = false;
    if (pauseScreen) pauseScreen.style.display = 'none';
    gameLoop(); // Resume the loop
}

// Return to menu
function returnToMenu() {
    gameRunning = false;
    isPaused = false;
    clearTimeout(gameLoopTimeout);
    stopHissSound();
    hideAllScreens();
    startScreen.style.display = 'block';
}

// Restart game
function restartGame() {
    startGame();
}

// Hide all screens
function hideAllScreens() {
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    if (pauseScreen) pauseScreen.style.display = 'none';
}

// Hiss sound controls
function playHissSound() {
    // The play() method returns a Promise which can be useful for handling errors
    const playPromise = hissSound.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.warn("Hiss sound could not be played automatically:", error);
        });
    }
}

function stopHissSound() {
    hissSound.pause();
    hissSound.currentTime = 0; // Rewind to the start for the next play
}

// Sound effects
function playEatSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Audio not supported
    }
}

function playGameOverSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 200;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        // Audio not supported
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'Escape'].includes(e.code)) {
        e.preventDefault();
    }
    
    // Global controls
    if (e.code === 'Space') {
        if (!gameRunning) {
            startGame();
        } else if (isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
        return;
    }
    
    if (e.code === 'Escape') {
        if (gameRunning && !isPaused) {
            pauseGame();
        } else if (isPaused) {
            returnToMenu();
        }
        return;
    }
    
    // Movement controls
    if (!gameRunning || isPaused || changingDirection) return;
    
    let newDirectionSet = false;
    switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
            if (direction.y === 0) {
                direction = { x: 0, y: -1 };
                newDirectionSet = true;
            }
            break;
        case 'ArrowDown':
        case 'KeyS':
            if (direction.y === 0) {
                direction = { x: 0, y: 1 };
                newDirectionSet = true;
            }
            break;
        case 'ArrowLeft':
        case 'KeyA':
            if (direction.x === 0) {
                direction = { x: -1, y: 0 };
                newDirectionSet = true;
            }
            break;
        case 'ArrowRight':
        case 'KeyD':
            if (direction.x === 0) {
                direction = { x: 1, y: 0 };
                newDirectionSet = true;
            }
            break;
    }

    if (newDirectionSet) {
        changingDirection = true;
    }
});

// Touch controls
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    
    if (!gameRunning) {
        startGame();
        return;
    }
    
    if (isPaused || changingDirection) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 30;
    let newDirectionSet = false;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0 && direction.x === 0) {
                direction = { x: 1, y: 0 };
                newDirectionSet = true;
            } else if (deltaX < 0 && direction.x === 0) {
                direction = { x: -1, y: 0 };
                newDirectionSet = true;
            }
        }
    } else {
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0 && direction.y === 0) {
                direction = { x: 0, y: 1 };
                newDirectionSet = true;
            } else if (deltaY < 0 && direction.y === 0) {
                direction = { x: 0, y: -1 };
                newDirectionSet = true;
            }
        }
    }

    if (newDirectionSet) {
        changingDirection = true;
    }
});

// --- Screen Orientation Handling ---

function checkOrientation() {
    // This check is for mobile/tablet devices in portrait mode.
    // We check if the orientation is portrait and if the screen width is typical for a mobile device.
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    const isMobile = window.innerWidth < 1024; // Target tablets and phones

    if (isPortrait && isMobile) {
        if (orientationWarning) orientationWarning.style.display = 'flex';
        // If the game is running, pause it automatically to prevent playing in the wrong orientation.
        if (gameRunning && !isPaused) {
            pauseGame();
        }
    } else {
        if (orientationWarning) orientationWarning.style.display = 'none';
    }
}

// Add event listeners to check orientation on resize or orientation change
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);

// Initial check when the page loads
document.addEventListener('DOMContentLoaded', checkOrientation);

// Initial draw
draw();

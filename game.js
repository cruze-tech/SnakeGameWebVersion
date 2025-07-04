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
let animationFrameId;
let lastTime = 0;
let elapsedTime = 0;
let isPaused = false;
let changingDirection = false;
let pauseScreen = null;

// Bonus Star variables
let bonusStar = { x: -1, y: -1, active: false };
let bonusStarInterval;
let bonusStarTimeout;
let pulseSize = 0;
let pulseDirection = 1;


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

// Generate a bonus star
function spawnBonusStar() {
    // Don't spawn if game isn't running, is paused, or a bonus star is already active
    if (!gameRunning || isPaused || bonusStar.active) return;

    // Try to find a position that is not on the snake or on the normal food
    do {
        bonusStar = {
            x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
            y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)),
            active: true
        };
    } while (
        snake.some(segment => segment.x === bonusStar.x && segment.y === bonusStar.y) ||
        (food.x === bonusStar.x && food.y === bonusStar.y)
    );

    // Set a timeout to make the star disappear after 10 seconds
    if (bonusStarTimeout) clearTimeout(bonusStarTimeout);
    bonusStarTimeout = setTimeout(() => {
        bonusStar.active = false;
    }, 10000);
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

    // Pulsing logic for bonus star
    const baseSize = 10; // 25% bigger than normal star's 8
    const pulseRange = 2; // How much it grows/shrinks
    pulseSize += 0.1 * pulseDirection;
    if (pulseSize > pulseRange || pulseSize < -pulseRange) {
        pulseDirection *= -1; // Reverse direction
    }

    // Draw bonus star if active
    if (bonusStar.active) {
        drawStar(bonusStar.x, bonusStar.y, baseSize + pulseSize, '#FF6347'); // Tomato color
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        drawSnakeSegment(segment.x, segment.y, index === 0);
    });
}

// Update game state
function update() {
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
    
    // Check for food collision by storing results in boolean flags for clarity
    const ateBonusStar = bonusStar.active && head.x === bonusStar.x && head.y === bonusStar.y;
    const ateRegularFood = head.x === food.x && head.y === food.y;

    if (ateBonusStar) {
        score += 10;
        scoreElement.textContent = score;
        bonusStar.active = false;
        clearTimeout(bonusStarTimeout); // Star was eaten, so clear the timeout
        playEatSound();
        // Snake grows, so we don't pop the tail.
    } else if (ateRegularFood) {
        score += 1;
        scoreElement.textContent = score;
        generateFood();
        playEatSound();

        // Increase speed as score goes up
        if (score > 0 && score % SPEED_INCREMENT_SCORE === 0 && currentGameSpeed > MIN_SPEED) {
            currentGameSpeed = Math.max(MIN_SPEED, currentGameSpeed - 5);
        }
        // Snake grows, so we don't pop the tail.
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    clearInterval(bonusStarInterval);
    clearTimeout(bonusStarTimeout);
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

    // Reset bonus star
    bonusStar.active = false;
    if (bonusStarInterval) clearInterval(bonusStarInterval);
    if (bonusStarTimeout) clearTimeout(bonusStarTimeout);
    bonusStarInterval = setInterval(spawnBonusStar, 15000); // Spawn every 15 seconds

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
    
    // Reset timer variables for game loop
    lastTime = performance.now();
    elapsedTime = 0;
    
    // Start game loop
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    gameLoop();
    
    playHissSound();
}

// Main game loop using requestAnimationFrame for smoothness
function gameLoop(currentTime = 0) {
    if (!gameRunning) return;

    // Request the next frame
    animationFrameId = requestAnimationFrame(gameLoop);

    // If paused, we skip the logic but keep the loop running for animations
    if (isPaused) {
        lastTime = currentTime; // Update time to prevent jump on resume
        return;
    }

    // Calculate time delta to control game speed independently of framerate
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    elapsedTime += deltaTime;

    // If enough time has passed, update the game state
    if (elapsedTime >= currentGameSpeed) {
        update();
        // Subtract the interval to carry over any excess time, preventing drift
        elapsedTime -= currentGameSpeed;
    }
    
    // Draw on every frame for smooth animations like the pulsing star
    draw();
}

// Pause game
function pauseGame() {
    if (!gameRunning || isPaused) return;
    
    isPaused = true;
    stopHissSound();
    if (!pauseScreen) createPauseScreen();
    pauseScreen.style.display = 'block';
}

// Resume game
function resumeGame() {
    if (!gameRunning || !isPaused) return;

    playHissSound();
    isPaused = false;
    if (pauseScreen) pauseScreen.style.display = 'none';
    // Reset lastTime to avoid a large deltaTime jump after unpausing
    lastTime = performance.now();
}

// Return to menu
function returnToMenu() {
    gameRunning = false;
    isPaused = false;
    cancelAnimationFrame(animationFrameId);
    clearInterval(bonusStarInterval);
    clearTimeout(bonusStarTimeout);
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
    const playPromise = hissSound.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.warn("Hiss sound could not be played automatically:", error);
        });
    }
}

function stopHissSound() {
    hissSound.pause();
    hissSound.currentTime = 0;
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
    const isPortrait = window.matchMedia("(orientation: portrait)").matches;
    const isMobile = window.innerWidth < 1024;

    if (isPortrait && isMobile) {
        if (orientationWarning) orientationWarning.style.display = 'flex';
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

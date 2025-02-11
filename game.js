const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Scale obstacle and player to double the size.
// The obstacle is now 40px wide and the player (half its width) is 20×20.
// Gravity and jump force have been doubled to preserve the jump arc.
const player = {
    x: 50,
    y: canvas.height - 20,  // updated: player height is now 20px
    width: 20,
    height: 20,
    jumping: false,
    jumpForce: 0,
    gravity: 1.6  // doubled gravity for balanced jump physics
};

let obstacles = [];
let score = 0;
let gameOver = false;
let lives = 3;            // Giving the user three lives
let invincible = false;   // Temporary invincibility after collision

// Global flag to check if space is held down
let spacePressed = false;

// Helper function to draw an 8-bit (pixelated) circle.
// It draws a circle by iterating over each pixel in the bounding box.
function draw8BitCircle(x, y, diameter, color) {
    const center = diameter / 2;
    const radius = center;
    ctx.fillStyle = color;
    // Turn off image smoothing to boost the pixelated look.
    ctx.imageSmoothingEnabled = false;

    for (let i = 0; i < diameter; i++) {
        for (let j = 0; j < diameter; j++) {
            // Determine the position relative to the circle center.
            const dx = i - center + 0.5;
            const dy = j - center + 0.5;
            if (dx * dx + dy * dy <= radius * radius) {
                ctx.fillRect(x + i, y + j, 1, 1);
            }
        }
    }
}

// Draw the player as an 8-bit circular shape.
function drawPlayer() {
    draw8BitCircle(player.x, player.y, player.width, 'orange');
}

// Create an obstacle scaled to double size.
function createObstacle() {
    return {
        x: canvas.width,
        y: canvas.height - 60,            // adjusted: obstacle sits 60px above canvas bottom
        width: 40,                        // doubled from 20px
        height: Math.random() * 100 + 60    // doubled range (was Math.random()*50 + 30)
    };
}

function drawObstacle(obstacle) {
    ctx.fillStyle = 'purple';
    ctx.fillRect(obstacle.x, obstacle.y - obstacle.height, obstacle.width, obstacle.height);
}

// Adjusted jump: the jump force is now -30 to match the new scale.
function jump() {
    if (!player.jumping) {
        player.jumpForce = -30;
        player.jumping = true;
    }
}

function checkCollision(obstacle) {
    return player.x < obstacle.x + obstacle.width &&
           player.x + player.width > obstacle.x &&
           player.y < obstacle.y &&
           player.y + player.height > obstacle.y - obstacle.height;
}

// Called when the player collides with an obstacle
function loseLife() {
    lives--;
    if (lives <= 0) {
        gameOver = true;
    } else {
        invincible = true;
        // Reset the player back to the ground
        player.y = canvas.height - player.height;
        player.jumping = false;
        player.jumpForce = 0;
        // Make the player temporarily invincible (1 second) to prevent multiple rapid hits
        setTimeout(() => {
            invincible = false;
        }, 1000);
    }
}

function updateGame() {
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = '48px "Press Start 2P", Arial';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px "Press Start 2P", Arial';
        ctx.fillText('Press Space or Tap to Restart', canvas.width / 2, canvas.height / 2 + 40);
        return;
    }

    // Clear canvas using a black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update player position and physics
    player.y += player.jumpForce;
    player.jumpForce += player.gravity;

    // Ground collision detection
    if (player.y > canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.jumping = false;
        player.jumpForce = 0;
    }

    // Add new obstacles occasionally
    if (Math.random() < 0.02) {
        obstacles.push(createObstacle());
    }

    // Update and filter obstacles
    obstacles = obstacles.filter(obstacle => {
        obstacle.x -= 5;
        if (checkCollision(obstacle)) {
            if (!invincible) {
                loseLife();
            }
            return false; // Remove the obstacle that hit the player
        }
        return obstacle.x > -obstacle.width;
    });

    // Update score and display it
    score++;
    scoreElement.textContent = `Score: ${Math.floor(score / 10)}`;

    // Draw the player and obstacles on screen
    drawPlayer();
    obstacles.forEach(drawObstacle);

    // Draw lives as red hearts on the top right corner
    ctx.font = '24px "Press Start 2P", Arial';
    ctx.fillStyle = 'red';
    for (let i = 0; i < lives; i++) {
        ctx.fillText('❤️', canvas.width - 40 - i * 30, 40);
    }

    // Continue the game loop
    requestAnimationFrame(updateGame);
}

// Function to reset game state after a game over.
function resetGame() {
    gameOver = false;
    score = 0;
    obstacles = [];
    lives = 3;          // Reset lives to three
    invincible = false;
    player.y = canvas.height - player.height;
    player.jumping = false;
    player.jumpForce = 0;
    // Restart the game loop
    requestAnimationFrame(updateGame);
}

// Keyboard event listener for desktop (Space bar to jump or restart)
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        if (gameOver) {
            resetGame();
        } else {
            jump();
        }
    }
});

// Mobile touch event listener for tapping on the canvas
canvas.addEventListener('touchstart', (event) => {
    // Prevent default behavior (e.g., scrolling)
    event.preventDefault();
    if (gameOver) {
        resetGame();
    } else {
        jump();
    }
});

// Start the game
updateGame(); 
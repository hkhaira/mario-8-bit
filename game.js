const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Scale obstacle and player to double the size for the player.
// The player remains 20x20, but obstacles are now reduced by 50% (i.e. original size).
const player = {
    x: 50,
    y: canvas.height - 20,  // player height is 20px
    width: 20,
    height: 20,
    jumping: false,
    jumpForce: 0,
    gravity: 1.6  // balanced jump physics
};

let obstacles = [];
let score = 0;
let gameOver = false;
let lives = 3;            // Giving the user three lives
let invincible = false;   // Temporary invincibility after collision

// Global flags and variables for long jump feature
let spacePressed = false;
let jumpHoldDuration = 0;
const maxJumpHoldTime = 15;  // Maximum frames the jump can be prolonged
const jumpHoldFactor = 0.5;  // Reduced gravity while holding jump

// New global variables for holding at the top.
let holdAtTopTimer = 0;
const maxHoldAtTop = 300;    // Frames to hold at the top before descending

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

// Create an obstacle with reduced size (50% smaller than before).
function createObstacle() {
    return {
        x: canvas.width,
        y: canvas.height - 30,            // adjusted so the obstacle sits on the ground
        width: 20,                        // reduced from 40px
        height: Math.random() * 50 + 30,    // reduced from (Math.random()*100 + 60)
        scored: false                     // flag to track if bonus points were already awarded
    };
}

function drawObstacle(obstacle) {
    ctx.fillStyle = 'purple';
    ctx.fillRect(obstacle.x, obstacle.y - obstacle.height, obstacle.width, obstacle.height);
}

// Initiate the jump.
function jump() {
    if (!player.jumping) {
        player.jumpForce = -26;
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

    // Update player position.
    player.y += player.jumpForce;

    // If player would go above the top, clamp to 0 and hold there.
    if (player.y < 0) {
        player.y = 0;
        if (holdAtTopTimer < maxHoldAtTop) {
            holdAtTopTimer++;
            // Freeze vertical velocity while holding.
            player.jumpForce = 0;
        } else {
            // After hold, let gravity take over to make the player descend.
            player.jumpForce += player.gravity;
        }
    } else {
        // Normal jump update when not at the top.
        if (player.jumping && spacePressed && jumpHoldDuration < maxJumpHoldTime) {
            player.jumpForce += player.gravity * jumpHoldFactor;
            jumpHoldDuration++;
        } else {
            player.jumpForce += player.gravity;
        }
        // Reset top-hold timer if not at the top.
        holdAtTopTimer = 0;
    }

    // Ground collision detection
    if (player.y > canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.jumping = false;
        player.jumpForce = 0;
        jumpHoldDuration = 0;
        holdAtTopTimer = 0;
    }

    // Add new obstacles occasionally
    if (Math.random() < 0.02) {
        obstacles.push(createObstacle());
    }

    // Update, award bonus for successful jumps, and filter obstacles
    obstacles = obstacles.filter(obstacle => {
        obstacle.x -= 5;

        // Award extra bonus points if an obstacle is successfully jumped over.
        // Adding 1000 raw points reflects an extra 100 displayed points.
        if (!obstacle.scored && obstacle.x + obstacle.width < player.x) {
            score += 1000;
            obstacle.scored = true;
        }

        if (checkCollision(obstacle)) {
            if (!invincible) {
                loseLife();
            }
            return false; // Remove the obstacle that hit the player.
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
    jumpHoldDuration = 0;
    holdAtTopTimer = 0;
    // Restart the game loop
    requestAnimationFrame(updateGame);
}

// Keyboard event listeners for desktop
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        spacePressed = true;
        if (gameOver) {
            resetGame();
        } else {
            if (!player.jumping) {
                jump();
            }
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (event.code === 'Space') {
        spacePressed = false;
        jumpHoldDuration = 0;
    }
});

// Mobile touch event listeners for long jump
document.addEventListener('touchstart', (event) => {
    event.preventDefault();
    spacePressed = true;
    if (gameOver) {
        resetGame();
    } else {
        if (!player.jumping) {
            jump();
        }
    }
});

document.addEventListener('touchend', (event) => {
    event.preventDefault();
    spacePressed = false;
    jumpHoldDuration = 0;
});

// Start the game
updateGame(); 
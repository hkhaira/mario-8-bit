const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const player = {
    x: 50,
    y: canvas.height - 50,
    width: 30,
    height: 30,
    jumping: false,
    jumpForce: 0,
    gravity: 0.8
};

let obstacles = [];
let score = 0;
let gameOver = false;

// Global flag to check if space is held down
let spacePressed = false;

function drawPlayer() {
    ctx.fillStyle = 'orange';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function createObstacle() {
    return {
        x: canvas.width,
        y: canvas.height - 30,
        width: 20,
        height: Math.random() * 50 + 30
    };
}

function drawObstacle(obstacle) {
    ctx.fillStyle = 'purple';
    ctx.fillRect(obstacle.x, obstacle.y - obstacle.height, obstacle.width, obstacle.height);
}

function jump() {
    if (!player.jumping) {
        player.jumpForce = -15;
        player.jumping = true;
    }
}

function checkCollision(obstacle) {
    return player.x < obstacle.x + obstacle.width &&
           player.x + player.width > obstacle.x &&
           player.y < obstacle.y &&
           player.y + player.height > obstacle.y - obstacle.height;
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
            gameOver = true;
        }
        return obstacle.x > -obstacle.width;
    });

    // Update score and display it
    score++;
    scoreElement.textContent = `Score: ${Math.floor(score / 10)}`;

    // Draw the player and obstacles on screen
    drawPlayer();
    obstacles.forEach(drawObstacle);

    // Continue the game loop
    requestAnimationFrame(updateGame);
}

// Function to reset game state after a game over.
function resetGame() {
    gameOver = false;
    score = 0;
    obstacles = [];
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
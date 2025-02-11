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
        ctx.fillText('Game Over!', canvas.width/2, canvas.height/2);
        ctx.font = '24px "Press Start 2P", Arial';
        ctx.fillText('Press Space to Restart', canvas.width/2, canvas.height/2 + 40);
        return;
    }

    // Clear canvas by filling with a black background
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update player position
    player.y += player.jumpForce;
    player.jumpForce += player.gravity;

    // Ground collision
    if (player.y > canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.jumping = false;
        player.jumpForce = 0;
    }

    // Update obstacles
    if (Math.random() < 0.02) {
        obstacles.push(createObstacle());
    }

    obstacles = obstacles.filter(obstacle => {
        obstacle.x -= 5;
        if (checkCollision(obstacle)) {
            gameOver = true;
        }
        return obstacle.x > -obstacle.width;
    });

    // Update score
    score++;
    scoreElement.textContent = `Score: ${Math.floor(score/10)}`;

    // Draw everything
    drawPlayer();
    obstacles.forEach(drawObstacle);

    // Continue game loop
    requestAnimationFrame(updateGame);
}

// Event listeners
window.addEventListener('keydown', (event) => {
    if ((event.code === 'Space' || event.key === ' ' || event.keyCode === 32) && !spacePressed) {
        spacePressed = true;
        event.preventDefault(); // Prevent page scrolling
        
        if (gameOver) {
            // Reset game
            gameOver = false;
            score = 0;
            obstacles = [];
            player.y = canvas.height - player.height;
            player.jumping = false;
            player.jumpForce = 0;
            // Start the game loop again
            requestAnimationFrame(updateGame);
        } else {
            jump();
        }
    }
});

window.addEventListener('keyup', (event) => {
    if (event.code === 'Space' || event.key === ' ' || event.keyCode === 32) {
        spacePressed = false;
    }
});

// Start the game
updateGame(); 
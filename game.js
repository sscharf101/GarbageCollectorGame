const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const keys = {
    left: false,
    right: false
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
        e.preventDefault();
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = true;
        e.preventDefault();
    }
    if (e.key === 'r' || e.key === 'R') {
        if (game.gameOver) {
            resetGame();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = false;
    }
});

class Player {
    constructor() {
        this.width = 80;
        this.height = 60;
        this.x = WIDTH / 2 - this.width / 2;
        this.y = HEIGHT - 100;
        this.speed = 7;
    }

    move(direction) {
        this.x += direction * this.speed;
        this.x = Math.max(0, Math.min(WIDTH - this.width, this.x));
    }

    draw() {
        ctx.fillStyle = '#6496ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = '#96c8ff';
        ctx.fillRect(this.x + 10, this.y + 10, this.width - 20, 20);
    }

    update() {
        if (keys.left) this.move(-1);
        if (keys.right) this.move(1);
    }
}

class FallingItem {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = Math.random() * (WIDTH - this.width);
        this.y = -this.height;
        this.speed = 3 + Math.random() * 2;
        this.isRecyclable = Math.random() < 0.6;
        this.color = this.isRecyclable ? '#00c800' : '#ff3232';
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        if (this.isRecyclable) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.width / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('♻', this.x + this.width / 2, this.y + this.height / 2);
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);

            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x + 10, this.y + 10);
            ctx.lineTo(this.x + this.width - 10, this.y + this.height - 10);
            ctx.stroke();
        }
    }

    isOffScreen() {
        return this.y > HEIGHT;
    }

    collidesWith(player) {
        return (
            this.x < player.x + player.width &&
            this.x + this.width > player.x &&
            this.y < player.y + player.height &&
            this.y + this.height > player.y
        );
    }
}

const game = {
    player: null,
    items: [],
    score: 0,
    missedRecyclables: 0,
    gameOver: false,
    spawnTimer: 0,
    spawnDelay: 60,
    frame: 0
};

function resetGame() {
    game.player = new Player();
    game.items = [];
    game.score = 0;
    game.missedRecyclables = 0;
    game.gameOver = false;
    game.spawnTimer = 0;
    game.spawnDelay = 60;
    game.frame = 0;
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, '#dcefff');
    gradient.addColorStop(1, '#e8f4ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.strokeStyle = '#c8dcf0';
    ctx.lineWidth = 1;
    for (let i = 0; i < HEIGHT; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(WIDTH, i);
        ctx.stroke();
    }
}

function drawUI() {
    ctx.fillStyle = '#000';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${game.score}`, 10, 40);

    ctx.fillStyle = '#ff3232';
    ctx.font = '24px Arial';
    ctx.fillText(`Missed: ${game.missedRecyclables}/10`, 10, 75);

    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('← → or A D to move', WIDTH - 10, 35);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = '#ff3232';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER!', WIDTH / 2, HEIGHT / 2 - 80);

    ctx.fillStyle = '#fff';
    ctx.font = '36px Arial';
    ctx.fillText(`Final Score: ${game.score}`, WIDTH / 2, HEIGHT / 2 - 20);

    ctx.fillStyle = '#ffcc00';
    ctx.font = '24px Arial';
    ctx.fillText('Press R to Restart', WIDTH / 2, HEIGHT / 2 + 40);
}

function update() {
    if (!game.gameOver) {
        game.player.update();

        game.spawnTimer++;
        if (game.spawnTimer >= game.spawnDelay) {
            game.items.push(new FallingItem());
            game.spawnTimer = 0;
            game.spawnDelay = Math.max(20, 60 - Math.floor(game.score / 5));
        }

        for (let i = game.items.length - 1; i >= 0; i--) {
            const item = game.items[i];
            item.update();

            if (item.collidesWith(game.player)) {
                if (item.isRecyclable) {
                    game.score += 10;
                } else {
                    game.score -= 5;
                }
                game.items.splice(i, 1);
            } else if (item.isOffScreen()) {
                if (item.isRecyclable) {
                    game.missedRecyclables++;
                }
                game.items.splice(i, 1);
            }
        }

        if (game.missedRecyclables >= 10) {
            game.gameOver = true;
        }
    }
}

function draw() {
    drawBackground();

    game.items.forEach(item => item.draw());
    game.player.draw();

    drawUI();

    if (game.gameOver) {
        drawGameOver();
    }
}

function gameLoop() {
    update();
    draw();
    game.frame++;
    requestAnimationFrame(gameLoop);
}

resetGame();
gameLoop();

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 50,
            width: 50,
            height: 50,
            speed: 5
        };
        
        this.bullets = [];
        this.asteroids = [];
        this.explosions = [];
        this.score = 0;
        this.keys = {};
        
        this.bindEvents();
        this.gameLoop();
        
        // Spawn asteroids periodically
        setInterval(() => this.spawnAsteroid(), 1000);
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => this.keys[e.code] = true);
        document.addEventListener('keyup', (e) => this.keys[e.code] = false);
        document.addEventListener('keypress', (e) => {
            if (e.code === 'Space') {
                this.shoot();
            }
        });
    }
    
    shoot() {
        this.bullets.push({
            x: this.player.x + this.player.width / 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: 7
        });
    }
    
    spawnAsteroid() {
        this.asteroids.push({
            x: Math.random() * (this.canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            speed: 2 + Math.random() * 2
        });
    }
    
    update() {
        // Update explosions
        this.explosions = this.explosions.filter(explosion => {
            explosion.frame++;
            return explosion.frame < explosion.maxFrames;
        });

        // Player movement
        if (this.keys['ArrowLeft']) this.player.x -= this.player.speed;
        if (this.keys['ArrowRight']) this.player.x += this.player.speed;
        
        // Keep player in bounds
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
        
        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > 0;
        });
        
        // Update asteroids
        this.asteroids = this.asteroids.filter(asteroid => {
            asteroid.y += asteroid.speed;
            
            let asteroidDestroyed = false;
            
            // Check collision with bullets
            this.bullets = this.bullets.filter(bullet => {
                if (this.checkCollision(bullet, asteroid)) {
                    this.score += 10;
                    document.getElementById('scoreValue').textContent = this.score;
                    // Create explosion
                    this.explosions.push({
                        x: asteroid.x,
                        y: asteroid.y,
                        size: asteroid.width * 1.5,
                        frame: 0,
                        maxFrames: 15
                    });
                    asteroidDestroyed = true;
                    return false;
                }
                return true;
            });
            
            // If asteroid was hit by bullet, don't check player collision
            if (asteroidDestroyed) {
                return false;
            }
            
            // Check collision with player
            if (this.checkCollision(this.player, asteroid)) {
                alert('Game Over! Score: ' + this.score);
                location.reload();
                return false;
            }
            
            return asteroid.y < this.canvas.height;
        });
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw player
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw bullets
        this.ctx.fillStyle = '#fff';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        // Draw asteroids
        this.ctx.fillStyle = '#ff0000';
        this.asteroids.forEach(asteroid => {
            this.ctx.fillRect(asteroid.x, asteroid.y, asteroid.width, asteroid.height);
        });

        // Draw explosions
        this.explosions.forEach(explosion => {
            const alpha = 1 - (explosion.frame / explosion.maxFrames);
            const size = explosion.size * (1 + explosion.frame / explosion.maxFrames);
            
            this.ctx.beginPath();
            this.ctx.arc(
                explosion.x + explosion.size/2, 
                explosion.y + explosion.size/2, 
                size/2, 
                0, 
                Math.PI * 2
            );
            this.ctx.fillStyle = `rgba(255, 165, 0, ${alpha})`;
            this.ctx.fill();
            
            // Add inner explosion circle
            this.ctx.beginPath();
            this.ctx.arc(
                explosion.x + explosion.size/2, 
                explosion.y + explosion.size/2, 
                size/4, 
                0, 
                Math.PI * 2
            );
            this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha})`;
            this.ctx.fill();
        });
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.onload = () => new Game();

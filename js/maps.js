import { GameState } from './bag.js';

export const TILE_SIZE = 32;

export class TileMap {
    constructor(width, height, tileset) {
        this.width = width;
        this.height = height;
        this.tileset = tileset; // For now a color map or placeholder
        this.layers = [
            this.createLayer(0), // Ground
            this.createLayer(0), // Obstacles
            this.createLayer(0)  // Reflection/Transparency
        ];
        this.collisions = Array(width * height).fill(0);
    }

    createLayer(defaultValue) {
        return Array(this.width * this.height).fill(defaultValue);
    }

    setTile(layerIndex, x, y, tileId) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.layers[layerIndex][y * this.width + x] = tileId;
        }
    }

    setCollision(x, y, value) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.collisions[y * this.width + x] = value;
        }
    }

    isSolid(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return true;
        return this.collisions[y * this.width + x] === 1;
    }

    render(ctx, camera) {
        for (let layer of this.layers) {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const tileId = layer[y * this.width + x];
                    if (tileId === 0) continue;

                    const tx = x * TILE_SIZE - camera.x;
                    const ty = y * TILE_SIZE - camera.y;

                    // Skip off-screen tiles (basic frustum culling)
                    if (tx < -TILE_SIZE || tx > ctx.canvas.width || ty < -TILE_SIZE || ty > ctx.canvas.height) continue;

                    this.drawProceduralTile(ctx, tileId, tx, ty, x, y);
                }
            }
        }
    }

    drawProceduralTile(ctx, id, x, y, gx, gy) {
        const baseColor = this.getTileColor(id);
        ctx.fillStyle = baseColor;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        ctx.save();
        ctx.translate(x, y);

        // Add details based on ID
        if (id === 1) { // Grass
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            for (let i = 0; i < 3; i++) {
                const rx = (Math.sin(gx * 10 + gy + i) * 0.5 + 0.5) * TILE_SIZE;
                const ry = (Math.cos(gy * 10 + gx + i) * 0.5 + 0.5) * TILE_SIZE;
                ctx.fillRect(rx, ry, 2, 2);
            }
        } else if (id === 2) { // Tall Grass
            ctx.fillStyle = '#1e8449';
            for (let i = 0; i < 4; i++) {
                const ox = (i * 8) + 2;
                ctx.fillRect(ox, 2, 4, TILE_SIZE - 4);
            }
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.fillRect(2, 2, TILE_SIZE - 4, 4);
        } else if (id === 3 || id === 4) { // Water / Deep Water
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            const wave = Math.sin(Date.now() * 0.002 + gx + gy) * 5;
            ctx.fillRect(5 + wave, 10, 20, 2);
            ctx.fillRect(10 - wave, 20, 15, 2);
        } else if (id === 6) { // Flowers
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(TILE_SIZE / 2, TILE_SIZE / 2, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            for (let i = 0; i < 4; i++) {
                ctx.save();
                ctx.translate(TILE_SIZE / 2, TILE_SIZE / 2);
                ctx.rotate(i * Math.PI / 2);
                ctx.fillRect(4, -2, 4, 4);
                ctx.restore();
            }
        } else if (id === 7) { // Path
            ctx.fillStyle = 'rgba(0,0,0,0.05)';
            ctx.fillRect(2, 2, 2, 2);
            ctx.fillRect(TILE_SIZE - 10, TILE_SIZE - 10, 4, 4);
        } else if (id === 9) { // Rock
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.strokeRect(4, 4, TILE_SIZE - 8, TILE_SIZE - 8);
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(8, 8, 4, 4);
        }

        ctx.restore();
    }

    getTileColor(id) {
        const colors = {
            1: '#2ecc71', // Grass
            2: '#27ae60', // Tall Grass
            3: '#3498db', // Water
            4: '#e67e22', // Deep Water (Dive)
            5: '#7f8c8d', // Rock/Wall
            6: '#f1c40f', // Flowers (Yellow)
            7: '#e67e22', // Path (Orange-ish)
            8: '#d35400', // Dirt/Boundary
            9: '#2c3e50'  // Dark Rock
        };
        return colors[id] || '#000';
    }
}

export class Player {
    constructor(x, y) {
        this.gridX = x;
        this.gridY = y;
        this.pixelX = x * TILE_SIZE;
        this.pixelY = y * TILE_SIZE;
        this.targetX = this.pixelX;
        this.targetY = this.pixelY;
        this.isMoving = false;
        this.speed = 4; // Pixels per frame
    }

    update() {
        if (this.isMoving) {
            if (this.pixelX < this.targetX) this.pixelX += this.speed;
            if (this.pixelX > this.targetX) this.pixelX -= this.speed;
            if (this.pixelY < this.targetY) this.pixelY += this.speed;
            if (this.pixelY > this.targetY) this.pixelY -= this.speed;

            if (this.pixelX === this.targetX && this.pixelY === this.targetY) {
                this.isMoving = false;
            }
        }
    }

    move(dx, dy, map) {
        if (this.isMoving) return;

        const nextX = this.gridX + dx;
        const nextY = this.gridY + dy;

        if (!map.isSolid(nextX, nextY)) {
            this.gridX = nextX;
            this.gridY = nextY;
            this.targetX = this.gridX * TILE_SIZE;
            this.targetY = this.gridY * TILE_SIZE;
            this.isMoving = true;
        }
    }

    render(ctx, camera) {
        const x = this.pixelX - camera.x;
        const y = this.pixelY - camera.y;

        const bounce = this.isMoving ? Math.abs(Math.sin(Date.now() * 0.01)) * 4 : 0;
        const drawY = y - bounce;

        // Head
        ctx.fillStyle = '#f5b7b1';
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2, drawY + 8, 9, 0, Math.PI * 2);
        ctx.fill();

        // Body/Shirt (with slight sway)
        const sway = this.isMoving ? Math.sin(Date.now() * 0.01) * 2 : 0;
        ctx.fillStyle = '#e74c3c';
        ctx.save();
        ctx.translate(x + TILE_SIZE / 2, drawY + 15);
        ctx.rotate(sway * 0.05);
        ctx.fillRect(-10, 0, 20, 14);

        // Arms
        ctx.fillStyle = '#f5b7b1';
        ctx.fillRect(-14, 2, 4, 8);
        ctx.fillRect(10, 2, 4, 8);
        ctx.restore();

        // Pants
        ctx.fillStyle = '#2e86c1';
        ctx.fillRect(x + 6, drawY + 29, 20, 6);

        // Shoes
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 6, drawY + 34, 8, 3);
        ctx.fillRect(x + 18, drawY + 34, 8, 3);

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(x + TILE_SIZE / 2 - 4, drawY + 6, 2, 3);
        ctx.fillRect(x + TILE_SIZE / 2 + 2, drawY + 6, 2, 3);
    }
}

export class UrbanMap extends TileMap {
    constructor(width, height) {
        super(width, height);
        this.initUrbanMap();
    }

    initUrbanMap() {
        // Fill base grey/concrete
        for (let i = 0; i < this.height * this.width; i++) {
            this.layers[0][i] = 6; // Concrete
        }

        // Add Buildings (Houses/Industrial)
        for (let x = 2; x < 6; x++) {
            for (let y = 2; y < 6; y++) {
                this.setTile(1, x, y, 7); // Building tile
                this.setCollision(x, y, 1);
            }
        }
    }

    getTileColor(id) {
        const colors = {
            6: '#95a5a6', // Concrete
            7: '#34495e', // Building
            8: '#f1c40f'  // Gym / Special Building
        };
        const baseColor = super.getTileColor(id);
        return colors[id] || (baseColor === '#000' ? '#95a5a6' : baseColor);
    }
}

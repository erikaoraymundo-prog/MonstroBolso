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

                    ctx.fillStyle = this.getTileColor(tileId);
                    ctx.fillRect(
                        x * TILE_SIZE - camera.x,
                        y * TILE_SIZE - camera.y,
                        TILE_SIZE,
                        TILE_SIZE
                    );
                }
            }
        }
    }

    getTileColor(id) {
        const colors = {
            1: '#2ecc71', // Grass
            2: '#27ae60', // Tall Grass
            3: '#3498db', // Water
            4: '#e67e22', // Deep Water (Dive)
            5: '#7f8c8d'  // Rock/Wall
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

        // Head
        ctx.fillStyle = '#f5b7b1';
        ctx.beginPath();
        ctx.arc(x + TILE_SIZE / 2, y + 8, 8, 0, Math.PI * 2);
        ctx.fill();

        // Body/Shirt
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(x + 6, y + 15, 20, 12);

        // Pants
        ctx.fillStyle = '#2e86c1';
        ctx.fillRect(x + 6, y + 27, 20, 5);

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(x + TILE_SIZE / 2 - 4, y + 6, 2, 2);
        ctx.fillRect(x + TILE_SIZE / 2 + 2, y + 6, 2, 2);
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

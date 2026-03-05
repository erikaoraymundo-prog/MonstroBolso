import { GameState } from './bag.js';

export const TILE_SIZE = 32;

export class TileMap {
    constructor(width, height, tileset) {
        this.width = width;
        this.height = height;
        this.tileset = tileset;
        this.layers = [
            this.createLayer(0), // Ground
            this.createLayer(0), // Obstacles
            this.createLayer(0)  // Reflection/Transparency
        ];
        this.collisions = Array(width * height).fill(0);
        this.particles = [];
        this.initAtmosphere();
    }

    initAtmosphere() {
        // Pre-populate some leaves/bubbles
        for (let i = 0; i < 30; i++) {
            this.spawnParticle();
        }
    }

    spawnParticle() {
        const type = Math.random() < 0.5 ? 'leaf' : 'bubble';
        this.particles.push({
            x: Math.random() * this.width * TILE_SIZE,
            y: Math.random() * this.height * TILE_SIZE,
            type: type,
            vx: type === 'leaf' ? (Math.random() - 0.5) * 2 : 0,
            vy: type === 'leaf' ? 1 + Math.random() : -0.5 - Math.random(),
            life: 1 + Math.random() * 2,
            size: 2 + Math.random() * 4
        });
    }

    updateParticles() {
        this.particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.type === 'leaf') p.x += Math.sin(Date.now() * 0.005 + i) * 0.5;

            // Wrap or kill
            if (p.y > this.height * TILE_SIZE || p.y < 0) {
                p.y = p.vy > 0 ? 0 : this.height * TILE_SIZE;
                p.x = Math.random() * this.width * TILE_SIZE;
            }
        });
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
        this.updateParticles();

        ctx.save();
        // Background layer
        for (let layer of this.layers) {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const tileId = layer[y * this.width + x];
                    if (tileId === 0) continue;

                    const tx = x * TILE_SIZE - camera.x;
                    const ty = y * TILE_SIZE - camera.y;

                    if (tx < -TILE_SIZE || tx > ctx.canvas.width || ty < -TILE_SIZE || ty > ctx.canvas.height) continue;

                    this.drawProceduralTile(ctx, tileId, tx, ty, x, y);
                }
            }
        }

        // Render Atmosphere
        this.particles.forEach(p => {
            const px = p.x - camera.x;
            const py = p.y - camera.y;
            if (px < -10 || px > ctx.canvas.width + 10 || py < -10 || py > ctx.canvas.height + 10) return;

            ctx.fillStyle = p.type === 'leaf' ? 'rgba(46, 204, 113, 0.6)' : 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            if (p.type === 'leaf') {
                ctx.ellipse(px, py, p.size, p.size / 2, Math.PI / 4, 0, Math.PI * 2);
            } else {
                ctx.arc(px, py, p.size / 2, 0, Math.PI * 2);
            }
            ctx.fill();
        });

        // Vignette effect for focus
        const gradient = ctx.createRadialGradient(
            ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width / 4,
            ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width
        );
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.restore();
    }

    drawProceduralTile(ctx, id, x, y, gx, gy) {
        const baseColor = this.getTileColor(id);

        ctx.save();
        ctx.translate(x, y);

        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(0, 0, TILE_SIZE, 1);
        ctx.fillRect(0, 0, 1, TILE_SIZE);
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        ctx.fillRect(0, TILE_SIZE - 1, TILE_SIZE, 1);
        ctx.fillRect(TILE_SIZE - 1, 0, 1, TILE_SIZE);

        if (id === 1) { // Grass
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            for (let i = 0; i < 2; i++) {
                const rx = (Math.sin(gx * 7 + gy + i) * 0.5 + 0.5) * (TILE_SIZE - 4);
                const ry = (Math.cos(gy * 3 + gx + i) * 0.5 + 0.5) * (TILE_SIZE - 4);
                ctx.fillRect(rx, ry, 2, 4);
            }
        } else if (id === 2) { // Tall Grass
            ctx.fillStyle = '#1e8449';
            for (let i = 0; i < 3; i++) {
                const ox = 4 + i * 10;
                ctx.beginPath();
                ctx.moveTo(ox, TILE_SIZE);
                ctx.lineTo(ox - 3, TILE_SIZE - 20);
                ctx.lineTo(ox + 3, TILE_SIZE - 20);
                ctx.fill();
            }
        } else if (id === 3 || id === 4) { // Water
            const time = Date.now() * 0.001;
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            const waveX = Math.sin(time + gx) * 8;
            ctx.fillRect(TILE_SIZE / 2 + waveX - 8, TILE_SIZE / 2, 16, 2);
        } else if (id === 6) { // Flowers
            ctx.fillStyle = '#145a32';
            ctx.fillRect(TILE_SIZE / 2 - 1, TILE_SIZE / 2, 2, 10);
            ctx.fillStyle = '#ec7063';
            for (let i = 0; i < 5; i++) {
                ctx.save();
                ctx.translate(TILE_SIZE / 2, TILE_SIZE / 2);
                ctx.rotate(i * Math.PI * 2 / 5 + Date.now() * 0.001);
                ctx.beginPath(); ctx.ellipse(6, 0, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
            ctx.fillStyle = '#f4d03f';
            ctx.beginPath(); ctx.arc(TILE_SIZE / 2, TILE_SIZE / 2, 4, 0, Math.PI * 2); ctx.fill();
        } else if (id === 5 || id === 9) { // Wall/Rock
            ctx.fillStyle = id === 9 ? '#34495e' : '#95a5a6';
            ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
        } else if (id === 7 || id === 8) { // Path
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            for (let i = 0; i < 5; i++) {
                const px = (Math.sin(gx * gy + i) * 0.5 + 0.5) * TILE_SIZE;
                const py = (Math.cos(gx + gy + i) * 0.5 + 0.5) * TILE_SIZE;
                ctx.fillRect(px, py, 1, 1);
            }
        }

        ctx.restore();
    }

    getTileColor(id) {
        const colors = {
            1: '#2ecc71', 2: '#27ae60', 3: '#3498db', 4: '#2980b9',
            5: '#7f8c8d', 6: '#f1c40f', 7: '#edbb99', 8: '#a04000', 9: '#2c3e50'
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
        this.speed = 4;
        this.frame = 0;
        this.dustParticles = [];
    }

    update() {
        if (this.isMoving) {
            this.frame += 0.2;
            if (this.pixelX < this.targetX) this.pixelX += this.speed;
            if (this.pixelX > this.targetX) this.pixelX -= this.speed;
            if (this.pixelY < this.targetY) this.pixelY += this.speed;
            if (this.pixelY > this.targetY) this.pixelY -= this.speed;

            // Spawn dust
            if (Math.random() < 0.3) {
                this.dustParticles.push({
                    x: this.pixelX + TILE_SIZE / 2,
                    y: this.pixelY + TILE_SIZE - 5,
                    vx: (Math.random() - 0.5) * 1,
                    vy: (Math.random() - 0.5) * 1,
                    life: 1.0
                });
            }

            if (this.pixelX === this.targetX && this.pixelY === this.targetY) {
                this.isMoving = false;
                this.frame = 0;
            }
        }

        this.dustParticles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy; p.life -= 0.05;
            if (p.life <= 0) this.dustParticles.splice(i, 1);
        });
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

        // Draw Dust
        this.dustParticles.forEach(p => {
            ctx.fillStyle = `rgba(200,200,200,${p.life * 0.5})`;
            ctx.beginPath();
            ctx.arc(p.x - camera.x, p.y - camera.y, (1 - p.life) * 8, 0, Math.PI * 2);
            ctx.fill();
        });

        const bounce = Math.abs(Math.sin(this.frame)) * 6;
        const sway = Math.sin(this.frame) * 3;

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath(); ctx.ellipse(x + TILE_SIZE / 2, y + TILE_SIZE - 2, 12, 6, 0, 0, Math.PI * 2); ctx.fill();

        ctx.save();
        ctx.translate(x + TILE_SIZE / 2, y + TILE_SIZE - 2 - bounce);

        ctx.fillStyle = '#2e86c1'; ctx.fillRect(-8, -10, 6, 10); ctx.fillRect(2, -10, 6, 10);
        ctx.fillStyle = '#e74c3c'; ctx.rotate(sway * 0.02); ctx.fillRect(-10, -28, 20, 18);
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(-10, -20, 20, 2);
        ctx.fillStyle = '#f5b7b1'; ctx.fillRect(-14, -26, 4, 12); ctx.fillRect(10, -26, 4, 12);
        ctx.beginPath(); ctx.arc(0, -36, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.arc(0, -42, 10, Math.PI, Math.PI * 2); ctx.fill();
        ctx.fillRect(-12, -42, 24, 2);
        ctx.fillStyle = '#000'; ctx.fillRect(-4, -38, 2, 3); ctx.fillRect(2, -38, 2, 3);

        ctx.restore();
    }
}

export class UrbanMap extends TileMap {
    constructor(width, height) { super(width, height); this.initUrbanMap(); }
    initUrbanMap() { for (let i = 0; i < this.height * this.width; i++) this.layers[0][i] = 1; }
    getTileColor(id) {
        const colors = { 6: '#95a5a6', 7: '#34495e', 8: '#f1c40f' };
        const baseColor = super.getTileColor(id);
        return colors[id] || (baseColor === '#000' ? '#95a5a6' : baseColor);
    }
}

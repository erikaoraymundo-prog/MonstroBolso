import { GameState } from './bag.js';

export const TILE_SIZE = 32;

export class TileMap {
    constructor(width, height, tileset) {
        this.width = width;
        this.height = height;
        this.tileset = tileset;
        this.layers = [this.createLayer(0), this.createLayer(0), this.createLayer(0)];
        this.collisions = Array(width * height).fill(0);
        this.particles = [];
        this.tileCache = new Map();
        this.animFrame = 0;
        this.initAtmosphere();
    }

    initAtmosphere() { for (let i = 0; i < 30; i++) this.spawnParticle(); }

    spawnParticle() {
        const type = Math.random() < 0.5 ? 'leaf' : 'bubble';
        this.particles.push({
            x: Math.random() * this.width * TILE_SIZE, y: Math.random() * this.height * TILE_SIZE,
            type, vx: type === 'leaf' ? (Math.random() - 0.5) * 2 : 0,
            vy: type === 'leaf' ? 1 + Math.random() : -0.5 - Math.random(),
            size: 2 + Math.random() * 4
        });
    }

    updateParticles() {
        this.animFrame = (this.animFrame + 0.05) % 8; // Global animation timer for tiles
        this.particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy;
            if (p.type === 'leaf') p.x += Math.sin(Date.now() * 0.005 + i) * 0.5;
            if (p.y > this.height * TILE_SIZE || p.y < 0) {
                p.y = p.vy > 0 ? 0 : this.height * TILE_SIZE;
                p.x = Math.random() * this.width * TILE_SIZE;
            }
        });
    }

    createLayer(defaultValue) { return Array(this.width * this.height).fill(defaultValue); }
    setTile(layerIndex, x, y, tileId) { if (x >= 0 && x < this.width && y >= 0 && y < this.height) this.layers[layerIndex][y * this.width + x] = tileId; }
    setCollision(x, y, value) { if (x >= 0 && x < this.width && y >= 0 && y < this.height) this.collisions[y * this.width + x] = value; }
    isSolid(x, y) { return x < 0 || x >= this.width || y < 0 || y >= this.height || this.collisions[y * this.width + x] === 1; }

    render(ctx, camera) {
        this.updateParticles();
        ctx.save();
        for (let layer of this.layers) {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const tileId = layer[y * this.width + x];
                    if (tileId === 0) continue;
                    const tx = x * TILE_SIZE - camera.x;
                    const ty = y * TILE_SIZE - camera.y;
                    if (tx < -TILE_SIZE || tx > ctx.canvas.width || ty < -TILE_SIZE || ty > ctx.canvas.height) continue;

                    this.drawCachedTile(ctx, tileId, tx, ty, x, y);
                }
            }
        }

        // Atmosphere
        this.particles.forEach(p => {
            const px = p.x - camera.x; const py = p.y - camera.y;
            if (px < -10 || px > ctx.canvas.width + 10 || py < -10 || py > ctx.canvas.height + 10) return;
            ctx.fillStyle = p.type === 'leaf' ? 'rgba(46, 204, 113, 0.6)' : 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            if (p.type === 'leaf') ctx.ellipse(px, py, p.size, p.size / 2, Math.PI / 4, 0, Math.PI * 2);
            else ctx.arc(px, py, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
        });

        const vGrad = ctx.createRadialGradient(ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width / 4, ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width);
        vGrad.addColorStop(0, 'rgba(0,0,0,0)'); vGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = vGrad; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.restore();
    }

    drawCachedTile(ctx, id, x, y, gx, gy) {
        const isAnimated = (id === 2 || id === 3 || id === 4 || id === 6);
        const frame = isAnimated ? Math.floor(this.animFrame) : 0;
        const cacheKey = `${id}-${frame}-${isAnimated ? '' : (gx % 4) + '-' + (gy % 4)}`;

        if (!this.tileCache.has(cacheKey)) {
            const canvas = document.createElement('canvas');
            canvas.width = TILE_SIZE; canvas.height = TILE_SIZE;
            const tctx = canvas.getContext('2d');
            this.drawProceduralTile(tctx, id, gx, gy, frame);
            this.tileCache.set(cacheKey, canvas);
        }
        ctx.drawImage(this.tileCache.get(cacheKey), x, y);
    }

    drawProceduralTile(ctx, id, gx, gy, frame) {
        const baseColor = this.getTileColor(id);
        const time = frame * (Math.PI * 2 / 8);

        // Base
        const grd = ctx.createLinearGradient(0, 0, TILE_SIZE, TILE_SIZE);
        grd.addColorStop(0, this.adjustColor(baseColor, 15));
        grd.addColorStop(1, this.adjustColor(baseColor, -15));
        ctx.fillStyle = grd; ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

        // Noise
        for (let i = 0; i < 15; i++) {
            const nx = (gx * 123 + i * 45) % TILE_SIZE; const ny = (gy * 321 + i * 67) % TILE_SIZE;
            ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(nx, ny, 1, 1);
        }

        if (id === 1) { // Grass
            ctx.fillStyle = this.adjustColor(baseColor, -20);
            for (let i = 0; i < 4; i++) {
                const seed = (gx * 17 + gy * 11 + i) % 100;
                ctx.fillRect((seed / 100) * 28, ((seed * 7 % 100) / 100) * 28, 1, 2);
            }
        } else if (id === 2) { // Tall Grass
            ctx.fillStyle = '#145a32';
            for (let i = 0; i < 3; i++) {
                const ox = 4 + i * 10; const sway = Math.sin(time + i) * 4;
                ctx.beginPath(); ctx.moveTo(ox, TILE_SIZE);
                ctx.bezierCurveTo(ox + sway, TILE_SIZE - 10, ox - 5 + sway, TILE_SIZE - 20, ox + sway, TILE_SIZE - 28);
                ctx.lineTo(ox + 5 + sway, TILE_SIZE - 28); ctx.fill();
            }
        } else if (id === 3 || id === 4) { // Water
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            const waveX = Math.sin(time) * 5;
            ctx.beginPath(); ctx.ellipse(TILE_SIZE / 2 + waveX, TILE_SIZE / 2, 8, 2, 0, 0, Math.PI * 2); ctx.fill();
        } else if (id === 6) { // Flowers
            const anim = Math.sin(time) * 3;
            ctx.strokeStyle = '#0e6655'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(TILE_SIZE / 2, TILE_SIZE); ctx.lineTo(TILE_SIZE / 2, TILE_SIZE / 2 + anim); ctx.stroke();
            ctx.fillStyle = '#ec7063';
            for (let i = 0; i < 6; i++) {
                ctx.save(); ctx.translate(TILE_SIZE / 2, TILE_SIZE / 2 + anim); ctx.rotate(i * Math.PI / 3);
                ctx.beginPath(); ctx.ellipse(6, 0, 5, 3, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
            }
        } else if (id === 5 || id === 9) { // Rock/Wall
            ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.moveTo(4, 4); ctx.lineTo(12, 10); ctx.lineTo(6, 26); ctx.stroke();
        } else if (id === 7 || id === 8) { // Path
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            for (let i = 0; i < 4; i++) ctx.fillRect((gx * 31 + i * 13) % 32, (gy * 23 + i * 19) % 32, 2, 2);
        }
    }

    getTileColor(id) {
        return { 1: '#2ecc71', 2: '#27ae60', 3: '#3498db', 4: '#2980b9', 5: '#95a5a6', 6: '#2ecc71', 7: '#f5c0a0', 8: '#e67e22', 9: '#34495e' }[id] || '#000';
    }

    adjustColor(hex, amount) {
        let col = hex.replace('#', '');
        let r = Math.max(0, Math.min(255, parseInt(col.substring(0, 2), 16) + amount));
        let g = Math.max(0, Math.min(255, parseInt(col.substring(2, 4), 16) + amount));
        let b = Math.max(0, Math.min(255, parseInt(col.substring(4, 6), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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
            ctx.beginPath(); ctx.arc(p.x - camera.x, p.y - camera.y, (1 - p.life) * 8, 0, Math.PI * 2); ctx.fill();
        });

        const bounce = Math.abs(Math.sin(this.frame)) * 4;
        const sway = Math.sin(this.frame) * 4;

        // Dynamic Shadow with soft edge
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.ellipse(x + TILE_SIZE / 2, y + TILE_SIZE - 2, 16 - bounce, 8 - bounce / 2, 0, 0, Math.PI * 2); ctx.fill();

        ctx.save();
        ctx.translate(x + TILE_SIZE / 2, y + TILE_SIZE - 12 - bounce);

        // Legs (Pants and Shoes)
        ctx.fillStyle = '#21618c';
        ctx.roundRect(-8, 0, 7, 12, 2); ctx.fill(); ctx.roundRect(1, 0, 7, 12, 2); ctx.fill();
        ctx.fillStyle = '#1a1a1a'; // Shoes
        ctx.fillRect(-9, 10, 8, 4); ctx.fillRect(1, 10, 8, 4);

        // Torso (Detailed Shirt)
        ctx.rotate(sway * 0.02);
        ctx.fillStyle = '#c0392b'; ctx.roundRect(-12, -24, 24, 24, 5); ctx.fill();
        // Shirt Detail (Stripe & Collar)
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(-12, -18, 24, 2);

        // Backpack with Straps
        ctx.fillStyle = '#154360'; ctx.roundRect(-9, -22, 18, 16, 4); ctx.fill();
        ctx.strokeStyle = '#0e2f44'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-9, -22); ctx.lineTo(-12, -10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(9, -22); ctx.lineTo(12, -10); ctx.stroke();

        // Arms (Skin & Sleeves)
        ctx.fillStyle = '#f5b7b1';
        const armSway = Math.cos(this.frame) * 6;
        ctx.fillRect(-16, -20 + armSway, 5, 12); ctx.fillRect(11, -20 - armSway, 5, 12);

        // Head
        ctx.translate(0, -28);
        ctx.fillStyle = '#f5b7b1';
        ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();

        // Face Details (Sub-pixel eyes and mouth)
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath(); ctx.arc(-5, 2, 2.5, 0, Math.PI * 2); ctx.fill(); // Left eye
        ctx.beginPath(); ctx.arc(5, 2, 2.5, 0, Math.PI * 2); ctx.fill();  // Right eye
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(-5.5, 1.5, 0.8, 0, Math.PI * 2); ctx.fill(); // Shine
        ctx.beginPath(); ctx.arc(4.5, 1.5, 0.8, 0, Math.PI * 2); ctx.fill();  // Shine

        // Hair & Cap
        ctx.fillStyle = '#c0392b';
        ctx.beginPath(); ctx.arc(0, -4, 13, Math.PI, Math.PI * 2); ctx.fill();
        ctx.fillRect(-16, -5, 32, 5); // Brim
        // Cap Logo (Tiny white dot)
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -10, 3, 0, Math.PI * 2); ctx.fill();

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

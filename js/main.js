import { Engine } from './engine.js';
import { TileMap, UrbanMap, Player, TILE_SIZE } from './maps.js';
import { Monster, MONSTER_TEMPLATES } from './data.js';
import { BattleScene } from './battle.js';
import { UI } from './ui.js';
import { GameState } from './bag.js';

class OverworldScene {
    constructor(engine) {
        this.engine = engine;
        this.ui = new UI();
        this.naturalMap = new TileMap(80, 60);
        this.urbanMap = new UrbanMap(80, 60);
        this.map = this.naturalMap;
        this.player = new Player(40, 30); // Start in the middle of the world
        this.camera = { x: 0, y: 0 };
        this.keys = {};
        this.isDiving = false;

        this.isTransitioning = false;

        // Randomized starter logic (Persistent): 30% Bulbasaur, 30% Squirtle, 30% Charmander, 10% Pikachu
        const rand = Math.random();
        if (rand < 0.3) this.starterId = 1;         // Bulbasaur
        else if (rand < 0.6) this.starterId = 7;    // Squirtle
        else if (rand < 0.9) this.starterId = 4;    // Charmander
        else this.starterId = 25;                  // Pikachu

        this.hasShownStarter = false;

        window.addEventListener('keydown', (e) => {
            if (this.engine.currentScene !== this) return;
            this.keys[e.key.toLowerCase()] = true;
            if (e.code.toLowerCase().includes('arrow')) this.keys[e.code.toLowerCase()] = true;
        });
        window.addEventListener('keyup', (e) => {
            if (this.engine.currentScene !== this) return;
            this.keys[e.key.toLowerCase()] = false;
            if (e.code.toLowerCase().includes('arrow')) this.keys[e.code.toLowerCase()] = false;
        });

        this.initMap();
    }

    init() {
        this.isTransitioning = false;
        this.keys = {}; // Clear stuck keys

        if (!this.hasShownStarter) {
            const template = MONSTER_TEMPLATES[this.starterId];
            this.ui.showDialogue(`Você recebeu um ${template.name} de presente!`);
            this.hasShownStarter = true;
        }

        console.log("Mundo Expandido Inicializado!");
    }

    destroy() {
        this.keys = {};
    }

    initMap() {
        // 1. Fill with Lush Grass
        for (let i = 0; i < this.map.width * this.map.height; i++) {
            this.map.layers[0][i] = 1;
        }

        // 2. World Boundaries
        for (let x = 0; x < this.map.width; x++) { this.setBoundary(x, 0); this.setBoundary(x, this.map.height - 1); }
        for (let y = 0; y < this.map.height; y++) { this.setBoundary(0, y); this.setBoundary(this.map.width - 1, y); }

        // 3. Central Village (Vila Inicial)
        this.fillArea(35, 25, 45, 35, 7); // Town Square
        this.drawHouse(36, 26, 4, 4); // Player House
        this.drawHouse(41, 26, 4, 4); // Rival House
        this.drawHouse(38, 31, 5, 4); // Lab

        // 4. North Route (Route 1 - Forest)
        this.fillArea(39, 5, 41, 25, 7); // Path
        this.fillArea(10, 5, 35, 20, 2); // Tall Grass Forest Left
        this.fillArea(45, 5, 70, 20, 2); // Tall Grass Forest Right
        this.drawHouse(36, 10, 3, 3); // Rest Stop

        // 5. East City (Metropolis Area) - Transition to Path
        this.fillArea(45, 29, 79, 31, 7); // East Road
        this.fillArea(65, 25, 75, 40, 7); // City Square
        for (let i = 0; i < 5; i++) {
            this.drawHouse(66 + (i % 2) * 5, 26 + Math.floor(i / 2) * 5, 4, 4);
        }

        // 6. South Lake (Giant Water Body)
        this.fillArea(39, 35, 41, 59, 7); // South Path
        for (let x = 10; x < 70; x++) {
            for (let y = 45; y < 58; y++) {
                const dx = x - 40; const dy = y - 51;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 15) {
                    this.map.setTile(0, x, y, 3);
                    this.map.setCollision(x, y, 1);
                    if (dist < 8) {
                        this.map.setTile(0, x, y, 4); // Deep water for Dive
                        this.map.setCollision(x, y, 0); // Walkable on dive
                    }
                    if (dist < 3) {
                        this.map.setTile(0, x, y, 1); // Island center
                        this.map.setCollision(x, y, 0);
                        this.map.setTile(1, x, y, 6); // Flowers on island
                    }
                }
            }
        }

        // 7. West Mountains
        this.fillArea(0, 20, 15, 40, 9); // Mountain Range
        this.fillArea(5, 25, 10, 35, 8); // Dirt/Cave Entrance Area

        // 8. Scattering details
        for (let i = 0; i < 150; i++) {
            const rx = Math.floor(Math.random() * 78) + 1;
            const ry = Math.floor(Math.random() * 58) + 1;
            if (this.map.layers[0][ry * this.map.width + rx] === 1) {
                const type = Math.random();
                if (type < 0.1) this.map.setTile(0, rx, ry, 6); // Flowers
                else if (type < 0.15) this.map.setTile(1, rx, ry, 5); // Single small stone
            }
        }
    }

    setBoundary(x, y) {
        this.map.setTile(0, x, y, 9);
        this.map.setCollision(x, y, 1);
    }

    fillArea(x1, y1, x2, y2, tileId) {
        for (let x = x1; x < x2; x++) {
            for (let y = y1; y < y2; y++) {
                this.map.setTile(0, x, y, tileId);
                if (tileId === 9 || tileId === 3) this.map.setCollision(x, y, 1);
            }
        }
    }

    drawHouse(x, y, w, h) {
        for (let ox = 0; ox < w; ox++) {
            for (let oy = 0; oy < h; oy++) {
                const id = oy === 0 ? 9 : 5;
                this.map.setTile(1, x + ox, y + oy, id);
                this.map.setCollision(x + ox, y + oy, 1);
            }
        }
        // Door
        this.map.setTile(1, x + Math.floor(w / 2), y + h - 1, 8);
        this.map.setCollision(x + Math.floor(w / 2), y + h - 1, 0);
    }

    toggleDive() {
        this.isDiving = !this.isDiving;
        console.log("Switching Map:", this.isDiving ? "Underwater" : "Natural");

        if (this.isDiving) {
            this.map.getTileColor = (id) => {
                const colors = { 1: '#21618c', 3: '#2e86c1', 4: '#1b4f72', 9: '#154360' };
                return colors[id] || '#1a1a1a';
            };
        } else {
            this.map.getTileColor = (id) => {
                const colors = {
                    1: '#2ecc71', 2: '#27ae60', 3: '#3498db',
                    4: '#2980b9', 5: '#7f8c8d', 6: '#f1c40f',
                    7: '#edbb99', 8: '#a04000', 9: '#2c3e50'
                };
                return colors[id] || '#000';
            };
        }
    }

    update(dt) {
        if (!this.player.isMoving) {
            if (this.keys['arrowup'] || this.keys['w']) this.player.move(0, -1, this.map);
            else if (this.keys['arrowdown'] || this.keys['s']) this.player.move(0, 1, this.map);
            else if (this.keys['arrowleft'] || this.keys['a']) this.player.move(-1, 0, this.map);
            else if (this.keys['arrowright'] || this.keys['d']) this.player.move(1, 0, this.map);
        }

        if (this.keys['b'] && !this.isTransitioning) {
            this.isTransitioning = true;
            this.keys['b'] = false;
            this.startBattle();
            return;
        }

        const oldX = this.player.gridX;
        const oldY = this.player.gridY;
        this.player.update();

        // Random Encounter Logic
        if (!this.player.isMoving && (this.player.gridX !== oldX || this.player.gridY !== oldY)) {
            const currentTile = this.map.layers[0][this.player.gridY * this.map.width + this.player.gridX];
            if (currentTile === 2 && Math.random() < 0.12 && !this.isTransitioning) {
                this.isTransitioning = true;
                this.startBattle(true); // isTallGrass = true
                return;
            }
        }

        // Dive Mechanic
        const currentTile = this.map.layers[0][this.player.gridY * this.map.width + this.player.gridX];
        if (currentTile === 4 && this.keys['enter']) {
            this.toggleDive();
            this.keys['enter'] = false;
        }

        if (this.keys['i']) {
            this.ui.toggleBag();
            this.keys['i'] = false;
        }

        this.ui.updateHUD();

        this.camera.x = this.player.pixelX - this.engine.width / 2 + TILE_SIZE / 2;
        this.camera.y = this.player.pixelY - this.engine.height / 2 + TILE_SIZE / 2;
    }

    startBattle(isTallGrass = false) {
        const template = MONSTER_TEMPLATES[this.starterId];

        // Random nature/ability for the persistent starter in each battle (or could be persistent too)
        // Let's keep the species persistent as the "starter".
        const p1 = new Monster(this.starterId, template.name, template, "Adamant", "None");
        const e1 = Monster.createRandom(isTallGrass);

        console.log(`Battle started! You: ${p1.name} vs Enemy: ${e1.name}`);
        const battleScene = new BattleScene(this.engine, p1, e1);
        this.engine.scenes.set('battle', battleScene);
        this.engine.setScene('battle');
    }

    render(ctx) {
        this.map.render(ctx, this.camera);
        this.player.render(ctx, this.camera);

        // Premium HUD overlay hint
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.roundRect(10, 530, 250, 60, 10); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = "14px Outfit, Inter";
        ctx.fillText("WASD/Setas: Mover", 20, 550);
        ctx.fillText("B: Debug Luta | I: Mochila", 20, 570);
        ctx.fillText("Enter na água funda para Dive", 20, 590);
        ctx.restore();
    }
}

const engine = new Engine('gameCanvas');
const overworld = new OverworldScene(engine);
engine.scenes.set('overworld', overworld);
engine.setScene('overworld');

document.getElementById('start-button').addEventListener('click', () => {
    document.getElementById('start-screen').classList.add('hidden');
    engine.start();
});

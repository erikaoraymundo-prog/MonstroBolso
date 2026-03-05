import { Engine } from './engine.js';
import { TileMap, UrbanMap, Player, TILE_SIZE } from './maps.js';
import { Monster } from './data.js';
import { BattleScene } from './battle.js';
import { UI } from './ui.js';
import { GameState } from './bag.js';

class OverworldScene {
    constructor(engine) {
        this.engine = engine;
        this.ui = new UI();
        this.naturalMap = new TileMap(25, 20);
        this.urbanMap = new UrbanMap(25, 20);
        this.map = this.naturalMap;
        this.player = new Player(12, 10);
        this.camera = { x: 0, y: 0 };
        this.keys = {};
        this.isDiving = false;

        this.initMap();
    }

    init() {
        this.keys = {}; // Reset keys on init
        this.keydownHandler = (e) => this.keys[e.key] = true;
        this.keyupHandler = (e) => this.keys[e.key] = false;
        window.addEventListener('keydown', this.keydownHandler);
        window.addEventListener('keyup', this.keyupHandler);
        // Clear keys to prevent loops
        this.keys = {};
        console.log("Overworld Scene Initialized");
    }

    destroy() {
        window.removeEventListener('keydown', this.keydownHandler);
        window.removeEventListener('keyup', this.keyupHandler);
    }

    initMap() {
        // 1. Base Layer (Grass)
        for (let i = 0; i < this.map.width * this.map.height; i++) {
            this.map.layers[0][i] = 1;
        }

        // 2. Boundaries (Dark Rocks)
        for (let x = 0; x < this.map.width; x++) {
            this.setBoundary(x, 0);
            this.setBoundary(x, this.map.height - 1);
        }
        for (let y = 0; y < this.map.height; y++) {
            this.setBoundary(0, y);
            this.setBoundary(this.map.width - 1, y);
        }

        // 3. Central Path
        for (let x = 4; x < 21; x++) {
            this.map.setTile(0, x, 10, 7); // Horizontal path
            this.map.setTile(0, 12, x - 2, 7); // Vertical cross path
        }

        // 4. Lake Area (Bottom Right)
        for (let x = 15; x < 22; x++) {
            for (let y = 13; y < 18; y++) {
                const dist = Math.sqrt(Math.pow(x - 18.5, 2) + Math.pow(y - 15.5, 2));
                if (dist < 3) {
                    this.map.setTile(0, x, y, 3);
                    this.map.setCollision(x, y, 1);
                }
                if (dist < 1) {
                    this.map.setTile(0, x, y, 4); // Deep water in middle
                    this.map.setCollision(x, y, 0); // Walkable for Dive
                }
            }
        }

        // 5. Tall Grass Patches (Forest feeling)
        this.fillArea(2, 2, 6, 6, 2); // Top left forest
        this.fillArea(18, 2, 22, 6, 2); // Top right forest

        // 6. Flower clusters
        this.map.setTile(0, 10, 8, 6);
        this.map.setTile(0, 11, 8, 6);
        this.map.setTile(0, 10, 9, 6);
        this.map.setTile(0, 14, 12, 6);
        this.map.setTile(0, 15, 12, 6);
    }

    setBoundary(x, y) {
        this.map.setTile(0, x, y, 9);
        this.map.setCollision(x, y, 1);
    }

    fillArea(x1, y1, x2, y2, tileId) {
        for (let x = x1; x < x2; x++) {
            for (let y = y1; y < y2; y++) {
                this.map.setTile(0, x, y, tileId);
            }
        }
    }

    toggleDive() {
        this.isDiving = !this.isDiving;
        console.log("Switching Map:", this.isDiving ? "Underwater" : "Natural");

        // Change colors/map logic based on Dive state
        if (this.isDiving) {
            // Underwater tileset colors
            this.map.getTileColor = (id) => {
                const colors = { 1: '#2980b9', 4: '#34495e' }; // Water/Sand colors
                return colors[id] || '#1a1a1a';
            };
        } else {
            // Restore natural colors
            this.map.getTileColor = (id) => {
                const colors = {
                    1: '#2ecc71', 2: '#27ae60', 3: '#3498db',
                    4: '#e67e22', 5: '#7f8c8d', 6: '#f1c40f',
                    7: '#e67e22', 8: '#d35400', 9: '#2c3e50'
                };
                return colors[id] || '#000';
            };
        }
    }

    update(dt) {
        if (!this.player.isMoving) {
            if (this.keys['ArrowUp'] || this.keys['w']) this.player.move(0, -1, this.map);
            else if (this.keys['ArrowDown'] || this.keys['s']) this.player.move(0, 1, this.map);
            else if (this.keys['ArrowLeft'] || this.keys['a']) this.player.move(-1, 0, this.map);
            else if (this.keys['ArrowRight'] || this.keys['d']) this.player.move(1, 0, this.map);
            else if (this.keys['b']) {
                this.keys['b'] = false; // Prevent auto-retrigger
                this.startBattle();
                return;
            }
        }

        const oldX = this.player.gridX;
        const oldY = this.player.gridY;
        this.player.update();

        // Random Encounter Logic in Tall Grass (Tile 2)
        if (!this.player.isMoving && (this.player.gridX !== oldX || this.player.gridY !== oldY)) {
            const currentTile = this.map.layers[0][this.player.gridY * this.map.width + this.player.gridX];
            if (currentTile === 2 && Math.random() < 0.15) { // 15% chance
                console.log("Wild monster appeared!");
                this.startBattle();
                return;
            }
        }

        // Check Dive Mechanic
        const currentTile = this.map.layers[0][this.player.gridY * this.map.width + this.player.gridX];
        if (currentTile === 4 && this.keys['Enter']) {
            this.toggleDive();
            this.keys['Enter'] = false; // debounce
        }

        // Switch to Urban Map if Giovanni defeated (simulated with 'g' key)
        if (this.keys['g']) {
            GameState.GlobalSwitch_GiovanniDefeated = true;
            this.map = this.urbanMap;
            this.ui.showDialogue("Welcome to Sevii Islands!");
        }

        // Toggle Bag with 'i'
        if (this.keys['i']) {
            this.ui.toggleBag();
            this.keys['i'] = false;
        }

        // Elite Four Gate Check
        if (this.player.gridX === 20 && this.player.gridY === 2 && GameState.GymBadgeCount < 8) {
            this.ui.showDialogue("The Elite Four Gate is closed. You need 8 badges.");
            this.player.gridX = 19; // Push back
            this.player.targetX = 19 * TILE_SIZE;
            this.player.isMoving = false;
        }

        this.ui.updateHUD();

        // Camera follow
        this.camera.x = this.player.pixelX - this.engine.width / 2 + TILE_SIZE / 2;
        this.camera.y = this.player.pixelY - this.engine.height / 2 + TILE_SIZE / 2;
    }

    startBattle() {
        const p1 = new Monster(1, "Bulbasaur", { hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 }, "Adamant", "Intimidate");
        const e1 = new Monster(4, "Charmander", { hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 }, "Modest", "None");

        const battleScene = new BattleScene(this.engine, p1, e1);
        this.engine.scenes.set('battle', battleScene);
        this.engine.setScene('battle');
    }

    render(ctx) {
        this.map.render(ctx, this.camera);
        this.player.render(ctx, this.camera);

        ctx.fillStyle = '#fff';
        ctx.fillText("Press 'Enter' on orange tiles to Dive", 10, 580);
        ctx.fillText("Press 'b' to start a Battle", 10, 560);
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

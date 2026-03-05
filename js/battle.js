import { Abilities } from './data.js';

export class Battle {
    constructor(playerMonster, enemyMonster) {
        this.player = playerMonster;
        this.enemy = enemyMonster;
        this.turnOrder = [];
        this.isFinished = false;
        this.log = [];
        this.moves = {
            "Folha navalha": { power: 55, type: 'Grass', animation: 'RazorLeaf' },
            "Pó venenoso": { power: 0, type: 'Poison', animation: 'PoisonPowder', effect: 'poison' },
            "Investida": { power: 40, type: 'Normal', animation: 'Tackle' }
        };
    }

    init() {
        this.determineTurnOrder();
        if (Abilities[this.player.ability]?.onBattleStart) {
            Abilities[this.player.ability].onBattleStart(this.player, this.enemy);
        }
        if (Abilities[this.enemy.ability]?.onBattleStart) {
            Abilities[this.enemy.ability].onBattleStart(this.enemy, this.player);
        }
    }

    determineTurnOrder() {
        this.turnOrder = this.player.currentStats.speed >= this.enemy.currentStats.speed
            ? [this.player, this.enemy] : [this.enemy, this.player];
    }

    useMove(moveName, attacker, target) {
        const move = this.moves[moveName] || { power: 40 };
        const damage = move.power > 0
            ? Math.floor((attacker.currentStats.attack / target.currentStats.defense) * move.power * (Math.random() * 0.15 + 0.85))
            : 0;

        target.currentStats.hp = Math.max(0, target.currentStats.hp - damage);
        this.log.push(`${attacker.name} used ${moveName}!`);
        if (damage > 0) this.log.push(`Dealt ${damage} damage.`);

        if (target.currentStats.hp <= 0) {
            this.log.push(`${target.name} fainted!`);
            this.isFinished = true;
        }
        return move;
    }
}

export class BattleScene {
    constructor(engine, playerMonster, enemyMonster) {
        this.engine = engine;
        this.battle = new Battle(playerMonster, enemyMonster);
        this.battle.init();

        this.state = "MAIN_MENU"; // MAIN_MENU, MOVE_MENU, ANIMATING, MESSAGE
        this.menuOptions = ["Lutar", "Mochila", "Fugir"];
        this.moveOptions = Object.keys(this.battle.moves);
        this.currentSelection = 0;

        this.animation = null;
        this.animationTimer = 0;
        this.particles = [];

        this.setupInput();
    }

    setupInput() {
        this.clickListener = (e) => {
            const rect = this.engine.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.handleInput(x, y);
        };
        this.engine.canvas.addEventListener('mousedown', this.clickListener);
    }

    destroy() {
        this.engine.canvas.removeEventListener('mousedown', this.clickListener);
    }

    handleInput(x, y) {
        if (this.state === "ANIMATING" || this.state === "MESSAGE") return;

        // Coordinates for buttons (based on UI box at 50, 450, 700, 120)
        if (this.state === "MAIN_MENU") {
            if (this.isInside(x, y, 50, 450, 233, 120)) this.state = "MOVE_MENU";
            if (this.isInside(x, y, 283, 450, 233, 120)) this.engine.setScene('overworld'); // Should show bag UI
            if (this.isInside(x, y, 516, 450, 233, 120)) this.engine.setScene('overworld');
        } else if (this.state === "MOVE_MENU") {
            // Simplified: top-left, top-right, bottom-left
            if (this.isInside(x, y, 80, 470, 300, 40)) this.startPlayerTurn("Folha navalha");
            if (this.isInside(x, y, 400, 470, 300, 40)) this.startPlayerTurn("Pó venenoso");
            if (this.isInside(x, y, 80, 520, 300, 40)) this.startPlayerTurn("Investida");
            if (this.isInside(x, y, 400, 520, 300, 40)) this.state = "MAIN_MENU"; // Back button
        }
    }

    isInside(x, y, rx, ry, rw, rh) {
        return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
    }

    startPlayerTurn(moveName) {
        const move = this.battle.useMove(moveName, this.battle.player, this.battle.enemy);
        this.playAnimation(move.animation, true);
    }

    playAnimation(name, isPlayerAttacking) {
        this.state = "ANIMATING";
        this.animation = name;
        this.animationTimer = 60; // 1 second roughly
        this.isPlayerAttacking = isPlayerAttacking;
        this.particles = [];

        if (name === 'RazorLeaf') {
            for (let i = 0; i < 10; i++) this.particles.push({ x: 150, y: 400, vx: 5 + Math.random() * 5, vy: -5 - Math.random() * 10 });
        }
    }

    update(dt) {
        if (this.state === "ANIMATING") {
            this.animationTimer--;
            if (this.animation === 'RazorLeaf') {
                this.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.5; });
            }
            if (this.animationTimer <= 0) {
                if (this.isPlayerAttacking && !this.battle.isFinished) {
                    // Enemy turn
                    setTimeout(() => {
                        this.battle.useMove("Investida", this.battle.enemy, this.battle.player);
                        this.playAnimation("Tackle", false);
                    }, 500);
                } else {
                    this.state = "MAIN_MENU";
                }
            }
        }
    }

    render(ctx) {
        this.drawBackground(ctx);
        this.drawMonster(ctx, this.battle.player, 150, 400, true);
        this.drawMonster(ctx, this.battle.enemy, 600, 150, false);

        // UI
        this.drawUIBox(ctx, 450, 350, 300, 80);
        ctx.fillStyle = '#fff';
        ctx.fillText(this.battle.player.name, 470, 380);
        this.drawHPBar(ctx, 470, 395, this.battle.player.currentStats.hp, this.battle.player.baseStats.hp);

        this.drawUIBox(ctx, 50, 50, 300, 80);
        ctx.fillStyle = '#fff';
        ctx.fillText(this.battle.enemy.name, 70, 80);
        this.drawHPBar(ctx, 70, 95, this.battle.enemy.currentStats.hp, this.battle.enemy.baseStats.hp);

        // Menu / Log Box
        this.drawUIBox(ctx, 50, 450, 700, 120);
        if (this.state === "MAIN_MENU") {
            this.drawMenu(ctx, ["Lutar", "Mochila", "Fugir"]);
        } else if (this.state === "MOVE_MENU") {
            this.drawMoveMenu(ctx, this.moveOptions);
        } else {
            this.drawLog(ctx);
        }

        if (this.state === "ANIMATING") this.drawAnimation(ctx);
    }

    drawMenu(ctx, options) {
        options.forEach((opt, i) => {
            const x = 50 + (i * 233);
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            ctx.fillRect(x + 5, 455, 223, 110);
            ctx.fillStyle = "#fff";
            ctx.font = "20px Inter";
            ctx.fillText(opt, x + 80, 515);
        });
    }

    drawMoveMenu(ctx, moves) {
        moves.forEach((move, i) => {
            const x = 80 + (i % 2 * 320);
            const y = 490 + (Math.floor(i / 2) * 50);
            ctx.fillText(move, x, y);
        });
        ctx.fillText("Voltar", 400, 540);
    }

    drawLog(ctx) {
        let y = 490;
        this.battle.log.slice(-3).forEach(msg => {
            ctx.fillText(msg, 80, y);
            y += 25;
        });
    }

    drawAnimation(ctx) {
        if (this.animation === 'RazorLeaf') {
            ctx.fillStyle = "#2ecc71";
            this.particles.forEach(p => {
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, 10, 5, Math.atan2(p.vy, p.vx), 0, Math.PI * 2);
                ctx.fill();
            });
        } else if (this.animation === 'PoisonPowder') {
            ctx.fillStyle = "rgba(155, 89, 182, 0.6)";
            for (let i = 0; i < 20; i++) {
                ctx.beginPath();
                ctx.arc(600 + Math.sin(Date.now() * 0.01 + i) * 50, 150 + Math.cos(Date.now() * 0.01 + i) * 50, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.animation === 'Tackle') {
            if (this.animationTimer > 40) {
                const offset = Math.sin(this.animationTimer * 0.5) * 20;
                this.isPlayerAttacking ? ctx.translate(offset, 0) : ctx.translate(-offset, 0);
            }
        }
    }

    // Reuse helper methods from previous implementation
    drawBackground(ctx) { /* same as before */
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 300);
        skyGrad.addColorStop(0, '#3498db'); skyGrad.addColorStop(1, '#87ceeb');
        ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, 800, 600);
        ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.ellipse(150, 420, 120, 40, 0, 0, Math.PI * 2);
        ctx.ellipse(600, 180, 100, 30, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#27ae60'; ctx.fillRect(0, 400, 800, 200);
    }

    drawMonster(ctx, monster, x, y, isBackView) {
        ctx.save(); ctx.translate(x, y);
        if (monster.name === 'Bulbasaur') {
            ctx.fillStyle = '#52be80'; ctx.beginPath(); ctx.ellipse(0, 0, 40, 30, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#27ae60'; ctx.beginPath(); ctx.arc(0, -25, 25, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = '#e67e22'; ctx.beginPath(); ctx.ellipse(0, 0, 30, 45, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#fff'; if (!isBackView) { ctx.fillRect(-10, -15, 6, 6); ctx.fillRect(10, -15, 6, 6); }
        ctx.restore();
    }

    drawUIBox(ctx, x, y, w, h) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill(); ctx.stroke();
    }

    drawHPBar(ctx, x, y, current, max) {
        ctx.fillStyle = '#333'; ctx.fillRect(x, y, 200, 10);
        const hpP = Math.max(0, current / max);
        ctx.fillStyle = hpP > 0.5 ? '#2ecc71' : (hpP > 0.2 ? '#f1c40f' : '#e74c3c');
        ctx.fillRect(x, y, 200 * hpP, 10);
    }
}

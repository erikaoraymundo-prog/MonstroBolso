import { Abilities } from './data.js';
import { Bag, GameState } from './bag.js';

export class Battle {
    constructor(playerMonster, enemyMonster) {
        this.player = playerMonster;
        this.enemy = enemyMonster;
        this.isFinished = false;
        this.winner = null;
        this.log = [];
        this.moves = {
            "Folha navalha": { power: 55, type: 'Grass', animation: 'RazorLeaf' },
            "Pó venenoso": { power: 0, type: 'Poison', animation: 'PoisonPowder', effect: 'poison' },
            "Investida": { power: 40, type: 'Normal', animation: 'Tackle' }
        };
    }

    init() {
        if (Abilities[this.player.ability]?.onBattleStart) {
            Abilities[this.player.ability].onBattleStart(this.player, this.enemy);
        }
        if (Abilities[this.enemy.ability]?.onBattleStart) {
            Abilities[this.enemy.ability].onBattleStart(this.enemy, this.player);
        }
    }

    useMove(moveName, attacker, target) {
        const move = this.moves[moveName] || { power: 40 };
        const damage = move.power > 0
            ? Math.floor((attacker.currentStats.attack / target.currentStats.defense) * move.power * (Math.random() * 0.15 + 0.85))
            : 0;

        target.currentStats.hp = Math.max(0, target.currentStats.hp - damage);
        this.log.push(`${attacker.name} used ${moveName}!`);
        if (damage > 0) this.log.push(`Dealt ${damage} damage.`);

        this.checkFainted();
        return move;
    }

    usePotion(potion) {
        const oldHp = this.player.currentStats.hp;
        this.player.currentStats.hp = Math.min(this.player.baseStats.hp, this.player.currentStats.hp + potion.heal);
        const healed = this.player.currentStats.hp - oldHp;
        this.log.push(`Used ${potion.name}! Healed ${healed} HP.`);
        this.checkFainted();
    }

    attemptCapture(block) {
        const catchRate = (3 * this.enemy.baseStats.hp - 2 * this.enemy.currentStats.hp) * block.rate / (3 * this.enemy.baseStats.hp);
        const success = Math.random() < catchRate || catchRate > 0.8;

        if (success) {
            this.log.push(`Gotcha! ${this.enemy.name} was caught!`);
            GameState.addCapture(this.enemy.name);
            this.isFinished = true;
            this.winner = "player";
        } else {
            this.log.push(`Oh no! The monster broke free!`);
        }
        return success;
    }

    checkFainted() {
        if (this.enemy.currentStats.hp <= 0) {
            this.log.push(`${this.enemy.name} fainted!`);
            this.isFinished = true;
            this.winner = "player";
        } else if (this.player.currentStats.hp <= 0) {
            this.log.push(`${this.player.name} fainted!`);
            this.isFinished = true;
            this.winner = "enemy";
        }
    }
}

export class BattleScene {
    constructor(engine, playerMonster, enemyMonster) {
        this.engine = engine;
        this.battle = new Battle(playerMonster, enemyMonster);
        this.battle.init();

        this.state = "MAIN_MENU";
        this.menuOptions = ["Lutar", "Mochila", "Fugir"];
        this.bagSections = [
            { id: "capture", name: "Itens de Captura" },
            { id: "potions", name: "Poções" },
            { id: "battle_items", name: "Itens de Batalha" }
        ];
        this.currentBagSection = null;
        this.moveOptions = Object.keys(this.battle.moves);

        this.animation = null;
        this.animationTimer = 0;
        this.particles = [];
        this.isPlayerAttacking = false;

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
        if (this.state === "ANIMATING") return;

        // EXIT BATTLE: If finished or in message state, any click returns to map
        if (this.battle.isFinished || this.state === "MESSAGE") {
            console.log("Exiting Battle Scene...");
            this.engine.setScene('overworld');
            return;
        }

        if (this.state === "MAIN_MENU") {
            if (this.isInside(x, y, 50, 450, 233, 120)) this.state = "MOVE_MENU";
            else if (this.isInside(x, y, 283, 450, 233, 120)) this.state = "BAG_SECTIONS";
            else if (this.isInside(x, y, 516, 450, 233, 120)) {
                this.battle.log.push("Fugiu da batalha!");
                this.battle.isFinished = true;
                this.state = "MESSAGE";
            }
        }
        else if (this.state === "MOVE_MENU") {
            if (this.isInside(x, y, 80, 470, 300, 40)) this.startPlayerTurn(this.moveOptions[0]);
            else if (this.isInside(x, y, 400, 470, 300, 40)) this.startPlayerTurn(this.moveOptions[1]);
            else if (this.isInside(x, y, 80, 520, 300, 40)) this.startPlayerTurn(this.moveOptions[2]);
            else if (this.isInside(x, y, 400, 520, 300, 40)) this.state = "MAIN_MENU";
        }
        else if (this.state === "BAG_SECTIONS") {
            if (this.isInside(x, y, 80, 470, 300, 40)) this.openBagSection("capture");
            else if (this.isInside(x, y, 400, 470, 300, 40)) this.openBagSection("potions");
            else if (this.isInside(x, y, 80, 520, 300, 40)) this.openBagSection("battle_items");
            else if (this.isInside(x, y, 400, 520, 300, 40)) this.state = "MAIN_MENU";
        }
        else if (this.state === "BAG_ITEMS") {
            const items = Bag[this.currentBagSection] || [];
            let found = false;
            items.forEach((item, i) => {
                const ix = 80 + (i % 2 * 320);
                const iy = 470 + (Math.floor(i / 2) * 50);
                if (!found && this.isInside(x, y, ix, iy, 300, 45)) {
                    this.useItem(item);
                    found = true;
                }
            });
            if (!found && this.isInside(x, y, 400, 520, 300, 50)) this.state = "BAG_SECTIONS";
        }
    }

    isInside(x, y, rx, ry, rw, rh) {
        return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh;
    }

    openBagSection(section) {
        this.currentBagSection = section;
        this.state = "BAG_ITEMS";
    }

    useItem(item) {
        if (item.qty <= 0) return;

        if (this.currentBagSection === "potions") {
            this.battle.usePotion(item);
            item.qty--;
            this.playAnimation("Heal", true);
        } else if (this.currentBagSection === "capture") {
            this.battle.attemptCapture(item);
            item.qty--;
            this.playAnimation("Capture", true);
        }
    }

    startPlayerTurn(moveName) {
        const move = this.battle.useMove(moveName, this.battle.player, this.battle.enemy);
        this.playAnimation(move.animation, true);
    }

    playAnimation(name, isPlayerAttacking) {
        this.state = "ANIMATING";
        this.animation = name;
        this.animationTimer = 60;
        this.isPlayerAttacking = isPlayerAttacking;
        this.particles = [];

        if (name === 'RazorLeaf') {
            for (let i = 0; i < 15; i++)
                this.particles.push({ x: 150, y: 400, vx: 4 + Math.random() * 8, vy: -6 - Math.random() * 6 });
        }
    }

    update(dt) {
        if (this.state === "ANIMATING") {
            this.animationTimer--;
            if (this.animation === 'RazorLeaf') {
                this.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.4; });
            }
            if (this.animationTimer <= 0) {
                if (this.isPlayerAttacking && !this.battle.isFinished) {
                    setTimeout(() => {
                        this.battle.useMove("Investida", this.battle.enemy, this.battle.player);
                        this.playAnimation("Tackle", false);
                    }, 500);
                } else if (this.battle.isFinished) {
                    this.state = "MESSAGE";
                } else {
                    this.state = "MAIN_MENU";
                }
            }
        }
    }

    render(ctx) {
        ctx.save();
        this.drawBackground(ctx);

        if (!this.battle.isFinished || this.battle.winner !== "enemy")
            this.drawMonster(ctx, this.battle.player, 150, 400, true);
        if (!this.battle.isFinished || this.battle.winner !== "player")
            this.drawMonster(ctx, this.battle.enemy, 600, 150, false);

        // HP Bars
        this.drawUIBox(ctx, 450, 350, 300, 80);
        ctx.fillStyle = '#fff'; ctx.font = "bold 16px Inter";
        ctx.fillText(this.battle.player.name, 470, 375);
        this.drawHPBar(ctx, 470, 390, this.battle.player.currentStats.hp, this.battle.player.baseStats.hp);

        this.drawUIBox(ctx, 50, 50, 300, 80);
        ctx.fillStyle = '#fff';
        ctx.fillText(this.battle.enemy.name, 70, 75);
        this.drawHPBar(ctx, 70, 90, this.battle.enemy.currentStats.hp, this.battle.enemy.baseStats.hp);

        // Bottom Menu
        this.drawUIBox(ctx, 50, 450, 700, 120);
        if (this.state === "MAIN_MENU") this.drawMenu(ctx, this.menuOptions);
        else if (this.state === "MOVE_MENU") this.drawMoveMenu(ctx, this.moveOptions);
        else if (this.state === "BAG_SECTIONS") this.drawMenu(ctx, this.bagSections.map(s => s.name));
        else if (this.state === "BAG_ITEMS") this.drawBagItems(ctx);
        else this.drawLog(ctx);

        if (this.state === "ANIMATING") this.drawAnimation(ctx);
        ctx.restore();
    }

    drawMenu(ctx, options) {
        options.forEach((opt, i) => {
            const x = 50 + (i * 233);
            ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(x + 5, 455, 223, 110);
            ctx.fillStyle = "#fff"; ctx.font = "20px Inter";
            ctx.fillText(opt, x + 60, 515);
        });
    }

    drawMoveMenu(ctx, moves) {
        moves.forEach((move, i) => {
            const x = 80 + (i % 2 * 320); const y = 500 + (Math.floor(i / 2) * 50);
            ctx.fillStyle = "#fff"; ctx.font = "18px Inter";
            ctx.fillText(move, x, y);
        });
        ctx.fillText("Voltar", 400, 550);
    }

    drawBagItems(ctx) {
        const items = Bag[this.currentBagSection] || [];
        items.forEach((item, i) => {
            const x = 80 + (i % 2 * 320); const y = 500 + (Math.floor(i / 2) * 50);
            ctx.fillStyle = "#fff"; ctx.font = "18px Inter";
            ctx.fillText(`${item.name} x${item.qty}`, x, y);
        });
        ctx.fillText("Voltar", 400, 550);
    }

    drawLog(ctx) {
        let y = 490;
        ctx.fillStyle = "#fff"; ctx.font = "18px Inter";
        this.battle.log.slice(-3).forEach(msg => { ctx.fillText(msg, 80, y); y += 25; });
        if (this.battle.isFinished) ctx.fillText("(Clique em qualquer lugar para voltar ao mapa)", 180, 555);
    }

    drawAnimation(ctx) {
        ctx.save();
        if (this.animation === 'RazorLeaf') {
            ctx.fillStyle = "#2ecc71";
            this.particles.forEach(p => {
                ctx.beginPath(); ctx.ellipse(p.x, p.y, 8, 4, Math.atan2(p.vy, p.vx), 0, Math.PI * 2); ctx.fill();
            });
        } else if (this.animation === 'PoisonPowder') {
            ctx.fillStyle = "rgba(155, 89, 182, 0.6)";
            for (let i = 0; i < 20; i++) {
                ctx.beginPath();
                ctx.arc(600 + Math.sin(Date.now() * 0.01 + i) * 50, 150 + Math.cos(Date.now() * 0.01 + i) * 50, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (this.animation === 'Tackle') {
            const offset = Math.sin(this.animationTimer * 0.5) * 15;
            if (this.isPlayerAttacking) ctx.translate(offset, 0); else ctx.translate(-offset, 0);
        } else if (this.animation === 'Heal') {
            ctx.fillStyle = "rgba(46, 204, 113, 0.4)";
            ctx.fillRect(100, 400 - (60 - this.animationTimer) * 2, 100, 10);
        } else if (this.animation === 'Capture') {
            const progress = (60 - this.animationTimer) / 60;
            const startX = 150, startY = 400;
            const targetX = 600, targetY = 150;
            const x = startX + (targetX - startX) * progress;
            const y = startY + (targetY - startY) * progress - Math.sin(progress * Math.PI) * 150;
            ctx.fillStyle = "#e74c3c"; ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    drawBackground(ctx) {
        const skyG = ctx.createLinearGradient(0, 0, 0, 300);
        skyG.addColorStop(0, '#3498db'); skyG.addColorStop(1, '#87ceeb');
        ctx.fillStyle = skyG; ctx.fillRect(0, 0, 800, 600);
        ctx.fillStyle = '#2ecc71'; ctx.beginPath(); ctx.ellipse(150, 420, 120, 40, 0, 0, Math.PI * 2);
        ctx.ellipse(600, 180, 100, 30, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#27ae60'; ctx.fillRect(0, 400, 800, 200);
    }

    drawMonster(ctx, monster, x, y, back) {
        ctx.save(); ctx.translate(x, y);
        if (monster.name === 'Bulbasaur') {
            ctx.fillStyle = '#52be80'; ctx.beginPath(); ctx.ellipse(0, 0, 40, 30, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#27ae60'; ctx.beginPath(); ctx.arc(0, -25, 25, 0, Math.PI * 2); ctx.fill();
        } else {
            ctx.fillStyle = '#e67e22'; ctx.beginPath(); ctx.ellipse(0, 0, 30, 45, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#fff'; if (!back) { ctx.fillRect(-10, -15, 6, 6); ctx.fillRect(10, -15, 6, 6); }
        ctx.restore();
    }

    drawUIBox(ctx, x, y, w, h) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill(); ctx.stroke();
    }

    drawHPBar(ctx, x, y, curr, max) {
        ctx.fillStyle = '#333'; ctx.fillRect(x, y, 200, 10);
        const p = Math.max(0, curr / max);
        ctx.fillStyle = p > 0.5 ? '#2ecc71' : (p > 0.2 ? '#f1c40f' : '#e74c3c');
        ctx.fillRect(x, y, 200 * p, 10);
    }
}

import { Bag } from './bag.js';
import { Abilities } from './data.js';

export class Battle {
    constructor(playerMonster, enemyMonster) {
        this.player = playerMonster;
        this.enemy = enemyMonster;
        this.turnOrder = [];
        this.isFinished = false;
        this.log = [];
    }

    init() {
        this.determineTurnOrder();
        // Activate onBattleStart abilities
        if (Abilities[this.player.ability]?.onBattleStart) {
            Abilities[this.player.ability].onBattleStart(this.player, this.enemy);
        }
        if (Abilities[this.enemy.ability]?.onBattleStart) {
            Abilities[this.enemy.ability].onBattleStart(this.enemy, this.player);
        }
    }

    determineTurnOrder() {
        // Speed check (mod by nature already in currentStats)
        if (this.player.currentStats.speed >= this.enemy.currentStats.speed) {
            this.turnOrder = [this.player, this.enemy];
        } else {
            this.turnOrder = [this.enemy, this.player];
        }
    }

    attack(attacker, target, power = 40) {
        const damage = Math.floor((attacker.currentStats.attack / target.currentStats.defense) * power * (Math.random() * 0.15 + 0.85));
        target.currentStats.hp = Math.max(0, target.currentStats.hp - damage);
        this.log.push(`${attacker.name} used Tackle! Dealt ${damage} damage.`);

        if (target.currentStats.hp <= 0) {
            this.log.push(`${target.name} fainted!`);
            this.isFinished = true;
        }
    }
}

export class BattleScene {
    constructor(engine, playerMonster, enemyMonster) {
        this.engine = engine;
        this.battle = new Battle(playerMonster, enemyMonster);
        this.battle.init();
    }

    update(dt) {
        // Simple click-to-turn for now
    }

    render(ctx) {
        this.drawBackground(ctx);

        // Draw Monsters
        this.drawMonster(ctx, this.battle.player, 150, 400, true);
        this.drawMonster(ctx, this.battle.enemy, 600, 150, false);

        // Player UI
        this.drawUIBox(ctx, 450, 350, 300, 80);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Inter';
        ctx.fillText(this.battle.player.name, 470, 380);
        this.drawHPBar(ctx, 470, 395, this.battle.player.currentStats.hp, this.battle.player.baseStats.hp);

        // Enemy UI
        this.drawUIBox(ctx, 50, 50, 300, 80);
        ctx.fillStyle = '#fff';
        ctx.fillText(this.battle.enemy.name, 70, 80);
        this.drawHPBar(ctx, 70, 95, this.battle.enemy.currentStats.hp, this.battle.enemy.baseStats.hp);

        // Log Box
        this.drawUIBox(ctx, 50, 450, 700, 120);
        ctx.fillStyle = '#fff';
        let y = 490;
        this.battle.log.slice(-3).forEach(msg => {
            ctx.fillText(msg, 80, y);
            y += 25;
        });
    }

    drawBackground(ctx) {
        // Sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 300);
        skyGrad.addColorStop(0, '#3498db');
        skyGrad.addColorStop(1, '#87ceeb');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.engine.width, this.engine.height);

        // Ground/Grass
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.ellipse(150, 420, 120, 40, 0, 0, Math.PI * 2);
        ctx.ellipse(600, 180, 100, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#27ae60';
        ctx.fillRect(0, 400, 800, 200);
    }

    drawMonster(ctx, monster, x, y, isBackView) {
        ctx.save();
        ctx.translate(x, y);

        if (monster.name === 'Bulbasaur') {
            // Body
            ctx.fillStyle = '#52be80';
            ctx.beginPath();
            ctx.ellipse(0, 0, 40, 30, 0, 0, Math.PI * 2);
            ctx.fill();
            // Bulb
            ctx.fillStyle = '#27ae60';
            ctx.beginPath();
            ctx.arc(0, -25, 25, 0, Math.PI * 2);
            ctx.fill();
            // Spots
            ctx.fillStyle = '#1e8449';
            ctx.fillRect(-15, -10, 8, 8);
            ctx.fillRect(10, 5, 6, 6);
        } else if (monster.name === 'Charmander') {
            // Body
            ctx.fillStyle = '#e67e22';
            ctx.beginPath();
            ctx.ellipse(0, 0, 30, 45, 0, 0, Math.PI * 2);
            ctx.fill();
            // Flame tail
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath();
            ctx.arc(30, 20, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(32, 18, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Eyes (generic)
        ctx.fillStyle = '#fff';
        if (isBackView) {
            // Back view doesn't see eyes clearly
        } else {
            ctx.fillRect(-10, -15, 6, 6);
            ctx.fillRect(10, -15, 6, 6);
        }

        ctx.restore();
    }

    drawUIBox(ctx, x, y, w, h) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 10);
        ctx.fill();
        ctx.stroke();
    }

    drawHPBar(ctx, x, y, current, max) {
        const width = 200;
        const height = 12;
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, width, height);

        const hpPercent = Math.max(0, current / max);
        if (hpPercent > 0.5) ctx.fillStyle = '#2ecc71';
        else if (hpPercent > 0.2) ctx.fillStyle = '#f1c40f';
        else ctx.fillStyle = '#e74c3c';

        ctx.fillRect(x, y, width * hpPercent, height);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x, y, width, height);
    }

    onKeyPress(key) {
        if (this.battle.isFinished) return;

        if (key === 'z') { // Attack
            const attacker = this.battle.player;
            const target = this.battle.enemy;
            this.battle.attack(attacker, target);

            // Simple enemy counter-attack
            if (!this.battle.isFinished) {
                setTimeout(() => {
                    this.battle.attack(this.battle.enemy, this.battle.player);
                }, 500);
            }
        }
    }
}

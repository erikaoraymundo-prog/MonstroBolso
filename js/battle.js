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
        // Render UI
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.engine.width, this.engine.height);

        // Player UI
        ctx.fillStyle = '#fff';
        ctx.fillText(this.battle.player.name, 50, 450);
        this.drawHPBar(ctx, 50, 460, this.battle.player.currentStats.hp, this.battle.player.baseStats.hp);

        // Enemy UI
        ctx.fillText(this.battle.enemy.name, 500, 100);
        this.drawHPBar(ctx, 500, 110, this.battle.enemy.currentStats.hp, this.battle.enemy.baseStats.hp);

        // Log
        ctx.fillStyle = '#fff';
        let y = 300;
        this.battle.log.slice(-3).forEach(msg => {
            ctx.fillText(msg, 50, y);
            y += 20;
        });
    }

    drawHPBar(ctx, x, y, current, max) {
        ctx.fillStyle = '#333';
        ctx.fillRect(x, y, 200, 10);
        ctx.fillStyle = current / max > 0.5 ? '#2ecc71' : '#e74c3c';
        ctx.fillRect(x, y, 200 * (current / max), 10);
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

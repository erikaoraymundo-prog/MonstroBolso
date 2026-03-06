import { Abilities, MONSTER_TEMPLATES } from './data.js';
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
        if (Abilities[this.player.ability]?.onBattleStart) Abilities[this.player.ability].onBattleStart(this.player, this.enemy);
        if (Abilities[this.enemy.ability]?.onBattleStart) Abilities[this.enemy.ability].onBattleStart(this.enemy, this.player);
    }

    useMove(moveName, attacker, target) {
        const move = this.moves[moveName] || { power: 40 };
        const damage = move.power > 0 ? 20 : 0;
        target.currentStats.hp = Math.max(0, target.currentStats.hp - damage);
        this.log.push(`${attacker.name} used ${moveName}!`);
        if (damage > 0) this.log.push(`Dealt ${damage} damage.`);
        this.checkFainted();
        return move;
    }

    usePotion(potion) {
        const oldHp = this.player.currentStats.hp;
        this.player.currentStats.hp = Math.min(this.player.baseStats.hp, this.player.currentStats.hp + potion.heal);
        this.log.push(`Used ${potion.name}! Healed ${this.player.currentStats.hp - oldHp} HP.`);
        this.checkFainted();
    }

    attemptCapture(block) {
        const catchRate = (3 * this.enemy.baseStats.hp - 2 * this.enemy.currentStats.hp) * block.rate / (3 * this.enemy.baseStats.hp);
        const success = Math.random() < catchRate || catchRate > 0.8;
        if (success) {
            this.log.push(`Gotcha! ${this.enemy.name} was caught!`);
            GameState.addCapture(this.enemy.name);
            this.isFinished = true; this.winner = "player";
        } else {
            this.log.push(`Oh no! The monster broke free!`);
        }
        return success;
    }

    checkFainted() {
        if (this.enemy.currentStats.hp <= 0) {
            this.log.push(`${this.enemy.name} fainted!`);
            this.isFinished = true; this.winner = "player";
        } else if (this.player.currentStats.hp <= 0) {
            this.log.push(`${this.player.name} fainted!`);
            this.isFinished = true; this.winner = "enemy";
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
        this.bagSections = [{ id: "capture", name: "Itens de Captura" }, { id: "potions", name: "Poções" }, { id: "battle_items", name: "Itens de Batalha" }];
        this.currentBagSection = null;
        this.moveOptions = Object.keys(this.battle.moves);
        this.animation = null; this.animationTimer = 0; this.particles = [];
        this.screenShake = 0;
        this.damageFlash = { player: 0, enemy: 0 };
        this.targetHP = { player: playerMonster.currentStats.hp, enemy: enemyMonster.currentStats.hp };
        this.displayHP = { player: playerMonster.currentStats.hp, enemy: enemyMonster.currentStats.hp };
        this.typewriterIndex = 0; this.displayedLog = "";
        this.setupInput();
    }

    setupInput() {
        this.clickListener = (e) => {
            if (this.engine.currentScene !== this) return;
            const rect = this.engine.canvas.getBoundingClientRect();
            this.handleInput(e.clientX - rect.left, e.clientY - rect.top);
        };
        this.engine.canvas.addEventListener('mousedown', this.clickListener);
    }

    destroy() { this.engine.canvas.removeEventListener('mousedown', this.clickListener); }

    handleInput(x, y) {
        if (this.state === "ANIMATING") return;
        if (this.battle.isFinished || this.state === "MESSAGE") { this.engine.setScene('overworld'); return; }
        if (this.state === "MAIN_MENU") {
            if (this.isInside(x, y, 50, 450, 233, 120)) this.state = "MOVE_MENU";
            else if (this.isInside(x, y, 283, 450, 233, 120)) this.state = "BAG_SECTIONS";
            else if (this.isInside(x, y, 516, 450, 233, 120)) { this.battle.log.push("Fugiu!"); this.battle.isFinished = true; this.state = "MESSAGE"; }
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
            items.forEach((item, i) => {
                const ix = 80 + (i % 2 * 320); const iy = 470 + (Math.floor(i / 2) * 50);
                if (this.isInside(x, y, ix, iy, 300, 45)) this.useItem(item);
            });
            if (this.isInside(x, y, 400, 520, 300, 50)) this.state = "BAG_SECTIONS";
        }
    }

    isInside(x, y, rx, ry, rw, rh) { return x >= rx && x <= rx + rw && y >= ry && y <= ry + rh; }
    openBagSection(section) { this.currentBagSection = section; this.state = "BAG_ITEMS"; }

    useItem(item) {
        if (item.qty <= 0) return;
        if (this.currentBagSection === "potions") {
            this.battle.usePotion(item); this.targetHP.player = this.battle.player.currentStats.hp; item.qty--; this.playAnimation("Heal", true);
        } else if (this.currentBagSection === "capture") {
            this.battle.attemptCapture(item); item.qty--; this.playAnimation("Capture", true);
        }
    }

    startPlayerTurn(moveName) {
        const move = this.battle.useMove(moveName, this.battle.player, this.battle.enemy);
        this.targetHP.enemy = this.battle.enemy.currentStats.hp;
        if (moveName === "Investida") this.screenShake = 15;
        this.damageFlash.enemy = 20; this.playAnimation(move.animation, true);
    }

    playAnimation(name, isPlayerAttacking) { this.state = "ANIMATING"; this.animation = name; this.animationTimer = 60; this.isPlayerAttacking = isPlayerAttacking; }

    update(dt) {
        // Smooth HP transitions
        if (this.displayHP.player > this.targetHP.player) this.displayHP.player = Math.max(this.targetHP.player, this.displayHP.player - 1);
        else if (this.displayHP.player < this.targetHP.player) this.displayHP.player = Math.min(this.targetHP.player, this.displayHP.player + 1);

        if (this.displayHP.enemy > this.targetHP.enemy) this.displayHP.enemy = Math.max(this.targetHP.enemy, this.displayHP.enemy - 1);
        else if (this.displayHP.enemy < this.targetHP.enemy) this.displayHP.enemy = Math.min(this.targetHP.enemy, this.displayHP.enemy + 1);

        if (this.screenShake > 0) this.screenShake -= 1;
        if (this.damageFlash.player > 0) this.damageFlash.player -= 1;
        if (this.damageFlash.enemy > 0) this.damageFlash.enemy -= 1;

        if (this.state === "ANIMATING") {
            this.animationTimer--;
            if (this.animationTimer <= 0) {
                if (this.isPlayerAttacking) {
                    if (this.battle.isFinished) {
                        this.state = "MESSAGE";
                    } else {
                        // After player attack finishes, prepare enemy attack
                        this.state = "ENEMY_TURN_PREP";
                        this.animationTimer = 60; // Wait 1 second before enemy hits
                    }
                } else {
                    // After enemy attack finishes, return to menu or finish
                    if (this.battle.isFinished) this.state = "MESSAGE";
                    else this.state = "MAIN_MENU";
                }
            }
        } else if (this.state === "ENEMY_TURN_PREP") {
            this.animationTimer--;
            if (this.animationTimer <= 0) {
                // EXPLICIT CHECK: Ensure battle isn't over before enemy strikes
                if (this.battle.isFinished) { this.state = "MESSAGE"; return; }

                // Enemy deals EXACTLY 20 damage once
                this.battle.useMove("Investida", this.battle.enemy, this.battle.player);
                this.targetHP.player = this.battle.player.currentStats.hp;
                this.screenShake = 10;
                this.damageFlash.player = 30; // Flash red longer for visibility
                this.playAnimation("Tackle", false); // Tackle resets state to ANIMATING
            }
        }
    }

    render(ctx) {
        ctx.save();
        if (this.screenShake > 0) ctx.translate((Math.random() - 0.5) * this.screenShake * 2, (Math.random() - 0.5) * this.screenShake * 2);
        this.drawBackground(ctx);
        const idleBounce = Math.sin(Date.now() * 0.003) * 5;
        if (!this.battle.isFinished || this.battle.winner !== "enemy") this.drawMonsterWithCache(ctx, this.battle.player, 180, 420 + idleBounce, true, this.damageFlash.player);
        if (!this.battle.isFinished || this.battle.winner !== "player") this.drawMonsterWithCache(ctx, this.battle.enemy, 620, 180 + idleBounce, false, this.damageFlash.enemy);
        this.drawUIBox(ctx, 450, 320, 320, 100); ctx.fillStyle = '#fff'; ctx.font = "bold 20px Outfit, Inter";
        ctx.fillText(this.battle.player.name, 475, 355);
        ctx.font = "14px Outfit, Inter"; ctx.textAlign = "right";
        ctx.fillText(`${Math.floor(this.displayHP.player)} / ${this.battle.player.baseStats.hp}`, 725, 355);
        ctx.textAlign = "left";
        this.drawHPBar(ctx, 475, 375, this.displayHP.player, this.battle.player.baseStats.hp);

        this.drawUIBox(ctx, 30, 40, 320, 100); ctx.font = "bold 20px Outfit, Inter"; ctx.fillText(this.battle.enemy.name, 55, 75);
        ctx.font = "14px Outfit, Inter"; ctx.textAlign = "right";
        ctx.fillText(`${Math.floor(this.displayHP.enemy)} / ${this.battle.enemy.baseStats.hp}`, 330, 75);
        ctx.textAlign = "left";
        this.drawHPBar(ctx, 55, 95, this.displayHP.enemy, this.battle.enemy.baseStats.hp);
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
            const x = 50 + (i * 233); ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.beginPath(); ctx.roundRect(x + 10, 460, 213, 100, 15); ctx.fill();
            ctx.fillStyle = "#fff"; ctx.font = "bold 22px Outfit, Inter"; ctx.textAlign = "center"; ctx.fillText(opt, x + 116, 520); ctx.textAlign = "left";
        });
    }

    drawMoveMenu(ctx, moves) {
        moves.forEach((move, i) => {
            const x = 100 + (i % 2 * 320); const y = 500 + (Math.floor(i / 2) * 50);
            ctx.fillStyle = "#fff"; ctx.font = "20px Outfit, Inter"; ctx.fillText(move, x, y);
        });
        ctx.fillText("Voltar", 450, 550);
    }

    drawBagItems(ctx) {
        const items = Bag[this.currentBagSection] || [];
        items.forEach((item, i) => {
            const x = 100 + (i % 2 * 320); const y = 500 + (Math.floor(i / 2) * 50);
            ctx.fillStyle = "#fff"; ctx.font = "20px Outfit, Inter"; ctx.fillText(`${item.name} x${item.qty}`, x, y);
        });
        ctx.fillText("Voltar", 450, 550);
    }

    drawLog(ctx) {
        let y = 495; ctx.fillStyle = "#fff"; ctx.font = "20px Outfit, Inter";
        const currentLog = this.battle.log[this.battle.log.length - 1] || "";
        if (this.displayedLog !== currentLog) { this.typewriterIndex += 0.5; this.displayedLog = currentLog.substring(0, Math.floor(this.typewriterIndex)); }
        else this.typewriterIndex = currentLog.length;
        this.battle.log.slice(-3, -1).forEach(msg => { ctx.fillText(msg, 100, y); y += 30; });
        ctx.fillText(this.displayedLog, 100, y);
        if (this.battle.isFinished && this.displayedLog === currentLog) ctx.fillText("(Clique em qualquer lugar para sair)", 250, 555);
    }

    drawAnimation(ctx) {
        if (this.animation === 'RazorLeaf') {
            ctx.fillStyle = "#58d68d";
            for (let i = 0; i < 10; i++) {
                const p = (60 - this.animationTimer) / 60;
                ctx.beginPath(); ctx.ellipse(180 + 440 * p + Math.sin(i) * 20, 420 - 240 * p + Math.cos(i) * 20, 10, 5, Math.PI / 4, 0, Math.PI * 2); ctx.fill();
            }
        } else if (this.animation === 'Tackle') {
            const offset = Math.sin(this.animationTimer * 0.8) * 30;
            if (this.isPlayerAttacking) ctx.translate(offset, -offset / 2); else ctx.translate(-offset, offset / 2);
        } else if (this.animation === 'Heal') {
            ctx.fillStyle = "rgba(46, 204, 113, 0.4)";
            ctx.fillRect(130, 420 - (Math.sin(Date.now() * 0.01) * 50 + 50), 100, 10);
        } else if (this.animation === 'Capture') {
            const progress = (60 - this.animationTimer) / 60;
            const x = 180 + (620 - 180) * progress;
            const y = 420 + (180 - 420) * progress - Math.sin(progress * Math.PI) * 200;
            ctx.fillStyle = "#e74c3c"; ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI); ctx.fill();
            ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.stroke();
        }
    }

    drawBackground(ctx) {
        const grd = ctx.createLinearGradient(0, 0, 0, 600);
        grd.addColorStop(0, "#2e86c1");
        grd.addColorStop(0.5, "#85c1e9");
        grd.addColorStop(1, "#1d8348");
        ctx.fillStyle = grd; ctx.fillRect(0, 0, 800, 600);

        // Distant hills
        ctx.fillStyle = "rgba(20, 90, 50, 0.3)";
        ctx.beginPath(); ctx.ellipse(200, 600, 400, 200, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(600, 600, 500, 250, 0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = "rgba(0,0,0,0.15)"; ctx.beginPath(); ctx.ellipse(180, 450, 140, 50, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(620, 200, 120, 40, 0, 0, Math.PI * 2); ctx.fill();
    }

    drawMonsterWithCache(ctx, monster, x, y, back, flash) {
        if (!this.monsterCache) this.monsterCache = new Map();
        const key = `${monster.name}-${back}`;

        if (!this.monsterCache.has(key)) {
            const canvas = document.createElement('canvas'); canvas.width = 300; canvas.height = 300;
            const mctx = canvas.getContext('2d'); mctx.translate(150, 150);
            this.drawMonsterProcedural(mctx, monster, back);
            this.monsterCache.set(key, canvas);
        }

        ctx.save(); ctx.translate(x, y);
        if (flash > 0) ctx.filter = `brightness(${100 + flash * 5}%) sepia(100%) saturate(1000%) hue-rotate(-50deg)`;
        const time = Date.now() * 0.003;
        const scale = 1 + Math.sin(time) * 0.03;
        ctx.scale(scale * (back ? 1.6 : 1.1), (1 / scale) * (back ? 1.6 : 1.1));
        ctx.drawImage(this.monsterCache.get(key), -150, -150);
        ctx.restore();
    }

    drawMonsterProcedural(ctx, monster, back) {
        const template = MONSTER_TEMPLATES[monster.id] || { color: "#ccc", shape: "round", features: [] };
        const shadowGrd = ctx.createRadialGradient(0, 30, 5, 0, 30, 50);
        shadowGrd.addColorStop(0, 'rgba(0,0,0,0.2)'); shadowGrd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shadowGrd; ctx.beginPath(); ctx.ellipse(0, 30, 50, 20, 0, 0, Math.PI * 2); ctx.fill();

        const bodyGrd = ctx.createRadialGradient(-15, -20, 5, 0, 0, 60);
        bodyGrd.addColorStop(0, this.adjustColor(template.color, 50));
        bodyGrd.addColorStop(0.6, template.color);
        bodyGrd.addColorStop(1, this.adjustColor(template.color, -30));
        ctx.fillStyle = bodyGrd; ctx.strokeStyle = this.adjustColor(template.color, -50); ctx.lineWidth = 2.5;

        if (template.shape === "tall") { ctx.beginPath(); ctx.roundRect(-38, -60, 76, 120, 35); ctx.fill(); ctx.stroke(); }
        else if (template.shape === "quad") { ctx.beginPath(); ctx.roundRect(-55, -38, 110, 76, 28); ctx.fill(); ctx.stroke(); }
        else if (template.shape === "long") { ctx.beginPath(); ctx.roundRect(-28, -65, 56, 130, 25); ctx.fill(); ctx.stroke(); }
        else if (template.shape === "wide") { ctx.beginPath(); ctx.roundRect(-65, -45, 130, 90, 25); ctx.fill(); ctx.stroke(); }
        else { ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }

        template.features?.forEach(feat => {
            if (feat === "bulb") {
                const g = ctx.createRadialGradient(0, -50, 5, 0, -50, 40);
                g.addColorStop(0, "#a9dfbf"); g.addColorStop(1, "#1d8348");
                ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -45, 38, 0, Math.PI * 2); ctx.fill();
            } else if (feat === "shell") {
                ctx.fillStyle = "#7e5109"; ctx.beginPath(); ctx.ellipse(0, 5, 40, 45, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            } else if (feat === "bolt_tail") {
                ctx.strokeStyle = "#f1c40f"; ctx.lineWidth = 10; ctx.lineCap = "round";
                ctx.beginPath(); ctx.moveTo(35, 25); ctx.lineTo(65, 0); ctx.lineTo(50, 15); ctx.lineTo(90, -40); ctx.stroke();
            }
        });

        if (!back) {
            [-1, 1].forEach(side => {
                ctx.save(); ctx.translate(side * 20, -18);
                ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#3498db'; ctx.beginPath(); ctx.arc(0, 2, 6, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0, 3, 3, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            });
        }
    }

    adjustColor(hex, amount) {
        let col = hex.replace('#', '');
        let r = parseInt(col.substring(0, 2), 16) + amount;
        let g = parseInt(col.substring(2, 4), 16) + amount;
        let b = parseInt(col.substring(4, 6), 16) + amount;
        r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
        const toHex = (n) => n.toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    drawUIBox(ctx, x, y, w, h) {
        ctx.save(); ctx.shadowBlur = 15; ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, y, w, h, 20); ctx.fill(); ctx.stroke(); ctx.restore();
    }

    drawHPBar(ctx, x, y, curr, max) {
        ctx.fillStyle = '#2c3e50'; ctx.beginPath(); ctx.roundRect(x, y, 250, 15, 7); ctx.fill();
        const p = Math.max(0, curr / max);
        ctx.fillStyle = p > 0.5 ? '#58d68d' : (p > 0.2 ? '#f4d03f' : '#ec7063');
        ctx.beginPath(); ctx.roundRect(x, y, 250 * p, 15, 7); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(x, y, 250 * p, 4);
    }
}

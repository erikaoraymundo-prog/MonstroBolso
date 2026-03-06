import { AudioManager } from './audio.js';

// Basic polyfill for older browsers
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (r > w / 2) r = w / 2; if (r > h / 2) r = h / 2;
        this.beginPath(); this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r); this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r); this.closePath(); return this;
    };
}

export class Engine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width = 800;
        this.height = this.canvas.height = 600;
        this.scenes = new Map();
        this.currentScene = null;
        this.lastTime = performance.now();
        this.transition = { active: false, opacity: 0, target: null, mode: 'fade' };
        this.audio = new AudioManager();
    }

    setScene(sceneName) {
        if (this.currentScene) {
            this.transition.active = true;
            this.transition.opacity = 0;
            this.transition.target = sceneName;
            console.log(`Iniciando transição para: ${sceneName}`);
        } else {
            const nextScene = this.scenes.get(sceneName);
            if (nextScene) {
                this.currentScene = nextScene;
                if (this.currentScene.init) this.currentScene.init();
            }
        }
    }

    updateTransition() {
        if (!this.transition.active) return;

        if (this.transition.target) {
            this.transition.opacity += 0.05;
            if (this.transition.opacity >= 1) {
                if (this.currentScene && this.currentScene.destroy) this.currentScene.destroy();
                this.currentScene = this.scenes.get(this.transition.target);
                if (this.currentScene && this.currentScene.init) this.currentScene.init();
                this.transition.target = null;
            }
        } else {
            this.transition.opacity -= 0.05;
            if (this.transition.opacity <= 0) {
                this.transition.active = false;
                this.transition.opacity = 0;
            }
        }
    }

    start() {
        const loop = (time) => {
            const dt = (time - this.lastTime) / 1000;
            this.lastTime = time;

            this.updateTransition();
            if (this.currentScene) {
                this.currentScene.update(dt);
                this.currentScene.render(this.ctx);
            }

            // Day/Night Cycle Overlay (Very subtle color shift)
            const hour = (new Date()).getHours();
            if (hour < 6 || hour > 19) { // Night
                this.ctx.fillStyle = "rgba(21, 67, 96, 0.25)";
                this.ctx.fillRect(0, 0, this.width, this.height);
            } else if (hour > 17) { // Evening
                this.ctx.fillStyle = "rgba(186, 74, 0, 0.15)";
                this.ctx.fillRect(0, 0, this.width, this.height);
            }

            if (this.transition.active) {
                this.ctx.fillStyle = `rgba(0,0,0,${this.transition.opacity})`;
                this.ctx.fillRect(0, 0, this.width, this.height);
            }

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

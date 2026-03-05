export class AssetLoader {
    constructor() {
        this.assets = new Map();
        this.toLoad = 0;
        this.loaded = 0;
    }

    loadImage(key, src) {
        this.toLoad++;
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.assets.set(key, img);
                this.loaded++;
                resolve(img);
            };
            img.onerror = reject;
            img.src = src;
        });
    }

    get(key) {
        return this.assets.get(key);
    }

    get progress() {
        return this.toLoad === 0 ? 1 : this.loaded / this.toLoad;
    }
}

export class Engine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.lastTime = 0;
        this.loader = new AssetLoader();
        this.scenes = new Map();
        this.currentScene = null;
    }

    async start() {
        requestAnimationFrame((time) => this.loop(time));
    }

    loop(time) {
        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        if (this.currentScene) this.currentScene.update(dt);
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        if (this.currentScene) this.currentScene.render(this.ctx);
    }

    setScene(name) {
        this.currentScene = this.scenes.get(name);
        if (this.currentScene && this.currentScene.init) {
            this.currentScene.init();
        }
    }
}

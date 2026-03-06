export class AudioManager {
    constructor() {
        this.bgm = null;
        this.isMuted = false;
        this.volume = 0.5;
    }

    /**
     * Toca uma música de fundo em loop.
     * @param {string} src Caminho do arquivo de áudio.
     */
    playBGM(src) {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm = null;
        }

        this.bgm = new Audio(src);
        this.bgm.loop = true;
        this.bgm.volume = this.isMuted ? 0 : this.volume;

        // Browsers require user interaction before playing audio
        this.bgm.play().catch(err => {
            console.warn("Autoplay bloqueado pelo navegador. A música começará após a primeira interação.", err);
        });
    }

    stopBGM() {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm = null;
        }
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
        if (this.bgm) {
            this.bgm.volume = this.isMuted ? 0 : this.volume;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.bgm) {
            this.bgm.volume = this.isMuted ? 0 : this.volume;
        }
        return this.isMuted;
    }
}

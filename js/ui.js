import { GameState, Bag } from './bag.js';

export class UI {
    constructor() {
        this.pokedexEl = document.getElementById('pokedex-count');
        this.badgesEl = document.getElementById('badges');
        this.dialogueBox = document.getElementById('dialogue-box');
        this.dialogueText = document.getElementById('dialogue-text');
    }

    updateHUD() {
        this.pokedexEl.innerText = `Captured: ${GameState.CapturedArray.length}/151`;
        this.badgesEl.innerText = `Badges: ${GameState.GymBadgeCount}`;
    }

    showDialogue(text) {
        this.dialogueText.innerText = text;
        this.dialogueBox.classList.remove('hidden');
        setTimeout(() => this.hideDialogue(), 3000);
    }

    hideDialogue() {
        this.dialogueBox.classList.add('hidden');
    }

    toggleBag() {
        console.log("Bag Contents:", JSON.stringify(Bag, null, 2));
        // Simple UI representation in console for now, or build a div-based menu
        this.showDialogue("Check Console for Bag JSON!");
    }
}

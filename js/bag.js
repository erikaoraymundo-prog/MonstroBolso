export const Bag = {
    berries: [
        { id: "oran_berry", name: "Oran Berry", qty: 5, effect: (monster) => monster.currentStats.hp += 10 }
    ],
    capture: [
        { id: "poke_ball", name: "Poké Ball", qty: 10 }
    ],
    key_items: [
        { id: "tri_pass", name: "Tri-Pass", qty: 1 }
    ],

    addItem(category, itemId, qty = 1) {
        const item = this[category].find(i => i.id === itemId);
        if (item) {
            item.qty += qty;
        } else {
            this[category].push({ id: itemId, qty });
        }
    },

    removeItem(category, itemId, qty = 1) {
        const item = this[category].find(i => i.id === itemId);
        if (item) {
            item.qty -= qty;
            if (item.qty <= 0) {
                this[category] = this[category].filter(i => i.id !== itemId);
            }
            return true;
        }
        return false;
    }
};

export const GameState = {
    GymBadgeCount: 0,
    GlobalSwitch_GiovanniDefeated: false,
    CapturedArray: [],

    addCapture(monsterId) {
        if (!this.CapturedArray.includes(monsterId)) {
            this.CapturedArray.push(monsterId);
        }
    }
};

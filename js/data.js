// Natures Definition
export const NATURES = {
    Adamant: { buff: 'attack', nerf: 'spAttack' },
    Modest: { buff: 'spAttack', nerf: 'attack' },
    Timid: { buff: 'speed', nerf: 'attack' },
    Jolly: { buff: 'speed', nerf: 'spAttack' },
    Calm: { buff: 'spDefense', nerf: 'attack' }
};

// Base Stats Calculation
export function calculateStat(base, nature, statName) {
    let multiplier = 1.0;
    if (NATURES[nature]?.buff === statName) multiplier = 1.1;
    if (NATURES[nature]?.nerf === statName) multiplier = 0.9;

    return Math.floor(base * multiplier);
}

// Abilities / Passives
export const Abilities = {
    Intimidate: {
        onBattleStart: (owner, target) => {
            console.log(`${owner.name} activated Intimidate!`);
            target.currentStats.attack = Math.floor(target.currentStats.attack * 0.8);
        }
    },
    SwiftSwim: {
        onWeatherChange: (owner, weather) => {
            if (weather === 'Rain') owner.currentStats.speed *= 2;
        }
    }
};

// Monster Templates
export const MONSTER_TEMPLATES = {
    1: { name: "Bulbasaur", hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 },
    4: { name: "Charmander", hp: 39, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65 },
    7: { name: "Squirtle", hp: 44, attack: 48, defense: 65, spAttack: 50, spDefense: 64, speed: 43 },
    25: { name: "Pikachu", hp: 35, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90 },
    16: { name: "Pidgey", hp: 40, attack: 45, defense: 40, spAttack: 35, spDefense: 35, speed: 56 },
    92: { name: "Gastly", hp: 30, attack: 35, defense: 30, spAttack: 100, spDefense: 35, speed: 80 },
    150: { name: "Mewtwo", hp: 106, attack: 110, defense: 90, spAttack: 154, spDefense: 90, speed: 130, isLegendary: true }
};

export class Monster {
    constructor(id, name, baseStats, nature, ability) {
        this.id = id;
        this.name = name;
        this.baseStats = baseStats;
        this.nature = nature;
        this.ability = ability;
        this.currentStats = {
            hp: baseStats.hp,
            attack: calculateStat(baseStats.attack, nature, 'attack'),
            defense: calculateStat(baseStats.defense, nature, 'defense'),
            spAttack: calculateStat(baseStats.spAttack, nature, 'spAttack'),
            spDefense: calculateStat(baseStats.spDefense, nature, 'spDefense'),
            speed: calculateStat(baseStats.speed, nature, 'speed')
        };
    }

    static createRandom(isTallGrass = false) {
        const ids = Object.keys(MONSTER_TEMPLATES).filter(id => id != 150);
        let id = ids[Math.floor(Math.random() * ids.length)];

        // Rare chance for legendary in tall grass
        if (isTallGrass && Math.random() < 0.05) { // 5% chance
            id = 150;
        }

        const template = MONSTER_TEMPLATES[id];
        const natures = Object.keys(NATURES);
        const nature = natures[Math.floor(Math.random() * natures.length)];
        const abilities = Object.keys(Abilities);
        const ability = abilities[Math.floor(Math.random() * abilities.length)] || "None";

        return new Monster(parseInt(id), template.name, template, nature, ability);
    }
}

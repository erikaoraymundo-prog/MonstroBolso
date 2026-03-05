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

// Monster Template
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
}

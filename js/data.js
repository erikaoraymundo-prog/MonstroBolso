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

// Abilities
export const Abilities = {
    Intimidate: { onBattleStart: (owner, target) => { target.currentStats.attack = Math.floor(target.currentStats.attack * 0.8); } },
    SwiftSwim: { onWeatherChange: (owner, weather) => { if (weather === 'Rain') owner.currentStats.speed *= 2; } }
};

// Monster Templates - The Full 151 (Balanced to 150 HP)
export const MONSTER_TEMPLATES = {
    1: { name: "Bulbasaur", hp: 150, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45, color: "#82e0aa", shape: "quad", features: ["bulb", "spots"] },
    2: { name: "Ivysaur", hp: 150, attack: 62, defense: 63, spAttack: 80, spDefense: 80, speed: 60, color: "#76d7c4", shape: "quad", features: ["bulb", "spots"] },
    3: { name: "Venusaur", hp: 150, attack: 82, defense: 83, spAttack: 100, spDefense: 100, speed: 80, color: "#48c9b0", shape: "quad", features: ["flower", "spots"] },
    4: { name: "Charmander", hp: 150, attack: 52, defense: 43, spAttack: 60, spDefense: 50, speed: 65, color: "#f39c12", shape: "tall", features: ["flame"] },
    5: { name: "Charmeleon", hp: 150, attack: 64, defense: 58, spAttack: 80, spDefense: 65, speed: 80, color: "#e67e22", shape: "tall", features: ["flame", "horn"] },
    6: { name: "Charizard", hp: 150, attack: 84, defense: 78, spAttack: 109, spDefense: 85, speed: 100, color: "#d35400", shape: "tall", features: ["flame", "wings"] },
    7: { name: "Squirtle", hp: 150, attack: 48, defense: 65, spAttack: 50, spDefense: 64, speed: 43, color: "#5dade2", shape: "round", features: ["shell"] },
    8: { name: "Wartortle", hp: 150, attack: 63, defense: 80, spAttack: 65, spDefense: 80, speed: 58, color: "#3498db", shape: "round", features: ["shell", "ears"] },
    9: { name: "Blastoise", hp: 150, attack: 83, defense: 100, spAttack: 85, spDefense: 105, speed: 78, color: "#2e86c1", shape: "round", features: ["shell", "cannons"] },
    10: { name: "Caterpie", hp: 150, attack: 30, defense: 35, spAttack: 20, spDefense: 20, speed: 45, color: "#58d68d", shape: "long", features: ["antenna"] },
    11: { name: "Metapod", hp: 150, attack: 20, defense: 55, spAttack: 25, spDefense: 25, speed: 30, color: "#27ae60", shape: "bean", features: ["shell"] },
    12: { name: "Butterfree", hp: 150, attack: 45, defense: 50, spAttack: 90, spDefense: 80, speed: 70, color: "#bb8fce", shape: "round", features: ["wings", "antenna"] },
    13: { name: "Weedle", hp: 150, attack: 35, defense: 30, spAttack: 20, spDefense: 20, speed: 50, color: "#edbb99", shape: "long", features: ["horn"] },
    14: { name: "Kakuna", hp: 150, attack: 25, defense: 50, spAttack: 25, spDefense: 25, speed: 35, color: "#f4d03f", shape: "bean", features: ["shell"] },
    15: { name: "Beedrill", hp: 150, attack: 90, defense: 40, spAttack: 45, spDefense: 80, speed: 75, color: "#f1c40f", shape: "tall", features: ["wings", "stinger"] },
    16: { name: "Pidgey", hp: 150, attack: 45, defense: 40, spAttack: 35, spDefense: 35, speed: 56, color: "#a04000", shape: "round", features: ["wings", "beak"] },
    17: { name: "Pidgeotto", hp: 150, attack: 60, defense: 55, spAttack: 50, spDefense: 50, speed: 71, color: "#ba4a00", shape: "round", features: ["wings", "beak", "crest"] },
    18: { name: "Pidgeot", hp: 150, attack: 80, defense: 75, spAttack: 70, spDefense: 70, speed: 101, color: "#d35400", shape: "round", features: ["wings", "beak", "crest"] },
    19: { name: "Rattata", hp: 150, attack: 56, defense: 35, spAttack: 25, spDefense: 35, speed: 72, color: "#8e44ad", shape: "round", features: ["ears", "whiskers"] },
    20: { name: "Raticate", hp: 150, attack: 81, defense: 60, spAttack: 50, spDefense: 70, speed: 97, color: "#a04000", shape: "round", features: ["ears", "teeth"] },
    21: { name: "Spearow", hp: 150, attack: 60, defense: 30, spAttack: 31, spDefense: 31, speed: 70, color: "#922b21", shape: "round", features: ["wings", "beak"] },
    22: { name: "Fearow", hp: 150, attack: 90, defense: 65, spAttack: 61, spDefense: 61, speed: 100, color: "#a93226", shape: "round", features: ["wings", "long_beak"] },
    23: { name: "Ekans", hp: 150, attack: 60, defense: 44, spAttack: 40, spDefense: 54, speed: 55, color: "#884ea0", shape: "long", features: ["tongue"] },
    24: { name: "Arbok", hp: 150, attack: 95, defense: 69, spAttack: 65, spDefense: 79, speed: 80, color: "#7d3c98", shape: "long", features: ["hood", "tongue"] },
    25: { name: "Pikachu", hp: 150, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90, color: "#f4d03f", shape: "tall", features: ["ears", "cheeks", "bolt_tail"] },
    26: { name: "Raichu", hp: 150, attack: 90, defense: 55, spAttack: 90, spDefense: 80, speed: 110, color: "#d68910", shape: "tall", features: ["ears", "cheeks", "bolt_tail"] },
    27: { name: "Sandshrew", hp: 150, attack: 75, defense: 85, spAttack: 20, spDefense: 30, speed: 40, color: "#f7dc6f", shape: "round", features: ["claws"] },
    28: { name: "Sandslash", hp: 150, attack: 100, defense: 110, spAttack: 45, spDefense: 55, speed: 65, color: "#f1c40f", shape: "round", features: ["spikes", "claws"] },
    29: { name: "Nidoran F", hp: 150, attack: 47, defense: 52, spAttack: 40, spDefense: 40, speed: 41, color: "#85c1e9", shape: "quad", features: ["ears"] },
    30: { name: "Nidorina", hp: 150, attack: 62, defense: 67, spAttack: 55, spDefense: 55, speed: 56, color: "#5dade2", shape: "quad", features: ["ears", "spots"] },
    31: { name: "Nidoqueen", hp: 150, attack: 92, defense: 87, spAttack: 75, spDefense: 85, speed: 76, color: "#2e86c1", shape: "tall", features: ["horn", "tail"] },
    32: { name: "Nidoran M", hp: 150, attack: 57, defense: 40, spAttack: 40, spDefense: 40, speed: 50, color: "#bb8fce", shape: "quad", features: ["ears", "horn"] },
    33: { name: "Nidorino", hp: 150, attack: 72, defense: 57, spAttack: 55, spDefense: 55, speed: 65, color: "#a569bd", shape: "quad", features: ["ears", "horn", "spots"] },
    34: { name: "Nidoking", hp: 150, attack: 102, defense: 77, spAttack: 85, spDefense: 75, speed: 85, color: "#8e44ad", shape: "tall", features: ["horn", "tail", "spikes"] },
    35: { name: "Clefairy", hp: 150, attack: 45, defense: 48, spAttack: 60, spDefense: 65, speed: 35, color: "#f5b7b1", shape: "round", features: ["ears", "tail"] },
    36: { name: "Clefable", hp: 150, attack: 70, defense: 73, spAttack: 95, spDefense: 90, speed: 60, color: "#f1948a", shape: "round", features: ["ears", "wings", "tail"] },
    37: { name: "Vulpix", hp: 150, attack: 41, defense: 40, spAttack: 50, spDefense: 65, speed: 65, color: "#d35400", shape: "quad", features: ["multi_tail"] },
    38: { name: "Ninetales", hp: 150, attack: 76, defense: 75, spAttack: 81, spDefense: 100, speed: 100, color: "#f7dc6f", shape: "quad", features: ["multi_tail"] },
    39: { name: "Jigglypuff", hp: 150, attack: 45, defense: 20, spAttack: 45, spDefense: 25, speed: 20, color: "#f5b7b1", shape: "blob", features: ["ears", "tuft"] },
    40: { name: "Wigglytuff", hp: 150, attack: 70, defense: 45, spAttack: 85, spDefense: 50, speed: 45, color: "#f1948a", shape: "blob", features: ["ears", "tuft"] },
    41: { name: "Zubat", hp: 150, attack: 45, defense: 35, spAttack: 30, spDefense: 40, speed: 55, color: "#884ea0", shape: "round", features: ["wings", "ears"] },
    42: { name: "Golbat", hp: 150, attack: 80, defense: 70, spAttack: 65, spDefense: 75, speed: 90, color: "#7d3c98", shape: "round", features: ["wings", "mouth"] },
    43: { name: "Oddish", hp: 150, attack: 50, defense: 55, spAttack: 75, spDefense: 65, speed: 30, color: "#2e86c1", shape: "round", features: ["leaves"] },
    44: { name: "Gloom", hp: 150, attack: 65, defense: 70, spAttack: 85, spDefense: 75, speed: 40, color: "#2e86c1", shape: "round", features: ["flower", "drool"] },
    45: { name: "Vileplume", hp: 150, attack: 80, defense: 85, spAttack: 110, spDefense: 90, speed: 50, color: "#2e86c1", shape: "round", features: ["giant_flower"] },
    46: { name: "Paras", hp: 150, attack: 70, defense: 55, spAttack: 45, spDefense: 55, speed: 25, color: "#e67e22", shape: "quad", features: ["mushrooms"] },
    47: { name: "Parasect", hp: 150, attack: 95, defense: 80, spAttack: 60, spDefense: 80, speed: 30, color: "#d35400", shape: "quad", features: ["giant_mushroom"] },
    48: { name: "Venonat", hp: 150, attack: 55, defense: 50, spAttack: 40, spDefense: 55, speed: 45, color: "#884ea0", shape: "round", features: ["fur", "antenna"] },
    49: { name: "Venomoth", hp: 150, attack: 65, defense: 60, spAttack: 90, spDefense: 75, speed: 90, color: "#a569bd", shape: "tall", features: ["wings", "antenna"] },
    50: { name: "Diglett", hp: 150, attack: 55, defense: 25, spAttack: 35, spDefense: 45, speed: 95, color: "#a04000", shape: "finger", features: ["ground"] },
    51: { name: "Dugtrio", hp: 150, attack: 100, defense: 50, spAttack: 50, spDefense: 70, speed: 120, color: "#a04000", shape: "finger", features: ["ground", "triple"] },
    52: { name: "Meowth", hp: 150, attack: 45, defense: 35, spAttack: 40, spDefense: 40, speed: 90, color: "#fcf3cf", shape: "quad", features: ["coin", "whiskers"] },
    53: { name: "Persian", hp: 150, attack: 70, defense: 60, spAttack: 65, spDefense: 65, speed: 115, color: "#fdf2e9", shape: "quad", features: ["gem", "whiskers"] },
    54: { name: "Psyduck", hp: 150, attack: 52, defense: 48, spAttack: 65, spDefense: 50, speed: 55, color: "#f4d03f", shape: "bean", features: ["beak", "hair"] },
    55: { name: "Golduck", hp: 150, attack: 82, defense: 78, spAttack: 95, spDefense: 80, speed: 85, color: "#3498db", shape: "tall", features: ["beak", "gem"] },
    56: { name: "Mankey", hp: 150, attack: 80, defense: 35, spAttack: 35, spDefense: 45, speed: 70, color: "#f5c0a0", shape: "round", features: ["tail", "ears"] },
    57: { name: "Primeape", hp: 150, attack: 105, defense: 60, spAttack: 60, spDefense: 70, speed: 95, color: "#f5c0a0", shape: "round", features: ["cuffs", "ears"] },
    58: { name: "Growlithe", hp: 150, attack: 70, defense: 45, spAttack: 70, spDefense: 50, speed: 60, color: "#e67e22", shape: "quad", features: ["tiger_stripes"] },
    59: { name: "Arcanine", hp: 150, attack: 110, defense: 80, spAttack: 100, spDefense: 80, speed: 95, color: "#e67e22", shape: "quad", features: ["fluff", "tiger_stripes"] },
    60: { name: "Poliwag", hp: 150, attack: 50, defense: 40, spAttack: 40, spDefense: 40, speed: 90, color: "#3498db", shape: "round", features: ["swirl", "tail"] },
    61: { name: "Poliwhirl", hp: 150, attack: 65, defense: 65, spAttack: 50, spDefense: 50, speed: 90, color: "#2e86c1", shape: "round", features: ["swirl", "gloves"] },
    62: { name: "Poliwrath", hp: 150, attack: 95, defense: 95, spAttack: 70, spDefense: 90, speed: 70, color: "#2874a6", shape: "wide", features: ["swirl", "muscles"] },
    63: { name: "Abra", hp: 150, attack: 20, defense: 15, spAttack: 105, spDefense: 55, speed: 90, color: "#f4d03f", shape: "tall", features: ["tail", "ears"] },
    64: { name: "Kadabra", hp: 150, attack: 35, defense: 30, spAttack: 120, spDefense: 70, speed: 105, color: "#f4d03f", shape: "tall", features: ["spoon", "tail", "mustache"] },
    65: { name: "Alakazam", hp: 150, attack: 50, defense: 45, spAttack: 135, spDefense: 95, speed: 120, color: "#f4d03f", shape: "tall", features: ["double_spoon", "mustache"] },
    66: { name: "Machop", hp: 150, attack: 80, defense: 50, spAttack: 35, spDefense: 35, speed: 35, color: "#aab7b8", shape: "tall", features: ["muscles"] },
    67: { name: "Machoke", hp: 150, attack: 100, defense: 70, spAttack: 50, spDefense: 60, speed: 45, color: "#aab7b8", shape: "tall", features: ["belt", "muscles"] },
    68: { name: "Machamp", hp: 150, attack: 130, defense: 80, spAttack: 65, spDefense: 85, speed: 55, color: "#aab7b8", shape: "tall", features: ["four_arms", "belt"] },
    69: { name: "Bellsprout", hp: 150, attack: 75, defense: 35, spAttack: 70, spDefense: 30, speed: 40, color: "#f4d03f", shape: "thin", features: ["leaves"] },
    70: { name: "Weepinbell", hp: 150, attack: 90, defense: 50, spAttack: 85, spDefense: 45, speed: 55, color: "#f4d03f", shape: "bean", features: ["leaves", "mouth"] },
    71: { name: "Victreebel", hp: 150, attack: 105, defense: 65, spAttack: 100, spDefense: 70, speed: 70, color: "#f4d03f", shape: "bean", features: ["vine", "teeth"] },
    72: { name: "Tentacool", hp: 150, attack: 40, defense: 35, spAttack: 50, spDefense: 100, speed: 70, color: "#5dade2", shape: "round", features: ["tentacles", "gems"] },
    73: { name: "Tentacruel", hp: 150, attack: 70, defense: 65, spAttack: 80, spDefense: 120, speed: 100, color: "#2e86c1", shape: "round", features: ["multi_tentacles", "gems"] },
    74: { name: "Geodude", hp: 150, attack: 80, defense: 100, spAttack: 30, spDefense: 30, speed: 20, color: "#95a5a6", shape: "round", features: ["arms", "rocky"] },
    75: { name: "Graveler", hp: 150, attack: 95, defense: 115, spAttack: 45, spDefense: 45, speed: 35, color: "#7f8c8d", shape: "round", features: ["four_arms", "rocky"] },
    76: { name: "Golem", hp: 150, attack: 120, defense: 130, spAttack: 55, spDefense: 65, speed: 45, color: "#707b7c", shape: "round", features: ["rock_shell", "claws"] },
    77: { name: "Ponyta", hp: 150, attack: 85, defense: 55, spAttack: 65, spDefense: 65, speed: 90, color: "#fcf3cf", shape: "quad", features: ["fire_mane"] },
    78: { name: "Rapidash", hp: 150, attack: 100, defense: 70, spAttack: 80, spDefense: 80, speed: 105, color: "#fff", shape: "quad", features: ["fire_mane", "horn"] },
    79: { name: "Slowpoke", hp: 150, attack: 65, defense: 65, spAttack: 40, spDefense: 40, speed: 15, color: "#f5b7b1", shape: "quad", features: ["tail"] },
    80: { name: "Slowbro", hp: 150, attack: 75, defense: 110, spAttack: 100, spDefense: 80, speed: 30, color: "#f1948a", shape: "tall", features: ["shell_tail"] },
    81: { name: "Magnemite", hp: 150, attack: 35, defense: 70, spAttack: 95, spDefense: 55, speed: 45, color: "#bdc3c7", shape: "round", features: ["magnets", "eye"] },
    82: { name: "Magneton", hp: 150, attack: 60, defense: 95, spAttack: 120, spDefense: 70, speed: 70, color: "#bdc3c7", shape: "round", features: ["magnets", "triple"] },
    83: { name: "Farfetch'd", hp: 150, attack: 90, defense: 55, spAttack: 58, spDefense: 62, speed: 60, color: "#a04000", shape: "round", features: ["leak", "beak"] },
    84: { name: "Doduo", hp: 150, attack: 85, defense: 45, spAttack: 35, spDefense: 35, speed: 75, color: "#ba4a00", shape: "tall", features: ["double_head"] },
    85: { name: "Dodrio", hp: 150, attack: 110, defense: 70, spAttack: 60, spDefense: 60, speed: 110, color: "#a04000", shape: "tall", features: ["triple_head"] },
    86: { name: "Seel", hp: 150, attack: 45, defense: 55, spAttack: 45, spDefense: 70, speed: 45, color: "#f4f6f7", shape: "long", features: ["horn", "tail"] },
    87: { name: "Dewgong", hp: 150, attack: 70, defense: 80, spAttack: 70, spDefense: 95, speed: 70, color: "#fff", shape: "long", features: ["horn", "tail"] },
    88: { name: "Grimer", hp: 150, attack: 80, defense: 50, spAttack: 40, spDefense: 50, speed: 25, color: "#a569bd", shape: "blob", features: ["sludge"] },
    89: { name: "Muk", hp: 150, attack: 105, defense: 75, spAttack: 65, spDefense: 100, speed: 50, color: "#8e44ad", shape: "blob", features: ["sludge", "mouth"] },
    90: { name: "Shellder", hp: 150, attack: 65, defense: 100, spAttack: 45, spDefense: 25, speed: 40, color: "#884ea0", shape: "round", features: ["shell", "tongue"] },
    91: { name: "Cloyster", hp: 150, attack: 95, defense: 180, spAttack: 85, spDefense: 45, speed: 70, color: "#7d3c98", shape: "round", features: ["spike_shell", "horn"] },
    92: { name: "Gastly", hp: 150, attack: 35, defense: 30, spAttack: 100, spDefense: 35, speed: 80, color: "#5b2c6f", shape: "round", features: ["gas"] },
    93: { name: "Haunter", hp: 150, attack: 50, defense: 45, spAttack: 115, spDefense: 55, speed: 95, color: "#48235a", shape: "round", features: ["hands", "gas"] },
    94: { name: "Gengar", hp: 150, attack: 65, defense: 60, spAttack: 130, spDefense: 75, speed: 110, color: "#4a235a", shape: "round", features: ["spikes", "grin"] },
    95: { name: "Onix", hp: 150, attack: 45, defense: 160, spAttack: 30, spDefense: 45, speed: 70, color: "#95a5a6", shape: "long", features: ["rocky", "horn"] },
    96: { name: "Drowzee", hp: 150, attack: 48, defense: 45, spAttack: 43, spDefense: 90, speed: 42, color: "#f4d03f", shape: "tall", features: ["nose"] },
    97: { name: "Hypno", hp: 150, attack: 73, defense: 70, spAttack: 73, spDefense: 115, speed: 67, color: "#f1c40f", shape: "tall", features: ["pendulum", "nose"] },
    98: { name: "Krabby", hp: 150, attack: 105, defense: 90, spAttack: 25, spDefense: 25, speed: 50, color: "#e67e22", shape: "round", features: ["claws"] },
    99: { name: "Kingler", hp: 150, attack: 130, defense: 115, spAttack: 50, spDefense: 50, speed: 75, color: "#d35400", shape: "round", features: ["giant_claw"] },
    100: { name: "Voltorb", hp: 150, attack: 30, defense: 50, spAttack: 55, spDefense: 55, speed: 100, color: "#e74c3c", shape: "round", features: ["bolt"] },
    101: { name: "Electrode", hp: 150, attack: 50, defense: 70, spAttack: 80, spDefense: 80, speed: 150, color: "#ec7063", shape: "round", features: ["bolt"] },
    102: { name: "Exeggcute", hp: 150, attack: 40, defense: 80, spAttack: 60, spDefense: 45, speed: 40, color: "#f5b7b1", shape: "round", features: ["multi_egg"] },
    103: { name: "Exeggutor", hp: 150, attack: 95, defense: 85, spAttack: 125, spDefense: 75, speed: 55, color: "#f4d03f", shape: "tall", features: ["palm_tree", "heads"] },
    104: { name: "Cubone", hp: 150, attack: 50, defense: 95, spAttack: 40, spDefense: 50, speed: 35, color: "#ba4a00", shape: "tall", features: ["skull", "bone"] },
    105: { name: "Marowak", hp: 150, attack: 80, defense: 110, spAttack: 50, spDefense: 80, speed: 45, color: "#a04000", shape: "tall", features: ["skull", "bone"] },
    106: { name: "Hitmonlee", hp: 150, attack: 120, defense: 53, spAttack: 35, spDefense: 110, speed: 87, color: "#ba4a00", shape: "tall", features: ["bandages"] },
    107: { name: "Hitmonchan", hp: 150, attack: 105, defense: 79, spAttack: 35, spDefense: 110, speed: 76, color: "#ba4a00", shape: "tall", features: ["gloves"] },
    108: { name: "Lickitung", hp: 150, attack: 55, defense: 75, spAttack: 60, spDefense: 75, speed: 30, color: "#f1948a", shape: "wide", features: ["long_tongue"] },
    109: { name: "Koffing", hp: 150, attack: 65, defense: 95, spAttack: 60, spDefense: 45, speed: 35, color: "#8e44ad", shape: "round", features: ["gas", "skull_print"] },
    110: { name: "Weezing", hp: 150, attack: 90, defense: 120, spAttack: 85, spDefense: 70, speed: 60, color: "#7d3c98", shape: "round", features: ["gas", "double_head"] },
    111: { name: "Rhyhorn", hp: 150, attack: 85, defense: 95, spAttack: 30, spDefense: 30, speed: 25, color: "#95a5a6", shape: "quad", features: ["horn", "rocky"] },
    112: { name: "Rhydon", hp: 150, attack: 130, defense: 120, spAttack: 45, spDefense: 45, speed: 40, color: "#7f8c8d", shape: "tall", features: ["drill_horn", "tail"] },
    113: { name: "Chansey", hp: 150, attack: 5, defense: 5, spAttack: 35, spDefense: 105, speed: 50, color: "#f5b7b1", shape: "blob", features: ["egg_pouch"] },
    114: { name: "Tangela", hp: 150, attack: 55, defense: 115, spAttack: 100, spDefense: 40, speed: 60, color: "#2e86c1", shape: "round", features: ["vines", "boots"] },
    115: { name: "Kangaskhan", hp: 150, attack: 95, defense: 80, spAttack: 40, spDefense: 80, speed: 90, color: "#935116", shape: "tall", features: ["pouch", "tail"] },
    116: { name: "Horsea", hp: 150, attack: 40, defense: 70, spAttack: 70, spDefense: 25, speed: 60, color: "#5dade2", shape: "long", features: ["tail", "beak"] },
    117: { name: "Seadra", hp: 150, attack: 65, defense: 95, spAttack: 95, spDefense: 45, speed: 85, color: "#2e86c1", shape: "long", features: ["spiked_fins"] },
    118: { name: "Goldeen", hp: 150, attack: 67, defense: 60, spAttack: 35, spDefense: 50, speed: 63, color: "#fff", shape: "round", features: ["horn", "fancy_tail"] },
    119: { name: "Seaking", hp: 150, attack: 92, defense: 65, spAttack: 65, spDefense: 80, speed: 68, color: "#fff", shape: "round", features: ["horn", "fancy_tail", "spots"] },
    120: { name: "Staryu", hp: 150, attack: 45, defense: 55, spAttack: 70, spDefense: 55, speed: 85, color: "#d2b4de", shape: "star", features: ["gem"] },
    121: { name: "Starmie", hp: 150, attack: 75, defense: 85, spAttack: 100, spDefense: 85, speed: 115, color: "#884ea0", shape: "star", features: ["gem", "double_star"] },
    122: { name: "Mr. Mime", hp: 150, attack: 45, defense: 65, spAttack: 100, spDefense: 120, speed: 90, color: "#fff", shape: "tall", features: ["tufts", "gloves"] },
    123: { name: "Scyther", hp: 150, attack: 110, defense: 80, spAttack: 55, spDefense: 80, speed: 105, color: "#2ecc71", shape: "tall", features: ["blades", "wings"] },
    124: { name: "Jynx", hp: 150, attack: 50, defense: 35, spAttack: 115, spDefense: 95, speed: 95, color: "#e74c3c", shape: "tall", features: ["hair", "dress"] },
    125: { name: "Electabuzz", hp: 150, attack: 83, defense: 57, spAttack: 95, spDefense: 85, speed: 105, color: "#f1c40f", shape: "tall", features: ["bolt_stripes", "antenna"] },
    126: { name: "Magmar", hp: 150, attack: 95, defense: 57, spAttack: 100, spDefense: 85, speed: 93, color: "#e67e22", shape: "tall", features: ["tail", "fire_head"] },
    127: { name: "Pinsir", hp: 150, attack: 125, defense: 100, spAttack: 55, spDefense: 70, speed: 85, color: "#935116", shape: "wide", features: ["pincers"] },
    128: { name: "Tauros", hp: 150, attack: 100, defense: 95, spAttack: 40, spDefense: 70, speed: 110, color: "#935116", shape: "quad", features: ["triple_tail", "horns"] },
    129: { name: "Magikarp", hp: 150, attack: 10, defense: 55, spAttack: 15, spDefense: 20, speed: 80, color: "#e74c3c", shape: "round", features: ["crown", "mustache"] },
    130: { name: "Gyarados", hp: 150, attack: 125, defense: 79, spAttack: 60, spDefense: 100, speed: 81, color: "#2e86c1", shape: "long", features: ["fins", "scales", "rage"] },
    131: { name: "Lapras", hp: 150, attack: 85, defense: 80, spAttack: 85, spDefense: 95, speed: 60, color: "#5dade2", shape: "long", features: ["shell", "neck"] },
    132: { name: "Ditto", hp: 150, attack: 48, defense: 48, spAttack: 48, spDefense: 48, speed: 48, color: "#bb8fce", shape: "blob", features: ["smile"] },
    133: { name: "Eevee", hp: 150, attack: 55, defense: 50, spAttack: 45, spDefense: 65, speed: 55, color: "#ba4a00", shape: "quad", features: ["fluffy_neck", "tail"] },
    134: { name: "Vaporeon", hp: 150, attack: 65, defense: 60, spAttack: 110, spDefense: 95, speed: 65, color: "#5dade2", shape: "quad", features: ["fins", "tail"] },
    135: { name: "Jolteon", hp: 150, attack: 65, defense: 60, spAttack: 110, spDefense: 95, speed: 130, color: "#f4f3cf", shape: "quad", features: ["spikes", "bolt"] },
    136: { name: "Flareon", hp: 150, attack: 130, defense: 60, spAttack: 95, spDefense: 110, speed: 65, color: "#e67e22", shape: "quad", features: ["fluff", "tail"] },
    137: { name: "Porygon", hp: 150, attack: 60, defense: 70, spAttack: 85, spDefense: 75, speed: 40, color: "#f1948a", shape: "boxy", features: ["beak"] },
    138: { name: "Omanyte", hp: 150, attack: 40, defense: 100, spAttack: 90, spDefense: 55, speed: 35, color: "#5dade2", shape: "round", features: ["spiral_shell", "tentacles"] },
    139: { name: "Omastar", hp: 150, attack: 60, defense: 125, spAttack: 115, spDefense: 70, speed: 55, color: "#2e86c1", shape: "round", features: ["spiked_shell", "tentacles"] },
    140: { name: "Kabuto", hp: 150, attack: 80, defense: 90, spAttack: 55, spDefense: 45, speed: 55, color: "#935116", shape: "round", features: ["shell", "eyes"] },
    141: { name: "Kabutops", hp: 150, attack: 115, defense: 105, spAttack: 65, spDefense: 70, speed: 80, color: "#ba4a00", shape: "tall", features: ["scythes", "shell"] },
    142: { name: "Aerodactyl", hp: 150, attack: 105, defense: 65, spAttack: 60, spDefense: 75, speed: 130, color: "#bdc3c7", shape: "tall", features: ["wings", "jaw"] },
    143: { name: "Snorlax", hp: 150, attack: 110, defense: 65, spAttack: 65, spDefense: 110, speed: 30, color: "#1a1a1a", shape: "wide", features: ["belly"] },
    144: { name: "Articuno", hp: 150, attack: 85, defense: 100, spAttack: 95, spDefense: 125, speed: 85, color: "#5dade2", shape: "bird", features: ["ice_wings", "long_tail"], isLegendary: true },
    145: { name: "Zapdos", hp: 150, attack: 90, defense: 85, spAttack: 125, spDefense: 90, speed: 100, color: "#f4f3cf", shape: "bird", features: ["bolt_wings"], isLegendary: true },
    146: { name: "Moltres", hp: 150, attack: 100, defense: 90, spAttack: 125, spDefense: 85, speed: 90, color: "#f39c12", shape: "bird", features: ["fire_wings"], isLegendary: true },
    147: { name: "Dratini", hp: 150, attack: 64, defense: 45, spAttack: 50, spDefense: 50, speed: 50, color: "#5dade2", shape: "long", features: ["ears"] },
    148: { name: "Dragonair", hp: 150, attack: 84, defense: 65, spAttack: 70, spDefense: 70, speed: 70, color: "#3498db", shape: "long", features: ["gem", "ears"] },
    149: { name: "Dragonite", hp: 150, attack: 134, defense: 95, spAttack: 100, spDefense: 100, speed: 80, color: "#f39c12", shape: "tall", features: ["wings", "antenna"] },
    150: { name: "Mewtwo", hp: 150, attack: 110, defense: 90, spAttack: 154, spDefense: 90, speed: 130, color: "#ebdef0", shape: "tall", features: ["tube_neck", "tail"], isLegendary: true },
    151: { name: "Mew", hp: 150, attack: 100, defense: 100, spAttack: 100, spDefense: 100, speed: 100, color: "#f5b7b1", shape: "round", features: ["long_tail"], isLegendary: true }
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
        const ids = Object.keys(MONSTER_TEMPLATES).filter(id => !MONSTER_TEMPLATES[id].isLegendary);
        let id = ids[Math.floor(Math.random() * ids.length)];
        if (isTallGrass && Math.random() < 0.03) {
            const legendaries = Object.keys(MONSTER_TEMPLATES).filter(id => MONSTER_TEMPLATES[id].isLegendary);
            id = legendaries[Math.floor(Math.random() * legendaries.length)];
        }
        const template = MONSTER_TEMPLATES[id];
        const natures = Object.keys(NATURES);
        const nature = natures[Math.floor(Math.random() * natures.length)];
        const abilities = Object.keys(Abilities);
        const ability = abilities[Math.floor(Math.random() * abilities.length)] || "None";
        return new Monster(parseInt(id), template.name, template, nature, ability);
    }
}

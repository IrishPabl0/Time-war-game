import { AgeDefinition, BuildingDefinition, BuildingType, TechNode, UnitType, CampaignMission, Quest, PlacedBuilding } from '../types';

export const AGES: AgeDefinition[] = [
  {
    id: 'stone',
    name: 'Stone Age',
    subtitle: 'The Dawn of Discovery',
    themeColor: '#78350f',
    description: 'Thatch huts, bone tools, tribal campfires and mammoth hunts.',
    icon: 'Flame',
    advanceCost: { food: 250, wood: 200, stone: 150, science: 100 },
    unlockedBuildings: ['town_hall', 'house', 'lumber_camp', 'forager_hut', 'stone_quarry', 'campfire', 'barracks'],
    unlockedUnits: ['clubman', 'slinger']
  },
  {
    id: 'bronze',
    name: 'Bronze Age',
    subtitle: 'Forging Civilization',
    themeColor: '#b45309',
    description: 'Clay bricks, bronze weaponry, irrigation, and early metallurgy.',
    advanceCost: { food: 600, wood: 500, stone: 400, science: 300 },
    icon: 'Shield',
    unlockedBuildings: ['town_hall', 'house', 'lumber_camp', 'forager_hut', 'stone_quarry', 'farm', 'watchtower', 'barracks'],
    unlockedUnits: ['spearman', 'archer', 'chariot']
  },
  {
    id: 'iron',
    name: 'Iron Age',
    subtitle: 'Empires & Steel',
    themeColor: '#475569',
    description: 'Iron blades, grand stone fortifications, and organized legions.',
    advanceCost: { food: 1400, wood: 1200, stone: 1000, science: 800 },
    icon: 'Sword',
    unlockedBuildings: ['town_hall', 'house', 'lumber_camp', 'stone_quarry', 'farm', 'watchtower', 'storage_pit', 'barracks'],
    unlockedUnits: ['legionary', 'crossbowman', 'catapult']
  },
  {
    id: 'medieval',
    name: 'Medieval Age',
    subtitle: 'Knights & Castles',
    themeColor: '#1e3a8a',
    description: 'High stone keeps, knightly chivalry, granaries and siege warfare.',
    advanceCost: { food: 3000, wood: 2500, stone: 2500, science: 2000 },
    icon: 'Crown',
    unlockedBuildings: ['town_hall', 'house', 'lumber_camp', 'stone_quarry', 'farm', 'watchtower', 'storage_pit', 'barracks'],
    unlockedUnits: ['knight', 'longbowman', 'trebuchet']
  },
  {
    id: 'industrial',
    name: 'Industrial Age',
    subtitle: 'Steam & Engines',
    themeColor: '#525252',
    description: 'Steam engines, factories, rifled infantry, and urban power.',
    advanceCost: { food: 6000, wood: 5000, stone: 5000, science: 4500 },
    icon: 'Cog',
    unlockedBuildings: ['town_hall', 'house', 'lumber_camp', 'stone_quarry', 'farm', 'watchtower', 'storage_pit', 'barracks'],
    unlockedUnits: ['musketeer', 'cannon', 'steam_tank']
  },
  {
    id: 'space',
    name: 'Space Age',
    subtitle: 'Beyond the Stars',
    themeColor: '#6366f1',
    description: 'Launchpads, orbital shields, plasma soldiers, and interplanetary conquest.',
    advanceCost: { food: 15000, wood: 12000, stone: 12000, science: 10000 },
    icon: 'Rocket',
    unlockedBuildings: ['town_hall', 'house', 'lumber_camp', 'stone_quarry', 'farm', 'watchtower', 'storage_pit', 'barracks'],
    unlockedUnits: ['plasma_marine', 'orbital_drone', 'mech_walker']
  }
];

export const BUILDING_DEFINITIONS: Record<BuildingType, BuildingDefinition> = {
  town_hall: {
    type: 'town_hall',
    name: 'Chieftain Hall',
    category: 'core',
    age: 'stone',
    description: 'The tribal heart of your settlement. Generates gold, science, and directs all town activities.',
    size: { width: 5.5, depth: 5.5 },
    cost: { wood: 100, stone: 50 },
    productionRate: { science: 1.5, gold: 1.0 },
    capacity: { population: 5, resourceStorage: 1000 },
    maxWorkers: 2,
    maxLevel: 5,
    iconName: 'Tent'
  },
  house: {
    type: 'house',
    name: 'Thatch Hut',
    category: 'housing',
    age: 'stone',
    description: 'Cozy shelter crafted from wooden poles and dried reed thatch. Increases population capacity.',
    size: { width: 3.2, depth: 3.2 },
    cost: { wood: 40, stone: 15 },
    capacity: { population: 4 },
    maxLevel: 4,
    iconName: 'Home'
  },
  lumber_camp: {
    type: 'lumber_camp',
    name: 'Lumber Camp',
    category: 'production',
    age: 'stone',
    description: 'Timber harvesting lodge equipped with flint axes and log stacks. Supplies continuous wood.',
    size: { width: 4.2, depth: 4.0 },
    cost: { wood: 50, stone: 10 },
    productionRate: { wood: 2.5 },
    maxWorkers: 3,
    maxLevel: 5,
    iconName: 'Axe'
  },
  forager_hut: {
    type: 'forager_hut',
    name: 'Forager Hut',
    category: 'production',
    age: 'stone',
    description: 'Tribal berry gathering and meat drying post. Keeps your villagers well-fed.',
    size: { width: 3.5, depth: 3.5 },
    cost: { wood: 35, stone: 15 },
    productionRate: { food: 3.0 },
    maxWorkers: 3,
    maxLevel: 5,
    iconName: 'Apple'
  },
  stone_quarry: {
    type: 'stone_quarry',
    name: 'Stone Quarry',
    category: 'production',
    age: 'stone',
    description: 'Chisels raw granite, flint, and boulders from the surrounding earth.',
    size: { width: 4.5, depth: 4.5 },
    cost: { wood: 60, food: 30 },
    productionRate: { stone: 2.0 },
    maxWorkers: 3,
    maxLevel: 5,
    iconName: 'Pickaxe'
  },
  barracks: {
    type: 'barracks',
    name: 'Training Grounds',
    category: 'military',
    age: 'stone',
    description: 'A sparring pit with wooden target dummies. Trains brave chibi warriors for battles.',
    size: { width: 4.8, depth: 4.8 },
    cost: { wood: 80, stone: 60 },
    maxLevel: 4,
    iconName: 'Swords'
  },
  storage_pit: {
    type: 'storage_pit',
    name: 'Storage Granary',
    category: 'core',
    age: 'stone',
    description: 'Protected underground caches and timber sheds that expand maximum resource reserves.',
    size: { width: 3.8, depth: 3.8 },
    cost: { wood: 70, stone: 40 },
    capacity: { resourceStorage: 1500 },
    maxLevel: 4,
    iconName: 'Boxes'
  },
  watchtower: {
    type: 'watchtower',
    name: 'Lookout Tower',
    category: 'defense',
    age: 'stone',
    description: 'Elevated wooden watchpost equipped with spotters to safeguard against wild beasts and enemy raids.',
    size: { width: 2.8, depth: 2.8 },
    cost: { wood: 65, stone: 35 },
    maxLevel: 3,
    iconName: 'Eye'
  },
  campfire: {
    type: 'campfire',
    name: 'Tribal Hearth',
    category: 'decor',
    age: 'stone',
    description: 'A warm stone circle with glowing embers. Villagers gather here to dance, tell tales, and rest.',
    size: { width: 2.5, depth: 2.5 },
    cost: { wood: 20, stone: 15 },
    productionRate: { science: 0.5 },
    maxLevel: 2,
    iconName: 'Flame'
  },
  farm: {
    type: 'farm',
    name: 'Primitive Plot',
    category: 'production',
    age: 'bronze',
    description: 'Tilled fertile soil producing grain and hearty harvests.',
    size: { width: 4.5, depth: 4.5 },
    cost: { wood: 60, stone: 40 },
    productionRate: { food: 4.5 },
    maxWorkers: 4,
    maxLevel: 5,
    iconName: 'Wheat'
  }
};

export const INITIAL_BUILDINGS: PlacedBuilding[] = [
  {
    id: 'bld_th_1',
    type: 'town_hall',
    x: 0,
    z: 0,
    rotation: 0,
    level: 1,
    assignedWorkers: 1,
    age: 'stone',
    createdAt: Date.now() - 3600000
  },
  {
    id: 'bld_house_1',
    type: 'house',
    x: -8.5,
    z: -3.5,
    rotation: Math.PI / 4,
    level: 1,
    assignedWorkers: 0,
    age: 'stone',
    createdAt: Date.now() - 3000000
  },
  {
    id: 'bld_house_2',
    type: 'house',
    x: -8.5,
    z: 4.5,
    rotation: -Math.PI / 6,
    level: 1,
    assignedWorkers: 0,
    age: 'stone',
    createdAt: Date.now() - 2800000
  },
  {
    id: 'bld_lumber_1',
    type: 'lumber_camp',
    x: 9.0,
    z: -6.5,
    rotation: -Math.PI / 3,
    level: 1,
    assignedWorkers: 2,
    age: 'stone',
    createdAt: Date.now() - 2500000
  },
  {
    id: 'bld_forager_1',
    type: 'forager_hut',
    x: 8.0,
    z: 5.5,
    rotation: Math.PI / 6,
    level: 1,
    assignedWorkers: 2,
    age: 'stone',
    createdAt: Date.now() - 2000000
  },
  {
    id: 'bld_fire_1',
    type: 'campfire',
    x: -1.5,
    z: 6.5,
    rotation: 0,
    level: 1,
    assignedWorkers: 0,
    age: 'stone',
    createdAt: Date.now() - 1500000
  }
];

export const INITIAL_RESOURCES = {
  food: 120,
  wood: 140,
  stone: 90,
  science: 30,
  gold: 25
};

export const TECH_TREE: TechNode[] = [
  {
    id: 'tech_fire',
    name: 'Mastery of Fire',
    age: 'stone',
    cost: 30,
    description: 'Harness embers for cooking, tool hardening, and warding off night prowlers.',
    icon: 'Flame',
    requires: [],
    unlocked: true,
    effectDescription: '+15% Villager happiness and warmth'
  },
  {
    id: 'tech_stonework',
    name: 'Flint Knapping',
    age: 'stone',
    cost: 45,
    description: 'Chipping durable flint edges for axes, spears, and building foundations.',
    icon: 'Hammer',
    requires: ['tech_fire'],
    unlocked: false,
    effectDescription: 'Unlocks Stone Quarry building',
    unlocksBuilding: 'stone_quarry'
  },
  {
    id: 'tech_hunting',
    name: 'Tribal Warfare',
    age: 'stone',
    cost: 60,
    description: 'Organize hunting parties into cohesive tactical squads with defensive bone armor.',
    icon: 'Shield',
    requires: ['tech_fire'],
    unlocked: false,
    effectDescription: 'Unlocks Training Grounds (Barracks)',
    unlocksBuilding: 'barracks'
  },
  {
    id: 'tech_pottery',
    name: 'Storage & Pottery',
    age: 'stone',
    cost: 80,
    description: 'Clay jars and woven granaries protect grain, seeds, and gathered supplies.',
    icon: 'Boxes',
    requires: ['tech_stonework'],
    unlocked: false,
    effectDescription: 'Unlocks Storage Granary (+1500 max storage)',
    unlocksBuilding: 'storage_pit'
  },
  {
    id: 'tech_bronze_smelting',
    name: 'Copper & Tin Metallurgy',
    age: 'bronze',
    cost: 150,
    description: 'Combine copper and tin in intense kiln furnaces to produce strong bronze alloys.',
    icon: 'Anvil',
    requires: ['tech_stonework', 'tech_hunting'],
    unlocked: false,
    effectDescription: 'Allows advancement to the Bronze Age!'
  },
  {
    id: 'tech_agriculture',
    name: 'Irrigation & Farming',
    age: 'bronze',
    cost: 180,
    description: 'Channel river currents into fertile crop rows for massive food production.',
    icon: 'Wheat',
    requires: ['tech_bronze_smelting'],
    unlocked: false,
    effectDescription: 'Unlocks Farm plots'
  }
];

export const TROOP_TYPES: Record<string, UnitType> = {
  clubman: {
    id: 'clubman',
    name: 'Chibi Clubman',
    age: 'stone',
    role: 'melee',
    hp: 120,
    attack: 18,
    speed: 1.4,
    range: 1.5,
    cost: { food: 30, wood: 15 },
    description: 'Sturdy front-line brawler armed with a heavy knobby oak club.',
    icon: 'User'
  },
  slinger: {
    id: 'slinger',
    name: 'Pebble Slinger',
    age: 'stone',
    role: 'ranged',
    hp: 75,
    attack: 24,
    speed: 1.6,
    range: 7.0,
    cost: { food: 25, stone: 20 },
    description: 'Agile skirmisher launching polished river stones with devastating accuracy.',
    icon: 'Target'
  },
  spearman: {
    id: 'spearman',
    name: 'Bronze Spearman',
    age: 'bronze',
    role: 'tank',
    hp: 200,
    attack: 22,
    speed: 1.2,
    range: 2.2,
    cost: { food: 50, wood: 30, stone: 25 },
    description: 'Disciplined defender with a broad bronze spearhead, resistant to charge attacks.',
    icon: 'Shield'
  },
  archer: {
    id: 'archer',
    name: 'Composite Archer',
    age: 'bronze',
    role: 'ranged',
    hp: 90,
    attack: 32,
    speed: 1.5,
    range: 8.5,
    cost: { food: 40, wood: 45 },
    description: 'High-damage ranged shooter capable of picking off defending watchtowers.',
    icon: 'Crosshair'
  }
};

export const CAMPAIGN_MISSIONS: CampaignMission[] = [
  {
    id: 'mission_stone_1',
    title: 'Timber Wolf Den',
    age: 'stone',
    region: 'Whispering Glade',
    isBoss: false,
    difficulty: 'Easy',
    enemyKingdom: {
      name: 'Wild Feral Den',
      description: 'A pack of ferocious predators harassing your foragers and woodcutters.',
      wallsHp: 180,
      towers: 1,
      army: [
        { unitId: 'clubman', count: 3 }
      ]
    },
    rewards: { food: 80, wood: 90, scienceReward: 25 },
    completed: false,
    unlocked: true
  },
  {
    id: 'mission_stone_2',
    title: 'Rival Bonefang Outpost',
    age: 'stone',
    region: 'Flint Ridge',
    isBoss: false,
    difficulty: 'Medium',
    enemyKingdom: {
      name: 'Bonefang Clan Outpost',
      description: 'An aggressive rival tribe guarding rich mineral cliffs with wooden palisades.',
      wallsHp: 350,
      towers: 2,
      army: [
        { unitId: 'clubman', count: 4 },
        { unitId: 'slinger', count: 3 }
      ]
    },
    rewards: { wood: 120, stone: 150, scienceReward: 40 },
    completed: false,
    unlocked: false
  },
  {
    id: 'mission_stone_boss',
    title: 'The Great Mammoth Chieftain',
    age: 'stone',
    region: 'Valley of the Ancients',
    isBoss: true,
    difficulty: 'Boss',
    enemyKingdom: {
      name: 'Great Tusk Fortress',
      description: 'The ancient warlord riding an armored Woolly Mammoth behind heavy palisades and stone catapults!',
      wallsHp: 650,
      towers: 3,
      army: [
        { unitId: 'clubman', count: 6 },
        { unitId: 'slinger', count: 5 }
      ],
      bossName: 'Gorgoroth the Tusk-Breaker',
      bossHp: 850
    },
    rewards: { food: 300, wood: 300, stone: 300, scienceReward: 100, unlockedBonus: 'Ancient Mammoth Totem (+20% army attack)' },
    completed: false,
    unlocked: false
  }
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest_houses',
    title: 'Tribal Shelter',
    description: 'Construct 2 Thatch Huts to welcome new villagers to your settlement.',
    reward: { food: 60, wood: 50 },
    progress: 2,
    target: 2,
    completed: true,
    claimed: false,
    checkType: 'building_count',
    checkTarget: 'house'
  },
  {
    id: 'quest_wood',
    title: 'Stockpile Timber',
    description: 'Gather a reserve of 200 Wood from your Lumber Camp to fund construction.',
    reward: { stone: 60, science: 25 },
    progress: 140,
    target: 200,
    completed: false,
    claimed: false,
    checkType: 'resource_total',
    checkTarget: 'wood'
  },
  {
    id: 'quest_quarry',
    title: 'Stone Working',
    description: 'Research Flint Knapping and erect your first Stone Quarry.',
    reward: { wood: 80, food: 80 },
    progress: 0,
    target: 1,
    completed: false,
    claimed: false,
    checkType: 'building_count',
    checkTarget: 'stone_quarry'
  },
  {
    id: 'quest_boss',
    title: 'Defeat the Stone Age Boss',
    description: 'Train an army at your Training Grounds and conquer the Great Tusk Fortress!',
    reward: { science: 100, gold: 50 },
    progress: 0,
    target: 1,
    completed: false,
    claimed: false,
    checkType: 'win_battle',
    checkTarget: 'mission_stone_boss'
  }
];

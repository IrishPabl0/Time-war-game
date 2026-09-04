export type AgeId = 
  | 'stone' 
  | 'bronze' 
  | 'iron' 
  | 'medieval' 
  | 'industrial' 
  | 'space';

export interface AgeDefinition {
  id: AgeId;
  name: string;
  subtitle: string;
  themeColor: string;
  description: string;
  icon: string;
  advanceCost: {
    food: number;
    wood: number;
    stone: number;
    science: number;
  };
  unlockedBuildings: string[];
  unlockedUnits: string[];
}

export type ResourceType = 'food' | 'wood' | 'stone' | 'science' | 'gold';

export interface Resources {
  food: number;
  wood: number;
  stone: number;
  science: number;
  gold: number;
}

export interface ResourceRates {
  food: number;
  wood: number;
  stone: number;
  science: number;
  gold: number;
}

export type BuildingType = 
  | 'town_hall'
  | 'house'
  | 'lumber_camp'
  | 'forager_hut'
  | 'stone_quarry'
  | 'barracks'
  | 'storage_pit'
  | 'watchtower'
  | 'campfire'
  | 'farm';

export interface BuildingDefinition {
  type: BuildingType;
  name: string;
  category: 'core' | 'production' | 'housing' | 'military' | 'decor' | 'defense';
  age: AgeId;
  description: string;
  size: { width: number; depth: number }; // In 3D world units
  cost: Partial<Resources>;
  productionRate?: Partial<Resources>; // per second
  capacity?: {
    population?: number;
    resourceStorage?: number;
  };
  maxWorkers?: number;
  maxLevel: number;
  unlockTech?: string;
  iconName: string;
}

export interface PlacedBuilding {
  id: string;
  type: BuildingType;
  x: number;
  z: number;
  rotation: number; // in radians (0, PI/2, PI, 3PI/2)
  level: number;
  assignedWorkers: number;
  age: AgeId;
  createdAt: number;
  lastCollected?: number;
}

export interface Villager {
  id: string;
  name: string;
  job: 'idle' | 'woodcutter' | 'forager' | 'stonemason' | 'guard';
  targetBuildingId?: string;
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  speed: number;
  carrying?: ResourceType;
  color: string;
}

export interface TechNode {
  id: string;
  name: string;
  age: AgeId;
  cost: number; // science points
  description: string;
  icon: string;
  requires: string[];
  unlocked: boolean;
  effectDescription: string;
  unlocksBuilding?: BuildingType;
}

export interface UnitType {
  id: string;
  name: string;
  age: AgeId;
  role: 'melee' | 'ranged' | 'tank' | 'siege';
  hp: number;
  attack: number;
  speed: number;
  range: number;
  cost: Partial<Resources>;
  description: string;
  icon: string;
}

export interface CampaignMission {
  id: string;
  title: string;
  age: AgeId;
  region: string;
  isBoss: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Boss';
  enemyKingdom: {
    name: string;
    description: string;
    wallsHp: number;
    towers: number;
    army: { unitId: string; count: number }[];
    bossName?: string;
    bossHp?: number;
  };
  rewards: Partial<Resources> & { scienceReward: number; unlockedBonus?: string };
  completed: boolean;
  unlocked: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: Partial<Resources>;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  checkType: 'building_count' | 'resource_total' | 'advance_age' | 'win_battle';
  checkTarget?: string;
}

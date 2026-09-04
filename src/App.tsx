import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AgeId,
  PlacedBuilding,
  Resources,
  ResourceRates,
  BuildingType,
  Villager,
  CampaignMission,
  Quest
} from './types';
import {
  AGES,
  BUILDING_DEFINITIONS,
  INITIAL_BUILDINGS,
  INITIAL_RESOURCES,
  CAMPAIGN_MISSIONS,
  INITIAL_QUESTS,
  TECH_TREE
} from './game/constants';
import { World3D } from './components/World3D';
import { TopResourceBar } from './components/TopResourceBar';
import { BuildingDetailPanel } from './components/BuildingDetailPanel';
import { BuildMenuModal } from './components/BuildMenuModal';
import { CampaignViewModal } from './components/CampaignViewModal';
import { TechTreeModal } from './components/TechTreeModal';
import { QuestsModal } from './components/QuestsModal';
import { AgeAdvanceModal } from './components/AgeAdvanceModal';
import { BottomNavDock } from './components/BottomNavDock';
import { soundFx } from './game/audio';

const STORAGE_KEY = 'age_of_chibis_save_v1';

export default function App() {
  // Load saved state or default
  const [currentAge, setCurrentAge] = useState<AgeId>('stone');
  const [buildings, setBuildings] = useState<PlacedBuilding[]>(INITIAL_BUILDINGS);
  const [resources, setResources] = useState<Resources>(INITIAL_RESOURCES);
  const [unlockedTechs, setUnlockedTechs] = useState<string[]>(['tech_fire']);
  const [missions, setMissions] = useState<CampaignMission[]>(CAMPAIGN_MISSIONS);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [army, setArmy] = useState<Record<string, number>>({ clubman: 4, slinger: 2 });
  const [gameSpeed, setGameSpeed] = useState<number>(1);

  // Interaction State
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [placingType, setPlacingType] = useState<BuildingType | null>(null);

  // Modals
  const [isBuildOpen, setIsBuildOpen] = useState<boolean>(false);
  const [isCampaignOpen, setIsCampaignOpen] = useState<boolean>(false);
  const [isTechOpen, setIsTechOpen] = useState<boolean>(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState<boolean>(false);
  const [isAgeAdvanceOpen, setIsAgeAdvanceOpen] = useState<boolean>(false);

  // Villagers state (organic 3D pedestrians)
  const [villagers, setVillagers] = useState<Villager[]>([
    {
      id: 'v_1',
      name: 'Oog the Hewer',
      job: 'woodcutter',
      x: 0,
      z: 0,
      targetX: 9.0,
      targetZ: -6.5,
      speed: 1.2,
      color: '#16a34a'
    },
    {
      id: 'v_2',
      name: 'Mimi the Gatherer',
      job: 'forager',
      x: 0,
      z: 0,
      targetX: 8.0,
      targetZ: 5.5,
      speed: 1.3,
      color: '#e11d48'
    },
    {
      id: 'v_3',
      name: 'Brog the Builder',
      job: 'idle',
      x: -1.5,
      z: 6.5,
      targetX: 0,
      targetZ: 0,
      speed: 1.1,
      color: '#3b82f6'
    },
    {
      id: 'v_4',
      name: 'Lola the Scout',
      job: 'guard',
      x: -8.5,
      z: -3.5,
      targetX: -1.5,
      targetZ: 6.5,
      speed: 1.4,
      color: '#d97706'
    }
  ]);

  // Derived Values
  const currentAgeDef = useMemo(() => {
    return AGES.find(a => a.id === currentAge) || AGES[0];
  }, [currentAge]);

  const nextAgeDef = useMemo(() => {
    const idx = AGES.findIndex(a => a.id === currentAge);
    return idx < AGES.length - 1 ? AGES[idx + 1] : null;
  }, [currentAge]);

  const population = useMemo(() => {
    let max = 0;
    buildings.forEach(b => {
      const def = BUILDING_DEFINITIONS[b.type];
      if (def.capacity?.population) {
        max += def.capacity.population * b.level;
      }
    });
    return {
      current: villagers.length,
      max: Math.max(5, max)
    };
  }, [buildings, villagers.length]);

  const assignedWorkersTotal = useMemo(() => {
    return buildings.reduce((sum, b) => sum + (b.assignedWorkers || 0), 0);
  }, [buildings]);

  const idleVillagers = Math.max(0, villagers.length - assignedWorkersTotal);

  // Resource Production Rates
  const resourceRates = useMemo<ResourceRates>(() => {
    const rates: ResourceRates = { food: 0, wood: 0, stone: 0, science: 0, gold: 0 };

    buildings.forEach(bld => {
      const def = BUILDING_DEFINITIONS[bld.type];
      if (def.productionRate) {
        const workerMultiplier = 1 + (bld.assignedWorkers || 0) * 0.5;
        const levelMultiplier = bld.level;
        Object.entries(def.productionRate).forEach(([res, rate]) => {
          if (rate !== undefined) {
            rates[res as keyof ResourceRates] += Number(rate) * levelMultiplier * workerMultiplier;
          }
        });
      }
    });

    return rates;
  }, [buildings]);

  // Check Age Advance Readiness
  const canAdvanceAge = useMemo(() => {
    if (!nextAgeDef) return false;
    const cost = nextAgeDef.advanceCost;
    return (
      resources.food >= cost.food &&
      resources.wood >= cost.wood &&
      resources.stone >= cost.stone &&
      resources.science >= cost.science
    );
  }, [nextAgeDef, resources]);

  // Selected Building Object
  const selectedBuilding = useMemo(() => {
    return buildings.find(b => b.id === selectedBuildingId) || null;
  }, [buildings, selectedBuildingId]);

  // Game Loop Tick (Production & Quests)
  useEffect(() => {
    const tickInterval = 1000 / gameSpeed;
    const timer = setInterval(() => {
      setResources(prev => ({
        food: prev.food + resourceRates.food,
        wood: prev.wood + resourceRates.wood,
        stone: prev.stone + resourceRates.stone,
        science: prev.science + resourceRates.science,
        gold: prev.gold + resourceRates.gold,
      }));

      // Update quests progress for resource totals
      setQuests(prev =>
        prev.map(q => {
          if (q.checkType === 'resource_total' && q.checkTarget) {
            const currentVal = resources[q.checkTarget as keyof Resources] || 0;
            const newProg = Math.max(q.progress, Math.floor(currentVal));
            return {
              ...q,
              progress: newProg,
              completed: newProg >= q.target
            };
          }
          return q;
        })
      );

      // Wander Villagers organically
      setVillagers(prev =>
        prev.map(v => {
          const dx = v.targetX - v.x;
          const dz = v.targetZ - v.z;
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist < 0.6) {
            // Pick a new target building or point of interest
            const randomBld = buildings[Math.floor(Math.random() * buildings.length)];
            const rx = (Math.random() - 0.5) * 4;
            const rz = (Math.random() - 0.5) * 4;
            return {
              ...v,
              targetX: (randomBld ? randomBld.x : 0) + rx,
              targetZ: (randomBld ? randomBld.z : 0) + rz
            };
          }

          // Step towards target
          const step = 0.08 * v.speed;
          return {
            ...v,
            x: v.x + (dx / dist) * step,
            z: v.z + (dz / dist) * step
          };
        })
      );
    }, tickInterval);

    return () => clearInterval(timer);
  }, [gameSpeed, resourceRates, resources, buildings]);

  // Building Actions
  const handleSelectBuilding = useCallback((building: PlacedBuilding | null) => {
    setSelectedBuildingId(building ? building.id : null);
  }, []);

  const handleStartPlacement = (type: BuildingType) => {
    setSelectedBuildingId(null);
    setPlacingType(type);
  };

  const handlePlaceBuilding = (x: number, z: number) => {
    if (!placingType) return;
    const def = BUILDING_DEFINITIONS[placingType];

    // Deduct resources
    setResources(prev => ({
      ...prev,
      food: prev.food - (def.cost.food || 0),
      wood: prev.wood - (def.cost.wood || 0),
      stone: prev.stone - (def.cost.stone || 0),
    }));

    const newBuilding: PlacedBuilding = {
      id: `bld_${placingType}_${Date.now()}`,
      type: placingType,
      x,
      z,
      rotation: Math.random() * Math.PI * 2,
      level: 1,
      assignedWorkers: 0,
      age: currentAge,
      createdAt: Date.now()
    };

    setBuildings(prev => [...prev, newBuilding]);
    setPlacingType(null);
    setSelectedBuildingId(newBuilding.id);

    // Check building count quests
    setQuests(prev =>
      prev.map(q => {
        if (q.checkType === 'building_count' && q.checkTarget === placingType) {
          const newProg = q.progress + 1;
          return {
            ...q,
            progress: newProg,
            completed: newProg >= q.target
          };
        }
        return q;
      })
    );

    // If house, potentially spawn a new villager if under max
    if (placingType === 'house') {
      const names = ['Koko', 'Targ', 'Sula', 'Bim', 'Nala', 'Rokh'];
      const name = names[Math.floor(Math.random() * names.length)];
      setVillagers(prev => [
        ...prev,
        {
          id: `v_${Date.now()}`,
          name: `${name} the Settler`,
          job: 'idle',
          x,
          z,
          targetX: 0,
          targetZ: 0,
          speed: 1.2,
          color: '#8b5cf6'
        }
      ]);
    }
  };

  const handleUpgradeBuilding = (buildingId: string) => {
    const bld = buildings.find(b => b.id === buildingId);
    if (!bld) return;
    const def = BUILDING_DEFINITIONS[bld.type];
    const multiplier = Math.pow(1.6, bld.level);
    const upgradeCost = {
      food: Math.floor((def.cost.food || 0) * multiplier),
      wood: Math.floor((def.cost.wood || 0) * multiplier),
      stone: Math.floor((def.cost.stone || 0) * multiplier),
    };

    setResources(prev => ({
      ...prev,
      food: prev.food - upgradeCost.food,
      wood: prev.wood - upgradeCost.wood,
      stone: prev.stone - upgradeCost.stone,
    }));

    setBuildings(prev =>
      prev.map(b => (b.id === buildingId ? { ...b, level: b.level + 1 } : b))
    );
  };

  const handleAssignWorker = (buildingId: string, delta: number) => {
    setBuildings(prev =>
      prev.map(b => {
        if (b.id === buildingId) {
          const current = b.assignedWorkers || 0;
          return { ...b, assignedWorkers: Math.max(0, current + delta) };
        }
        return b;
      })
    );
  };

  const handleDemolishBuilding = (buildingId: string) => {
    const bld = buildings.find(b => b.id === buildingId);
    if (!bld || bld.type === 'town_hall') return;
    const def = BUILDING_DEFINITIONS[bld.type];

    // 50% refund
    setResources(prev => ({
      ...prev,
      wood: prev.wood + Math.floor((def.cost.wood || 0) * 0.5),
      stone: prev.stone + Math.floor((def.cost.stone || 0) * 0.5),
    }));

    setBuildings(prev => prev.filter(b => b.id !== buildingId));
    setSelectedBuildingId(null);
  };

  const handleQuickCollect = (buildingId: string) => {
    setResources(prev => ({
      ...prev,
      food: prev.food + 20,
      wood: prev.wood + 20,
      stone: prev.stone + 15
    }));
  };

  // Tech Research
  const handleResearchTech = (techId: string, cost: number) => {
    setResources(prev => ({
      ...prev,
      science: prev.science - cost
    }));
    setUnlockedTechs(prev => [...prev, techId]);
  };

  // Age Advancement
  const handleAdvanceAge = () => {
    if (!nextAgeDef) return;
    const cost = nextAgeDef.advanceCost;
    setResources(prev => ({
      food: prev.food - cost.food,
      wood: prev.wood - cost.wood,
      stone: prev.stone - cost.stone,
      science: prev.science - cost.science,
      gold: prev.gold + 100
    }));
    setCurrentAge(nextAgeDef.id);
  };

  // Troop Recruitment
  const handleTrainTroop = (unitId: string) => {
    setArmy(prev => ({
      ...prev,
      [unitId]: (prev[unitId] || 0) + 1
    }));
  };

  // Mission Victory
  const handleMissionVictory = (missionId: string, rewards: Partial<Resources> & { scienceReward: number }) => {
    setResources(prev => ({
      food: prev.food + (rewards.food || 0),
      wood: prev.wood + (rewards.wood || 0),
      stone: prev.stone + (rewards.stone || 0),
      science: prev.science + rewards.scienceReward,
      gold: prev.gold + (rewards.gold || 50)
    }));

    setMissions(prev =>
      prev.map((m, idx) => {
        if (m.id === missionId) {
          return { ...m, completed: true };
        }
        // Unlock next mission in sequence
        const currentIdx = prev.findIndex(x => x.id === missionId);
        if (idx === currentIdx + 1) {
          return { ...m, unlocked: true };
        }
        return m;
      })
    );

    // Check boss quest
    if (missionId === 'mission_stone_boss') {
      setQuests(prev =>
        prev.map(q =>
          q.checkTarget === 'mission_stone_boss' ? { ...q, progress: 1, completed: true } : q
        )
      );
    }
  };

  // Claim Quest Bounty
  const handleClaimQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    setResources(prev => ({
      ...prev,
      food: prev.food + (quest.reward.food || 0),
      wood: prev.wood + (quest.reward.wood || 0),
      stone: prev.stone + (quest.reward.stone || 0),
      science: prev.science + (quest.reward.science || 0),
      gold: prev.gold + (quest.reward.gold || 0),
    }));

    setQuests(prev =>
      prev.map(q => (q.id === questId ? { ...q, claimed: true } : q))
    );
  };

  const unclaimedQuestsCount = quests.filter(q => q.completed && !q.claimed).length;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D Continuous Chibi World (Three.js Canvas) */}
      <World3D
        buildings={buildings}
        currentAge={currentAge}
        selectedBuildingId={selectedBuildingId}
        onSelectBuilding={handleSelectBuilding}
        placingType={placingType}
        onPlaceBuilding={handlePlaceBuilding}
        onCancelPlacement={() => setPlacingType(null)}
        villagers={villagers}
      />

      {/* Top Mobile Resource & Age Status Bar */}
      <TopResourceBar
        resources={resources}
        rates={resourceRates}
        population={population}
        currentAgeDef={currentAgeDef}
        canAdvanceAge={canAdvanceAge}
        onOpenAgeAdvance={() => setIsAgeAdvanceOpen(true)}
        gameSpeed={gameSpeed}
        onToggleSpeed={() => setGameSpeed(prev => (prev === 1 ? 2 : prev === 2 ? 3 : 1))}
        onOpenQuests={() => setIsQuestsOpen(true)}
        questCountBadge={unclaimedQuestsCount}
      />

      {/* Building Specific Detail Panel (Tapped Object) */}
      <BuildingDetailPanel
        building={selectedBuilding}
        resources={resources}
        idleVillagers={idleVillagers}
        onClose={() => setSelectedBuildingId(null)}
        onUpgrade={handleUpgradeBuilding}
        onAssignWorker={handleAssignWorker}
        onDemolish={handleDemolishBuilding}
        onQuickCollect={handleQuickCollect}
      />

      {/* Bottom Navigation Dock */}
      <BottomNavDock
        onOpenBuild={() => setIsBuildOpen(true)}
        onOpenCampaign={() => setIsCampaignOpen(true)}
        onOpenTech={() => setIsTechOpen(true)}
        onOpenQuests={() => setIsQuestsOpen(true)}
        questCount={unclaimedQuestsCount}
      />

      {/* Construction Menu Modal */}
      <BuildMenuModal
        isOpen={isBuildOpen}
        onClose={() => setIsBuildOpen(false)}
        resources={resources}
        currentAge={currentAge}
        onStartPlacement={handleStartPlacement}
      />

      {/* World Map & Campaign Modal (Reverse Tower Defense Sieges & Bosses) */}
      <CampaignViewModal
        isOpen={isCampaignOpen}
        onClose={() => setIsCampaignOpen(false)}
        missions={missions}
        currentAge={currentAge}
        resources={resources}
        army={army}
        onTrainTroop={handleTrainTroop}
        onMissionVictory={handleMissionVictory}
      />

      {/* Tech Research Tree Modal */}
      <TechTreeModal
        isOpen={isTechOpen}
        onClose={() => setIsTechOpen(false)}
        unlockedTechs={unlockedTechs}
        resources={resources}
        onResearchTech={handleResearchTech}
      />

      {/* Quests & Milestones Modal */}
      <QuestsModal
        isOpen={isQuestsOpen}
        onClose={() => setIsQuestsOpen(false)}
        quests={quests}
        onClaimQuest={handleClaimQuest}
      />

      {/* Age Evolution Modal */}
      <AgeAdvanceModal
        isOpen={isAgeAdvanceOpen}
        onClose={() => setIsAgeAdvanceOpen(false)}
        currentAgeDef={currentAgeDef}
        nextAgeDef={nextAgeDef}
        resources={resources}
        onAdvanceAge={handleAdvanceAge}
      />
    </main>
  );
}

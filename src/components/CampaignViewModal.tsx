import React, { useState, useEffect, useRef } from 'react';
import { CampaignMission, UnitType, Resources, AgeId } from '../types';
import { TROOP_TYPES } from '../game/constants';
import { soundFx } from '../game/audio';
import confetti from 'canvas-confetti';
import { X, Swords, Shield, Skull, Award, Play, RotateCcw } from 'lucide-react';

interface CampaignViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  missions: CampaignMission[];
  currentAge: AgeId;
  resources: Resources;
  army: Record<string, number>;
  onTrainTroop: (unitId: string) => void;
  onMissionVictory: (missionId: string, rewards: Partial<Resources> & { scienceReward: number }) => void;
}

export const CampaignViewModal: React.FC<CampaignViewModalProps> = ({
  isOpen,
  onClose,
  missions,
  currentAge,
  resources,
  army,
  onTrainTroop,
  onMissionVictory
}) => {
  const [selectedMission, setSelectedMission] = useState<CampaignMission | null>(null);
  const [battleActive, setBattleActive] = useState<boolean>(false);
  const [battleState, setBattleState] = useState<{
    playerArmy: { id: string; name: string; hp: number; maxHp: number; attack: number; icon: string }[];
    enemyWallsHp: number;
    enemyWallsMaxHp: number;
    enemyTowersHp: number;
    enemyBossHp: number;
    enemyBossMaxHp: number;
    enemyArmy: { id: string; name: string; hp: number; maxHp: number; attack: number }[];
    combatLog: string[];
    isOver: boolean;
    victory: boolean;
  } | null>(null);

  const victoryReportedRef = useRef<string | null>(null);
  const defeatSoundReportedRef = useRef<boolean>(false);

  const handleStartBattle = (mission: CampaignMission) => {
    setSelectedMission(mission);
    victoryReportedRef.current = null;
    defeatSoundReportedRef.current = false;

    // Generate combat units based on player's current army
    const deployedUnits: { id: string; name: string; hp: number; maxHp: number; attack: number; icon: string }[] = [];
    Object.entries(army).forEach(([unitId, count]) => {
      const def = TROOP_TYPES[unitId];
      const countNum = Number(count) || 0;
      if (def) {
        for (let i = 0; i < countNum; i++) {
          deployedUnits.push({
            id: `${unitId}_${i}`,
            name: def.name,
            hp: def.hp,
            maxHp: def.hp,
            attack: def.attack,
            icon: def.icon
          });
        }
      }
    });

    if (deployedUnits.length === 0) {
      alert("You need to train troops at the Training Grounds first!");
      return;
    }

    const enemyUnits: { id: string; name: string; hp: number; maxHp: number; attack: number }[] = [];
    mission.enemyKingdom.army.forEach(enemy => {
      const def = TROOP_TYPES[enemy.unitId] || TROOP_TYPES['clubman'];
      for (let i = 0; i < enemy.count; i++) {
        enemyUnits.push({
          id: `enemy_${enemy.unitId}_${i}`,
          name: def.name,
          hp: def.hp * 0.9,
          maxHp: def.hp * 0.9,
          attack: def.attack
        });
      }
    });

    setBattleState({
      playerArmy: deployedUnits,
      enemyWallsHp: mission.enemyKingdom.wallsHp,
      enemyWallsMaxHp: mission.enemyKingdom.wallsHp,
      enemyTowersHp: mission.enemyKingdom.towers * 120,
      enemyBossHp: mission.enemyKingdom.bossHp || 0,
      enemyBossMaxHp: mission.enemyKingdom.bossHp || 0,
      enemyArmy: enemyUnits,
      combatLog: [`Siege started against ${mission.enemyKingdom.name}!`],
      isOver: false,
      victory: false
    });

    setBattleActive(true);
    soundFx.playChop();
  };

  // Turn-based / Real-time combat tick
  useEffect(() => {
    if (!isOpen || !battleActive || !battleState || battleState.isOver || !selectedMission) return;

    const timer = setInterval(() => {
      setBattleState(prev => {
        if (!prev || prev.isOver) return prev;

        const pArmy = prev.playerArmy.map(u => ({ ...u })).filter(u => u.hp > 0);
        const eArmy = prev.enemyArmy.map(u => ({ ...u })).filter(u => u.hp > 0);
        let wallsHp = prev.enemyWallsHp;
        let towersHp = prev.enemyTowersHp;
        let bossHp = prev.enemyBossHp;
        const newLogs = [...prev.combatLog];

        if (pArmy.length === 0) {
          return {
            ...prev,
            isOver: true,
            victory: false,
            combatLog: [...newLogs, 'Your army was repelled by the fortress defenders!']
          };
        }

        // 1. Player army attacks targets: Walls first -> Towers -> Enemy Army -> Boss
        const totalPlayerDmg = pArmy.reduce((acc, u) => acc + u.attack * 0.3, 0);

        if (wallsHp > 0) {
          wallsHp = Math.max(0, wallsHp - totalPlayerDmg);
          if (wallsHp === 0) newLogs.push('💥 Enemy palisade walls collapsed!');
        } else if (towersHp > 0) {
          towersHp = Math.max(0, towersHp - totalPlayerDmg);
          if (towersHp === 0) newLogs.push('🏹 Defensive watchtowers neutralized!');
        } else if (eArmy.length > 0) {
          const target = eArmy[0];
          target.hp -= totalPlayerDmg;
          if (target.hp <= 0) newLogs.push(`Defeated enemy defender!`);
        } else if (bossHp > 0) {
          bossHp = Math.max(0, bossHp - totalPlayerDmg);
          if (bossHp === 0) {
            newLogs.push(`🏆 The Boss was conquered!`);
          }
        }

        // 2. Enemy defends: Towers shoot player, and defenders strike back
        let incomingDmg = 0;
        if (towersHp > 0) incomingDmg += 15;
        if (eArmy.length > 0) incomingDmg += eArmy.reduce((acc, u) => acc + u.attack * 0.2, 0);
        if (bossHp > 0) incomingDmg += 35; // Boss heavy cleave

        if (incomingDmg > 0 && pArmy.length > 0) {
          // Spread damage across player frontline
          pArmy[0].hp -= incomingDmg;
          if (pArmy[0].hp <= 0) {
            newLogs.push(`${pArmy[0].name} fell in battle!`);
          }
        }

        // Check Victory Condition
        const allEnemiesDefeated = wallsHp <= 0 && towersHp <= 0 && eArmy.every(u => u.hp <= 0) && bossHp <= 0;
        if (allEnemiesDefeated) {
          return {
            ...prev,
            playerArmy: pArmy,
            enemyWallsHp: 0,
            enemyTowersHp: 0,
            enemyBossHp: 0,
            enemyArmy: [],
            isOver: true,
            victory: true,
            combatLog: [...newLogs, `🎉 Victory! Fortress conquered! Rewards unlocked!`]
          };
        }

        return {
          ...prev,
          playerArmy: pArmy.filter(u => u.hp > 0),
          enemyWallsHp: wallsHp,
          enemyTowersHp: towersHp,
          enemyBossHp: bossHp,
          enemyArmy: eArmy.filter(u => u.hp > 0),
          combatLog: newLogs.slice(-6)
        };
      });

      soundFx.playBattleHit();
    }, 600);

    return () => clearInterval(timer);
  }, [isOpen, battleActive, battleState?.isOver, selectedMission]);

  // Handle battle completion side-effects outside of state reducers
  useEffect(() => {
    if (battleState?.isOver && battleState.victory && selectedMission) {
      if (victoryReportedRef.current !== selectedMission.id) {
        victoryReportedRef.current = selectedMission.id;
        soundFx.playAgeUp();
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        onMissionVictory(selectedMission.id, selectedMission.rewards);
      }
    } else if (battleState?.isOver && !battleState.victory) {
      if (!defeatSoundReportedRef.current) {
        defeatSoundReportedRef.current = true;
        soundFx.playPop();
      }
    }
  }, [battleState?.isOver, battleState?.victory, selectedMission, onMissionVictory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold">
              🗺️
            </div>
            <div>
              <h2 className="text-lg font-chibi font-bold tracking-wide">
                Campaign & Reverse Sieges
              </h2>
              <p className="text-xs text-slate-400">
                Conquer rival tribal strongholds & age bosses
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setBattleActive(false);
              onClose();
            }}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {!battleActive ? (
          <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* World Map Missions List */}
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Territory Missions
              </h3>

              {missions.map(mission => (
                <div
                  key={mission.id}
                  onClick={() => setSelectedMission(mission)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedMission?.id === mission.id
                      ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/20 shadow-lg'
                      : mission.completed
                      ? 'bg-slate-900/60 border-emerald-500/40 opacity-85'
                      : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {mission.isBoss ? '👑' : '🏕️'}
                        </span>
                        <h4 className="font-chibi font-bold text-base text-white">
                          {mission.title}
                        </h4>
                        {mission.completed && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-slate-950">
                            Conquered
                          </span>
                        )}
                        {mission.isBoss && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white animate-pulse">
                            Boss Encounter
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Region: <span className="text-slate-300 font-semibold">{mission.region}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5">
                        {mission.enemyKingdom.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Rewards</div>
                      <div className="text-xs font-mono text-amber-300 mt-0.5">
                        +{mission.rewards.scienceReward} 🔮 Science
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Army Readiness & Training */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Your Standing Army</span>
                <span className="text-indigo-400 font-mono">
                  {Object.values(army).reduce((a: number, b: unknown) => a + (Number(b) || 0), 0)} Units
                </span>
              </h3>

              {/* Troop cards */}
              <div className="space-y-2">
                {Object.values(TROOP_TYPES).filter(t => t.age === 'stone').map(troop => {
                  const currentCount = army[troop.id] || 0;
                  const canRecruit =
                    (!troop.cost.food || resources.food >= troop.cost.food) &&
                    (!troop.cost.wood || resources.wood >= troop.cost.wood) &&
                    (!troop.cost.stone || resources.stone >= troop.cost.stone);

                  return (
                    <div key={troop.id} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-chibi font-bold text-white flex items-center gap-1.5">
                          <span>{troop.id === 'clubman' ? '🪓' : '🏹'}</span>
                          <span>{troop.name}</span>
                          <span className="text-indigo-300 font-mono">x{currentCount}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          HP {troop.hp} • Atk {troop.attack}
                        </div>
                      </div>

                      <button
                        disabled={!canRecruit}
                        onClick={() => {
                          soundFx.playChop();
                          onTrainTroop(troop.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-bold text-xs"
                      >
                        Train
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Action Button */}
              {selectedMission && (
                <div className="pt-2">
                  <button
                    onClick={() => handleStartBattle(selectedMission)}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-chibi font-bold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-98 transition-all"
                  >
                    <Swords className="w-4 h-4" />
                    <span>Launch Attack on {selectedMission.enemyKingdom.name}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Live Reverse Tower Defense Siege Simulation */
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Enemy Fortress Stats */}
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-chibi font-bold text-rose-300 flex items-center gap-2">
                    <Skull className="w-4 h-4" />
                    <span>{selectedMission?.enemyKingdom.name}</span>
                  </h4>
                  <span className="text-xs text-rose-400 font-mono">Defensive Fortress</span>
                </div>

                {/* Walls HP */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Palisade Walls</span>
                    <span className="font-mono">{Math.ceil(battleState?.enemyWallsHp || 0)} / {battleState?.enemyWallsMaxHp}</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-600 transition-all duration-300"
                      style={{ width: `${((battleState?.enemyWallsHp || 0) / (battleState?.enemyWallsMaxHp || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Watchtowers */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Defending Watchtowers</span>
                    <span className="font-mono">{Math.ceil(battleState?.enemyTowersHp || 0)} HP</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all duration-300"
                      style={{ width: `${Math.min(100, ((battleState?.enemyTowersHp || 0) / 240) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Boss HP if exists */}
                {selectedMission?.isBoss && (
                  <div>
                    <div className="flex justify-between text-xs text-amber-300 font-bold mb-1">
                      <span>👑 Boss: {selectedMission.enemyKingdom.bossName}</span>
                      <span className="font-mono">{Math.ceil(battleState?.enemyBossHp || 0)} / {battleState?.enemyBossMaxHp}</span>
                    </div>
                    <div className="w-full h-4 rounded-full bg-slate-800 overflow-hidden border border-amber-500/40">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
                        style={{ width: `${((battleState?.enemyBossHp || 0) / (battleState?.enemyBossMaxHp || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Player Army Status */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-chibi font-bold text-indigo-300 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Your Invading Vanguard</span>
                  </h4>
                  <span className="text-xs text-indigo-400 font-mono">
                    {battleState?.playerArmy.length} Remaining
                  </span>
                </div>

                {/* Unit Roster Grid */}
                <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto">
                  {battleState?.playerArmy.map(u => (
                    <div key={u.id} className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs">
                      <div className="font-bold text-slate-200">{u.name}</div>
                      <div className="w-full h-1.5 rounded-full bg-slate-700 mt-1 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all"
                          style={{ width: `${(u.hp / u.maxHp) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Combat Logs */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1 text-slate-300">
              {battleState?.combatLog.map((log, idx) => (
                <div key={idx} className="text-slate-400">
                  {log}
                </div>
              ))}
            </div>

            {/* End Battle Result */}
            {battleState?.isOver && (
              <div className="text-center p-4 rounded-2xl bg-slate-800/90 border border-slate-700">
                <h3 className={`text-xl font-chibi font-bold ${battleState.victory ? 'text-amber-400' : 'text-rose-400'}`}>
                  {battleState.victory ? '🎉 Decisive Victory!' : 'Defeat! Regroup your army!'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {battleState.victory
                    ? 'The enemy kingdom fell to your tactical invasion!'
                    : 'Train additional troops and upgrade technology to pierce their defenses.'}
                </p>
                <button
                  onClick={() => setBattleActive(false)}
                  className="mt-3 px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Return to Map
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

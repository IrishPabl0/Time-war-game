import React from 'react';
import { PlacedBuilding, Resources } from '../types';
import { BUILDING_DEFINITIONS } from '../game/constants';
import { soundFx } from '../game/audio';
import { X, ArrowUpCircle, Users, Trash2, Zap, Sparkles } from 'lucide-react';

interface BuildingDetailPanelProps {
  building: PlacedBuilding | null;
  resources: Resources;
  idleVillagers: number;
  onClose: () => void;
  onUpgrade: (buildingId: string) => void;
  onAssignWorker: (buildingId: string, delta: number) => void;
  onDemolish: (buildingId: string) => void;
  onQuickCollect: (buildingId: string) => void;
}

export const BuildingDetailPanel: React.FC<BuildingDetailPanelProps> = ({
  building,
  resources,
  idleVillagers,
  onClose,
  onUpgrade,
  onAssignWorker,
  onDemolish,
  onQuickCollect
}) => {
  if (!building) return null;

  const def = BUILDING_DEFINITIONS[building.type];
  if (!def) return null;

  // Upgrade costs scale with level
  const upgradeCostMultiplier = Math.pow(1.6, building.level);
  const upgradeCost = {
    food: Math.floor((def.cost.food || 0) * upgradeCostMultiplier),
    wood: Math.floor((def.cost.wood || 0) * upgradeCostMultiplier),
    stone: Math.floor((def.cost.stone || 0) * upgradeCostMultiplier),
  };

  const canAffordUpgrade =
    resources.food >= upgradeCost.food &&
    resources.wood >= upgradeCost.wood &&
    resources.stone >= upgradeCost.stone;

  const isMaxLevel = building.level >= def.maxLevel;

  return (
    <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-md pointer-events-auto">
      <div className="rounded-3xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl p-4 text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-2xl shadow-inner">
              {building.type === 'town_hall' ? '🏛️' :
               building.type === 'house' ? '🛖' :
               building.type === 'lumber_camp' ? '🪓' :
               building.type === 'forager_hut' ? '🧺' :
               building.type === 'stone_quarry' ? '⛏️' :
               building.type === 'barracks' ? '⚔️' :
               building.type === 'storage_pit' ? '📦' :
               building.type === 'watchtower' ? '👁️' :
               building.type === 'campfire' ? '🔥' : '🌾'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-chibi font-bold tracking-wide">
                  {def.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950">
                  Lv.{building.level}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {def.description}
              </p>
            </div>
          </div>

          <button
            id="btn-close-detail"
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats & Production */}
        <div className="py-3 grid grid-cols-2 gap-2 text-xs">
          {def.productionRate && (
            <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/40">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Production</span>
              <div className="mt-0.5 font-bold text-emerald-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                {Object.entries(def.productionRate).map(([res, rate]) => (
                  <span key={res}>
                    +{(Number(rate) * building.level * (1 + (building.assignedWorkers || 0) * 0.5)).toFixed(1)} {res}/s
                  </span>
                ))}
              </div>
            </div>
          )}

          {def.capacity && (
            <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/40">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Capacity</span>
              <div className="mt-0.5 font-bold text-cyan-300">
                {def.capacity.population && `+${def.capacity.population * building.level} Population`}
                {def.capacity.resourceStorage && `+${def.capacity.resourceStorage * building.level} Storage`}
              </div>
            </div>
          )}

          {/* Quick Collect Action */}
          {def.productionRate && (
            <div className="col-span-2">
              <button
                id="btn-quick-harvest"
                onClick={() => {
                  soundFx.playChop();
                  onQuickCollect(building.id);
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-300 font-bold flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Harvest Cache (+25)</span>
              </button>
            </div>
          )}
        </div>

        {/* Worker Assignment Section (if building supports workers) */}
        {def.maxWorkers && (
          <div className="p-2.5 rounded-2xl bg-slate-800/50 border border-slate-700/40 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <div>
                <div className="text-xs font-bold">Assigned Villagers</div>
                <div className="text-[10px] text-slate-400">
                  {idleVillagers} idle in town • Boosts output by +50% each
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-unassign-worker"
                disabled={building.assignedWorkers <= 0}
                onClick={() => {
                  soundFx.playPop();
                  onAssignWorker(building.id, -1);
                }}
                className="w-7 h-7 rounded-lg bg-slate-700 disabled:opacity-30 hover:bg-slate-600 text-white font-bold flex items-center justify-center text-sm"
              >
                -
              </button>
              <span className="font-mono font-bold text-sm text-indigo-300 w-6 text-center">
                {building.assignedWorkers}/{def.maxWorkers}
              </span>
              <button
                id="btn-assign-worker"
                disabled={building.assignedWorkers >= def.maxWorkers || idleVillagers <= 0}
                onClick={() => {
                  soundFx.playPop();
                  onAssignWorker(building.id, 1);
                }}
                className="w-7 h-7 rounded-lg bg-indigo-600 disabled:opacity-30 hover:bg-indigo-500 text-white font-bold flex items-center justify-center text-sm"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons: Upgrade & Demolish */}
        <div className="flex items-center gap-2 pt-1">
          <button
            id="btn-upgrade-building"
            disabled={isMaxLevel || !canAffordUpgrade}
            onClick={() => {
              soundFx.playUpgrade();
              onUpgrade(building.id);
            }}
            className={`flex-1 py-2.5 px-3 rounded-2xl font-chibi font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${
              isMaxLevel
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : canAffordUpgrade
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 opacity-80'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            {isMaxLevel ? (
              <span>Max Level Reached</span>
            ) : (
              <div className="flex items-center gap-1.5">
                <span>Upgrade to Lv.{building.level + 1}</span>
                <span className="text-[10px] font-mono font-normal opacity-90">
                  ({upgradeCost.wood > 0 && `${upgradeCost.wood}🪵`} {upgradeCost.stone > 0 && `${upgradeCost.stone}🪨`})
                </span>
              </div>
            )}
          </button>

          {building.type !== 'town_hall' && (
            <button
              id="btn-demolish-building"
              onClick={() => {
                soundFx.playPop();
                onDemolish(building.id);
              }}
              title="Demolish Building"
              className="p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 active:scale-95 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

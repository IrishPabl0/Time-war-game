import React, { useState } from 'react';
import { BuildingType, Resources, AgeId } from '../types';
import { BUILDING_DEFINITIONS, AGES } from '../game/constants';
import { soundFx } from '../game/audio';
import { X, Hammer, Shield, Home, Pickaxe, Sparkles } from 'lucide-react';

interface BuildMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: Resources;
  currentAge: AgeId;
  onStartPlacement: (type: BuildingType) => void;
}

export const BuildMenuModal: React.FC<BuildMenuModalProps> = ({
  isOpen,
  onClose,
  resources,
  currentAge,
  onStartPlacement
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const currentAgeIdx = AGES.findIndex(a => a.id === currentAge);
  const categories = [
    { id: 'all', label: 'All' },
    { id: 'production', label: 'Gathering' },
    { id: 'housing', label: 'Shelter' },
    { id: 'military', label: 'Military' },
    { id: 'decor', label: 'Hearth' },
  ];

  const buildings = Object.values(BUILDING_DEFINITIONS).filter(bld => {
    const bldAgeIdx = AGES.findIndex(a => a.id === bld.age);
    // Only show buildings unlocked up to current age
    if (bldAgeIdx > currentAgeIdx) return false;
    if (selectedCategory === 'all') return true;
    return bld.category === selectedCategory;
  });

  const canAfford = (cost: Partial<Resources>) => {
    if (cost.food && resources.food < cost.food) return false;
    if (cost.wood && resources.wood < cost.wood) return false;
    if (cost.stone && resources.stone < cost.stone) return false;
    return true;
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full sm:max-w-xl max-h-[85vh] rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
              🔨
            </div>
            <div>
              <h2 className="text-lg font-chibi font-bold text-white tracking-wide">
                Construction Yard
              </h2>
              <p className="text-xs text-slate-400">
                Place authentic 3D structures in your settlement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-4 py-2 border-b border-slate-800/80 flex gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                soundFx.playPop();
                setSelectedCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Building Cards List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {buildings.map(bld => {
            const affordable = canAfford(bld.cost);
            return (
              <div
                key={bld.type}
                className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between gap-3 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl shadow-inner shrink-0">
                    {bld.type === 'town_hall' ? '🏛️' :
                     bld.type === 'house' ? '🛖' :
                     bld.type === 'lumber_camp' ? '🪓' :
                     bld.type === 'forager_hut' ? '🧺' :
                     bld.type === 'stone_quarry' ? '⛏️' :
                     bld.type === 'barracks' ? '⚔️' :
                     bld.type === 'storage_pit' ? '📦' :
                     bld.type === 'watchtower' ? '👁️' :
                     bld.type === 'campfire' ? '🔥' : '🌾'}
                  </div>
                  <div>
                    <h4 className="font-chibi font-bold text-white text-sm">
                      {bld.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {bld.description}
                    </p>

                    {/* Cost pills */}
                    <div className="flex items-center gap-2 mt-2">
                      {bld.cost.wood && (
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded-lg ${resources.wood >= bld.cost.wood ? 'bg-slate-700/80 text-amber-300' : 'bg-rose-950/60 text-rose-300 font-bold'}`}>
                          🪵 {bld.cost.wood}
                        </span>
                      )}
                      {bld.cost.stone && (
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded-lg ${resources.stone >= bld.cost.stone ? 'bg-slate-700/80 text-slate-200' : 'bg-rose-950/60 text-rose-300 font-bold'}`}>
                          🪨 {bld.cost.stone}
                        </span>
                      )}
                      {bld.cost.food && (
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded-lg ${resources.food >= bld.cost.food ? 'bg-slate-700/80 text-emerald-300' : 'bg-rose-950/60 text-rose-300 font-bold'}`}>
                          🍎 {bld.cost.food}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  disabled={!affordable}
                  onClick={() => {
                    soundFx.playPop();
                    onStartPlacement(bld.type);
                    onClose();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-chibi font-bold shadow-md active:scale-95 transition-all shrink-0 ${
                    affordable
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  {affordable ? 'Build' : 'Need More'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

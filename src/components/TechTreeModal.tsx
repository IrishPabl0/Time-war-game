import React from 'react';
import { TechNode, Resources, AgeId } from '../types';
import { TECH_TREE } from '../game/constants';
import { soundFx } from '../game/audio';
import { X, Check, Lock, Sparkles, BookOpen } from 'lucide-react';

interface TechTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedTechs: string[];
  resources: Resources;
  onResearchTech: (techId: string, cost: number) => void;
}

export const TechTreeModal: React.FC<TechTreeModalProps> = ({
  isOpen,
  onClose,
  unlockedTechs,
  resources,
  onResearchTech
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[85vh] rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl font-bold">
              🔮
            </div>
            <div>
              <h2 className="text-lg font-chibi font-bold tracking-wide">
                Technology Research Tree
              </h2>
              <p className="text-xs text-slate-400">
                Unlock advancements, new buildings & era capabilities
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

        {/* Tech Grid */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Available Innovations
            </span>
            <div className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800">
              🔮 Available Science: {Math.floor(resources.science)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TECH_TREE.map(tech => {
              const isUnlocked = unlockedTechs.includes(tech.id);
              const meetsPrereqs = tech.requires.every(req => unlockedTechs.includes(req));
              const canAfford = resources.science >= tech.cost;

              return (
                <div
                  key={tech.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isUnlocked
                      ? 'bg-slate-900/60 border-emerald-500/40 text-slate-300'
                      : meetsPrereqs
                      ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500 shadow-md'
                      : 'bg-slate-950/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                        isUnlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {tech.icon === 'Flame' ? '🔥' :
                         tech.icon === 'Hammer' ? '🔨' :
                         tech.icon === 'Shield' ? '🛡️' :
                         tech.icon === 'Boxes' ? '📦' :
                         tech.icon === 'Anvil' ? '⚒️' : '🌾'}
                      </div>
                      <div>
                        <h4 className="font-chibi font-bold text-sm text-white">
                          {tech.name}
                        </h4>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {tech.age} age
                        </span>
                      </div>
                    </div>

                    {isUnlocked ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Mastered</span>
                      </span>
                    ) : !meetsPrereqs ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-500 text-xs">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </span>
                    ) : (
                      <button
                        disabled={!canAfford}
                        onClick={() => {
                          soundFx.playUpgrade();
                          onResearchTech(tech.id, tech.cost);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-chibi font-bold transition-all ${
                          canAfford
                            ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md active:scale-95'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        Research ({tech.cost} 🔮)
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    {tech.description}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Perk: {tech.effectDescription}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

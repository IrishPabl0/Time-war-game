import React from 'react';
import { AgeDefinition, Resources, AgeId } from '../types';
import { AGES } from '../game/constants';
import { soundFx } from '../game/audio';
import confetti from 'canvas-confetti';
import { X, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface AgeAdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAgeDef: AgeDefinition;
  nextAgeDef: AgeDefinition | null;
  resources: Resources;
  onAdvanceAge: () => void;
}

export const AgeAdvanceModal: React.FC<AgeAdvanceModalProps> = ({
  isOpen,
  onClose,
  currentAgeDef,
  nextAgeDef,
  resources,
  onAdvanceAge
}) => {
  if (!isOpen) return null;

  if (!nextAgeDef) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
        <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-center text-white">
          <div className="text-4xl mb-2">🚀</div>
          <h2 className="text-xl font-chibi font-bold text-amber-400">
            Supreme Age Attained
          </h2>
          <p className="text-xs text-slate-300 mt-2">
            You have guided your civilization to the pinnacle of human achievement!
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const cost = nextAgeDef.advanceCost;
  const canAfford =
    resources.food >= cost.food &&
    resources.wood >= cost.wood &&
    resources.stone >= cost.stone &&
    resources.science >= cost.science;

  const handleAdvance = () => {
    soundFx.playAgeUp();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 }
    });
    onAdvanceAge();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
              👑
            </div>
            <div>
              <h2 className="text-lg font-chibi font-bold tracking-wide">
                Epoch Progression
              </h2>
              <p className="text-xs text-slate-400">
                Advance your civilization to the next age
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

        {/* Visual Era Comparison */}
        <div className="p-5 flex items-center justify-center gap-4 bg-slate-950/60 border-b border-slate-800">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl mx-auto shadow-inner">
              🛖
            </div>
            <div className="text-xs font-bold text-slate-300 mt-2">
              {currentAgeDef.name}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <ArrowRight className="w-6 h-6 text-amber-400 animate-pulse" />
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-1">
              Advance
            </span>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-3xl mx-auto shadow-inner ring-2 ring-amber-400/30">
              🏛️
            </div>
            <div className="text-xs font-bold text-amber-300 mt-2">
              {nextAgeDef.name}
            </div>
          </div>
        </div>

        {/* Content & Requirements */}
        <div className="p-5 space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Age Unlocks & Advancements
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              {nextAgeDef.description}
            </p>
          </div>

          {/* Resource Requirements */}
          <div>
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
              Required Epoch Tribute
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                resources.food >= cost.food ? 'bg-slate-800/60 border-slate-700 text-emerald-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}>
                <span>🍎 Food</span>
                <span className="font-mono font-bold">{Math.floor(resources.food)} / {cost.food}</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                resources.wood >= cost.wood ? 'bg-slate-800/60 border-slate-700 text-amber-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}>
                <span>🪵 Wood</span>
                <span className="font-mono font-bold">{Math.floor(resources.wood)} / {cost.wood}</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                resources.stone >= cost.stone ? 'bg-slate-800/60 border-slate-700 text-slate-200' : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}>
                <span>🪨 Stone</span>
                <span className="font-mono font-bold">{Math.floor(resources.stone)} / {cost.stone}</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                resources.science >= cost.science ? 'bg-slate-800/60 border-slate-700 text-cyan-300' : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}>
                <span>🔮 Science</span>
                <span className="font-mono font-bold">{Math.floor(resources.science)} / {cost.science}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            disabled={!canAfford}
            onClick={handleAdvance}
            className={`w-full py-3.5 rounded-2xl font-chibi font-bold text-sm shadow-xl flex items-center justify-center gap-2 active:scale-98 transition-all ${
              canAfford
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-amber-500/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{canAfford ? `Ascend to ${nextAgeDef.name}!` : 'Gather Required Resources to Advance'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

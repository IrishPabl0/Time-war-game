import React from 'react';
import { Resources, ResourceRates, AgeDefinition } from '../types';
import { soundFx } from '../game/audio';
import { Volume2, VolumeX, FastForward, Play, Shield, Award } from 'lucide-react';

interface TopResourceBarProps {
  resources: Resources;
  rates: ResourceRates;
  population: { current: number; max: number };
  currentAgeDef: AgeDefinition;
  canAdvanceAge: boolean;
  onOpenAgeAdvance: () => void;
  gameSpeed: number;
  onToggleSpeed: () => void;
  onOpenQuests: () => void;
  questCountBadge: number;
}

export const TopResourceBar: React.FC<TopResourceBarProps> = ({
  resources,
  rates,
  population,
  currentAgeDef,
  canAdvanceAge,
  onOpenAgeAdvance,
  gameSpeed,
  onToggleSpeed,
  onOpenQuests,
  questCountBadge
}) => {
  const [isMuted, setIsMuted] = React.useState(soundFx.getIsMuted());

  const handleToggleMute = () => {
    const muted = soundFx.toggleMute();
    setIsMuted(muted);
    soundFx.playPop();
  };

  const formatNum = (n: number) => {
    if (n >= 10000) return `${(n / 1000).toFixed(1)}k`;
    return Math.floor(n).toLocaleString();
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-2 md:p-3">
      <div className="max-w-6xl mx-auto flex flex-col gap-2">
        {/* Main top bar container */}
        <div className="flex items-center justify-between gap-2">
          {/* Age Indicator & Advance Button */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              id="btn-age-indicator"
              onClick={onOpenAgeAdvance}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl backdrop-blur-md shadow-lg border transition-all active:scale-95 ${
                canAdvanceAge
                  ? 'bg-amber-500/90 text-amber-950 border-amber-300 ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 animate-bounce'
                  : 'bg-slate-900/85 text-white border-slate-700/80 hover:bg-slate-800/90'
              }`}
            >
              <span className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shadow-inner">
                🏛️
              </span>
              <div className="text-left leading-tight hidden sm:block">
                <div className="text-[10px] text-amber-300/80 font-bold uppercase tracking-wider">
                  Current Era
                </div>
                <div className="text-xs font-chibi font-bold tracking-wide flex items-center gap-1.5">
                  {currentAgeDef.name}
                  {canAdvanceAge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-extrabold uppercase">
                      Ready!
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Quests Button with Badge */}
            <button
              id="btn-open-quests"
              onClick={onOpenQuests}
              className="pointer-events-auto relative p-2 rounded-2xl bg-slate-900/85 hover:bg-slate-800 text-amber-400 border border-slate-700/80 backdrop-blur-md shadow-lg active:scale-95 transition-all"
              title="Quests & Milestones"
            >
              <Award className="w-5 h-5" />
              {questCountBadge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-slate-900 animate-pulse">
                  {questCountBadge}
                </span>
              )}
            </button>
          </div>

          {/* Resources Stream (Mobile scrollable or flex) */}
          <div className="pointer-events-auto flex-1 max-w-2xl overflow-x-auto no-scrollbar flex items-center justify-center gap-1.5 sm:gap-2 px-1">
            {/* Food */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md shadow-md text-white shrink-0">
              <span className="text-base leading-none">🍎</span>
              <div className="leading-none">
                <div className="text-xs font-bold font-mono text-emerald-400">
                  {formatNum(resources.food)}
                </div>
                <div className="text-[9px] text-slate-400">
                  +{rates.food.toFixed(1)}/s
                </div>
              </div>
            </div>

            {/* Wood */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md shadow-md text-white shrink-0">
              <span className="text-base leading-none">🪵</span>
              <div className="leading-none">
                <div className="text-xs font-bold font-mono text-amber-400">
                  {formatNum(resources.wood)}
                </div>
                <div className="text-[9px] text-slate-400">
                  +{rates.wood.toFixed(1)}/s
                </div>
              </div>
            </div>

            {/* Stone */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md shadow-md text-white shrink-0">
              <span className="text-base leading-none">🪨</span>
              <div className="leading-none">
                <div className="text-xs font-bold font-mono text-slate-300">
                  {formatNum(resources.stone)}
                </div>
                <div className="text-[9px] text-slate-400">
                  +{rates.stone.toFixed(1)}/s
                </div>
              </div>
            </div>

            {/* Science */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md shadow-md text-white shrink-0">
              <span className="text-base leading-none">🔮</span>
              <div className="leading-none">
                <div className="text-xs font-bold font-mono text-cyan-400">
                  {formatNum(resources.science)}
                </div>
                <div className="text-[9px] text-slate-400">
                  +{rates.science.toFixed(1)}/s
                </div>
              </div>
            </div>

            {/* Gold */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md shadow-md text-white shrink-0 hidden sm:flex">
              <span className="text-base leading-none">🪙</span>
              <div className="leading-none">
                <div className="text-xs font-bold font-mono text-yellow-400">
                  {formatNum(resources.gold)}
                </div>
                <div className="text-[9px] text-slate-400">
                  +{rates.gold.toFixed(1)}/s
                </div>
              </div>
            </div>

            {/* Population */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md shadow-md text-white shrink-0">
              <span className="text-base leading-none">👥</span>
              <div className="leading-none">
                <div className="text-xs font-bold font-mono text-indigo-300">
                  {population.current}/{population.max}
                </div>
                <div className="text-[9px] text-slate-400">Pop.</div>
              </div>
            </div>
          </div>

          {/* Controls: Audio & Speed */}
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              id="btn-toggle-speed"
              onClick={onToggleSpeed}
              title={`Game Speed: ${gameSpeed}x`}
              className="p-2 rounded-2xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700/80 backdrop-blur-md shadow-lg active:scale-95 transition-all text-xs font-extrabold flex items-center gap-1"
            >
              <FastForward className="w-4 h-4 text-cyan-400" />
              <span>{gameSpeed}x</span>
            </button>

            <button
              id="btn-toggle-audio"
              onClick={handleToggleMute}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              className="p-2 rounded-2xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700/80 backdrop-blur-md shadow-lg active:scale-95 transition-all"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

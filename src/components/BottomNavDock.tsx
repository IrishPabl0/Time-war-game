import React from 'react';
import { soundFx } from '../game/audio';
import { Hammer, Swords, BookOpen, Award, Compass } from 'lucide-react';

interface BottomNavDockProps {
  onOpenBuild: () => void;
  onOpenCampaign: () => void;
  onOpenTech: () => void;
  onOpenQuests: () => void;
  questCount: number;
}

export const BottomNavDock: React.FC<BottomNavDockProps> = ({
  onOpenBuild,
  onOpenCampaign,
  onOpenTech,
  onOpenQuests,
  questCount
}) => {
  return (
    <nav className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
      <div className="flex items-center gap-2 p-2 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl">
        {/* Build Button (Primary Highlight) */}
        <button
          id="btn-nav-build"
          onClick={() => {
            soundFx.playPop();
            onOpenBuild();
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-chibi font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
        >
          <Hammer className="w-4 h-4" />
          <span>Build</span>
        </button>

        {/* Campaign / World Map */}
        <button
          id="btn-nav-campaign"
          onClick={() => {
            soundFx.playPop();
            onOpenCampaign();
          }}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-chibi font-bold text-xs border border-slate-700 active:scale-95 transition-all"
        >
          <Swords className="w-4 h-4 text-rose-400" />
          <span>Campaign</span>
        </button>

        {/* Tech Tree */}
        <button
          id="btn-nav-tech"
          onClick={() => {
            soundFx.playPop();
            onOpenTech();
          }}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-chibi font-bold text-xs border border-slate-700 active:scale-95 transition-all"
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Research</span>
        </button>

        {/* Quests */}
        <button
          id="btn-nav-quests"
          onClick={() => {
            soundFx.playPop();
            onOpenQuests();
          }}
          className="relative p-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95 transition-all"
          title="Quests"
        >
          <Award className="w-4 h-4 text-amber-400" />
          {questCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-slate-900 animate-pulse">
              {questCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

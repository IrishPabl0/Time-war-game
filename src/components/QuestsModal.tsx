import React from 'react';
import { Quest, Resources } from '../types';
import { soundFx } from '../game/audio';
import { X, Award, CheckCircle2, Gift } from 'lucide-react';

interface QuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: Quest[];
  onClaimQuest: (questId: string) => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({
  isOpen,
  onClose,
  quests,
  onClaimQuest
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg max-h-[85vh] rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
              📜
            </div>
            <div>
              <h2 className="text-lg font-chibi font-bold tracking-wide">
                Settlement Quests & Milestones
              </h2>
              <p className="text-xs text-slate-400">
                Complete objectives to earn bounty rewards
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

        {/* Quests List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {quests.map(quest => {
            const isReadyToClaim = quest.completed && !quest.claimed;

            return (
              <div
                key={quest.id}
                className={`p-4 rounded-2xl border transition-all ${
                  quest.claimed
                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                    : isReadyToClaim
                    ? 'bg-amber-500/10 border-amber-400/80 ring-1 ring-amber-400/30 shadow-lg'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-chibi font-bold text-sm text-white">
                      {quest.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {quest.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-2.5">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Progress</span>
                        <span className="font-mono">{Math.min(quest.progress, quest.target)} / {quest.target}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-amber-400 transition-all duration-300"
                          style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reward / Claim */}
                  <div className="shrink-0 flex flex-col items-end gap-1.5">
                    {quest.claimed ? (
                      <span className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Claimed</span>
                      </span>
                    ) : isReadyToClaim ? (
                      <button
                        onClick={() => {
                          soundFx.playUpgrade();
                          onClaimQuest(quest.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-chibi font-extrabold shadow-lg flex items-center gap-1.5 animate-pulse"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        <span>Claim Bounty</span>
                      </button>
                    ) : (
                      <div className="text-[11px] font-mono text-amber-300 bg-slate-800 px-2 py-1 rounded-lg">
                        {Object.entries(quest.reward).map(([r, val]) => `${val} ${r}`).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

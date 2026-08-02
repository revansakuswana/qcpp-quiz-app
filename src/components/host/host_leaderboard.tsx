import React, { useEffect } from 'react';
import { Trophy, Medal, Award, RotateCcw, Sparkles } from 'lucide-react';
import { SessionParticipant } from '../../types/quiz';
import { soundFx } from '../../lib/audio';
import { fireConfetti } from '../../lib/confetti';

interface HostLeaderboardProps {
  participants: SessionParticipant[];
  onPlayAgain: () => void;
}

export const HostLeaderboard: React.FC<HostLeaderboardProps> = ({
  participants,
  onPlayAgain,
}) => {
  // Sort participants by score descending
  const sorted = [...participants].sort((a, b) => b.score - a.score);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  useEffect(() => {
    soundFx.playVictory();
    fireConfetti();
  }, []);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-between max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Top Banner */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-kahoot-yellow/20 border border-kahoot-yellow/40 text-kahoot-yellow text-xs font-bold mb-3 animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Hasil Akhir QCPP Quiz!</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-['Fredoka',sans-serif] text-white tracking-tight">
          PODIUM PEMENANG 🎉
        </h2>
      </div>

      {/* Podium Display (2nd, 1st, 3rd) */}
      <div className="w-full flex items-end justify-center space-x-3 sm:space-x-6 my-auto pt-10">
        {/* 2nd Place */}
        {second ? (
          <div className="flex flex-col items-center animate-bounce-short">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-300 border-4 border-slate-100 text-3xl flex items-center justify-center shadow-xl mb-2">
              {second.avatar || '🥈'}
            </div>
            <span className="text-xs sm:text-sm font-bold text-white max-w-[90px] truncate text-center">
              {second.participant_name}
            </span>
            <span className="text-xs font-mono font-black text-amber-300 mb-2">
              {second.score} pts
            </span>
            <div className="w-24 sm:w-32 h-36 sm:h-44 bg-gradient-to-t from-slate-700 to-slate-500 rounded-t-3xl flex flex-col items-center justify-center text-white font-extrabold shadow-2xl border-t-2 border-slate-300">
              <Medal className="w-8 h-8 text-slate-300 mb-1" />
              <span className="text-3xl">2nd</span>
            </div>
          </div>
        ) : (
          <div className="w-24 sm:w-32 h-36 bg-white/5 rounded-t-3xl" />
        )}

        {/* 1st Place */}
        {first ? (
          <div className="flex flex-col items-center animate-bounce-short z-10">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-kahoot-yellow border-4 border-yellow-200 text-4xl sm:text-5xl flex items-center justify-center shadow-2xl mb-2 ring-4 ring-yellow-400/50">
              {first.avatar || '👑'}
            </div>
            <span className="text-sm sm:text-base font-extrabold text-kahoot-yellow max-w-[110px] truncate text-center">
              {first.participant_name}
            </span>
            <span className="text-sm font-mono font-black text-white mb-2">
              {first.score} pts
            </span>
            <div className="w-28 sm:w-36 h-48 sm:h-60 bg-gradient-to-t from-yellow-600 via-amber-500 to-yellow-400 rounded-t-3xl flex flex-col items-center justify-center text-black font-black shadow-2xl border-t-4 border-yellow-200">
              <Trophy className="w-12 h-12 text-black mb-1 animate-bounce" />
              <span className="text-4xl">1st</span>
            </div>
          </div>
        ) : null}

        {/* 3rd Place */}
        {third ? (
          <div className="flex flex-col items-center animate-bounce-short">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-700 border-4 border-amber-500 text-3xl flex items-center justify-center shadow-xl mb-2">
              {third.avatar || '🥉'}
            </div>
            <span className="text-xs sm:text-sm font-bold text-white max-w-[90px] truncate text-center">
              {third.participant_name}
            </span>
            <span className="text-xs font-mono font-black text-amber-300 mb-2">
              {third.score} pts
            </span>
            <div className="w-24 sm:w-32 h-28 sm:h-36 bg-gradient-to-t from-amber-900 to-amber-700 rounded-t-3xl flex flex-col items-center justify-center text-white font-extrabold shadow-2xl border-t-2 border-amber-500">
              <Award className="w-8 h-8 text-amber-400 mb-1" />
              <span className="text-3xl">3rd</span>
            </div>
          </div>
        ) : (
          <div className="w-24 sm:w-32 h-28 bg-white/5 rounded-t-3xl" />
        )}
      </div>

      {/* Remaining Participants Rank Table */}
      {sorted.length > 3 && (
        <div className="w-full bg-black/20 p-4 rounded-2xl border border-white/10">
          <h4 className="text-xs font-bold text-purple-200 uppercase mb-3">Peringkat Lainnya</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {sorted.slice(3).map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-xl text-xs font-semibold"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold text-purple-300">#{idx + 4}</span>
                  <span>{p.avatar || '🚀'}</span>
                  <span className="text-white">{p.participant_name}</span>
                </div>
                <span className="font-mono font-bold text-kahoot-yellow">{p.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Restart Game Button */}
      <button
        onClick={() => {
          soundFx.playClick();
          onPlayAgain();
        }}
        className="px-8 py-4 bg-gradient-to-r from-kahoot-red to-rose-600 hover:from-rose-500 hover:to-kahoot-red text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-kahoot-red/40 flex items-center space-x-2 transform hover:scale-105 transition-all"
      >
        <RotateCcw className="w-5 h-5" />
        <span>Mainkan Quiz Lagi</span>
      </button>
    </div>
  );
};

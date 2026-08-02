import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Flame, Trophy, Award } from 'lucide-react';
import { soundFx } from '../../lib/audio';

interface PlayerResultProps {
  isCorrect: boolean;
  pointsEarned: number;
  totalScore: number;
  streak: number;
  correctAnswerText: string;
}

export const PlayerResult: React.FC<PlayerResultProps> = ({
  isCorrect,
  pointsEarned,
  totalScore,
  streak,
  correctAnswerText,
}) => {
  useEffect(() => {
    if (isCorrect) {
      soundFx.playCorrect();
    } else {
      soundFx.playWrong();
    }
  }, [isCorrect]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md border rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden transition-all ${
          isCorrect
            ? 'bg-emerald-950/80 border-emerald-500/50'
            : 'bg-rose-950/80 border-rose-500/50'
        }`}
      >
        {/* Banner Icon */}
        <div
          className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center shadow-2xl mb-5 border-2 ${
            isCorrect
              ? 'bg-emerald-500 text-white border-emerald-300 animate-bounce-short'
              : 'bg-rose-500 text-white border-rose-300'
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="w-16 h-16 stroke-[2.5]" />
          ) : (
            <XCircle className="w-16 h-16 stroke-[2.5]" />
          )}
        </div>

        {/* Feedback Title */}
        <h2 className="text-3xl font-black font-['Fredoka',sans-serif] text-white">
          {isCorrect ? 'BENAR! 🎉' : 'KURANG TEPAT 😅'}
        </h2>

        {/* Points Display */}
        <div className="my-5 py-3 px-4 bg-black/30 rounded-2xl border border-white/10 inline-block">
          <p className="text-xs text-purple-200 uppercase font-bold">Poin Yang Diperoleh</p>
          <p className={`text-4xl font-black font-mono mt-1 ${isCorrect ? 'text-kahoot-yellow' : 'text-slate-400'}`}>
            +{pointsEarned}
          </p>
        </div>

        {!isCorrect && (
          <div className="mb-5 p-3 rounded-2xl bg-black/40 border border-white/10 text-xs">
            <span className="text-purple-300 block mb-0.5 font-bold">Jawaban Yang Benar:</span>
            <span className="text-emerald-300 font-extrabold text-sm">{correctAnswerText}</span>
          </div>
        )}

        {/* Stats Grid: Total Score & Streak */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
            <div className="flex items-center justify-center space-x-1 text-kahoot-yellow mb-1">
              <Trophy className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase">Total Poin</span>
            </div>
            <span className="text-xl font-black text-white font-mono">{totalScore}</span>
          </div>

          <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center">
            <div className="flex items-center justify-center space-x-1 text-amber-400 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase">Streak</span>
            </div>
            <span className="text-xl font-black text-white font-mono">{streak}x</span>
          </div>
        </div>

        <p className="text-xs text-purple-200 mt-6 animate-pulse">
          Menunggu Host melanjutkan ke soal berikutnya...
        </p>
      </div>
    </div>
  );
};

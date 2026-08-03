import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, Clock, Award } from 'lucide-react';
import { Question, PlayerAnswer } from '../../types/quiz';
import { soundFx } from '../../lib/audio';

interface HostQuestionProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  answers: PlayerAnswer[];
  totalPlayers: number;
  onNextStep: () => void;
  onSkipTimer?: () => void;
}

const BUTTON_CONFIGS = [
  { shape: '▲', bg: 'bg-kahoot-red border-red-500' },
  { shape: '◆', bg: 'bg-kahoot-blue border-blue-500' },
  { shape: '●', bg: 'bg-kahoot-yellow text-black border-amber-500' },
  { shape: '■', bg: 'bg-kahoot-green border-emerald-500' },
];

export const HostQuestion: React.FC<HostQuestionProps> = ({
  question,
  questionIndex,
  totalQuestions,
  answers = [],
  totalPlayers = 0,
  onNextStep,
  onSkipTimer,
}) => {
  const timeLimit = question?.time_limit || 30;
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);
  const isLastQuestion = questionIndex >= totalQuestions - 1;

  // Reset timer ONLY when question changes
  useEffect(() => {
    setTimeLeft(question?.time_limit || 30);
  }, [questionIndex, question?.id]);

  // Clean 1-second countdown
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, questionIndex]);

  const isTimeUp = timeLeft <= 0;

  // Calculate answer counts for each option
  const counts = [0, 0, 0, 0];
  (answers || []).forEach((ans) => {
    if (ans.answer_index >= 0 && ans.answer_index < 4) {
      counts[ans.answer_index]++;
    }
  });

  const maxCount = Math.max(...counts, 1);

  return (
    <div className="min-h-[80vh] flex flex-col justify-between max-w-5xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Top Banner: Question Header & Timer */}
      <div className="bg-[#240a5e] border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl text-center">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold text-purple-200 mb-2">
          <span>Pertanyaan {questionIndex + 1} / {totalQuestions}</span>
          <span className="text-kahoot-yellow font-mono text-sm sm:text-base flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{isTimeUp ? '0s' : `${timeLeft}s`}</span>
          </span>
        </div>

        <h2 className="text-lg sm:text-3xl font-black font-['Fredoka',sans-serif] text-white my-2 sm:my-3 leading-snug">
          {question?.question_text}
        </h2>

        {/* Live Answered Ratio Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[11px] sm:text-xs font-bold text-purple-200">
          <span>Jawaban Terkumpul:</span>
          <span className="text-kahoot-yellow font-mono text-xs sm:text-sm">{answers.length} / {totalPlayers} Peserta</span>
        </div>
      </div>

      {/* Answer Distribution Chart & Option Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 flex-1">
        {(question?.options || []).map((optText, idx) => {
          const config = BUTTON_CONFIGS[idx % 4];
          const isCorrect = idx === question?.correct_option_index;
          const count = counts[idx];
          const barHeightPercent = Math.round((count / maxCount) * 100);

          return (
            <div
              key={idx}
              className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border-2 flex flex-col justify-between transition-all relative overflow-hidden ${
                config.bg
              } ${isTimeUp && isCorrect ? 'ring-4 ring-white shadow-2xl scale-[1.01]' : 'border-white/20'} opacity-95`}
            >
              {/* Option Top Header */}
              <div className="flex items-center justify-between z-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-black/20 flex items-center justify-center text-base sm:text-xl font-bold border border-white/20">
                  {config.shape}
                </div>
                {isTimeUp && isCorrect && (
                  <span className="px-2.5 py-0.5 sm:py-1 bg-white text-black font-black text-[10px] sm:text-xs rounded-full flex items-center space-x-1 shadow-md animate-bounce-short">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>BENAR</span>
                  </span>
                )}
              </div>

              {/* Option Text */}
              <p className="text-sm sm:text-lg font-bold text-white z-10 my-2 sm:my-3 leading-snug">
                {optText}
              </p>

              {/* Distribution Stats */}
              <div className="z-10 flex items-center justify-between pt-1.5 border-t border-white/20 text-[11px] sm:text-xs font-bold">
                <span>{count} Pemilih</span>
                <span>{totalPlayers > 0 ? Math.round((count / totalPlayers) * 100) : 0}%</span>
              </div>

              {/* Animated Live Fill Bar */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-black/25 transition-all duration-700 pointer-events-none"
                style={{ height: `${barHeightPercent}%` }}
              />
            </div>
          );
        })}
      </div>

      {/* Host Controls */}
      <div className="flex items-center justify-between bg-[#240a5e] border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl">
        {!isTimeUp ? (
          <button
            onClick={() => {
              soundFx.playClick();
              setTimeLeft(0);
              if (onSkipTimer) onSkipTimer();
            }}
            className="w-full py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white text-xs sm:text-sm font-bold rounded-xl border border-white/10 transition-colors active:scale-95"
          >
            Lewati Timer & Tampilkan Jawaban ({timeLeft}s) ⏭️
          </button>
        ) : (
          <button
            onClick={() => {
              soundFx.playClick();
              if (onNextStep) onNextStep();
            }}
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-kahoot-green to-emerald-600 hover:from-emerald-500 hover:to-kahoot-green text-white font-extrabold text-sm sm:text-base rounded-xl shadow-xl shadow-kahoot-green/30 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            {isLastQuestion ? (
              <>
                <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Lihat Hasil Akhir (Podium) 🏆</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span>Lanjut Ke Pertanyaan Berikutnya →</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

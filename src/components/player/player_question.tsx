import React, { useState, useEffect } from 'react';
import { Question } from '../../types/quiz';
import { soundFx } from '../../lib/audio';
import { Clock, CheckCircle2, XCircle, Hourglass, Award } from 'lucide-react';

interface PlayerQuestionProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  questionStartedAt?: number;
  forceTimeUp?: boolean;
  onSubmitAnswer: (answerIndex: number, timeTaken: number) => void;
  selectedAnswerIndex: number | null;
}

const BUTTON_CONFIGS = [
  {
    color: 'bg-kahoot-red hover:bg-kahoot-redHover text-white shadow-kahoot-red/40',
    shape: '▲',
    label: 'Red Triangle',
  },
  {
    color: 'bg-kahoot-blue hover:bg-kahoot-blueHover text-white shadow-kahoot-blue/40',
    shape: '◆',
    label: 'Blue Diamond',
  },
  {
    color: 'bg-kahoot-yellow hover:bg-kahoot-yellowHover text-black shadow-kahoot-yellow/40',
    shape: '●',
    label: 'Yellow Circle',
  },
  {
    color: 'bg-kahoot-green hover:bg-kahoot-greenHover text-white shadow-kahoot-green/40',
    shape: '■',
    label: 'Green Square',
  },
];

export const PlayerQuestion: React.FC<PlayerQuestionProps> = ({
  question,
  questionIndex,
  totalQuestions,
  questionStartedAt,
  forceTimeUp = false,
  onSubmitAnswer,
  selectedAnswerIndex,
}) => {
  const timeLimit = question?.time_limit || 30;
  const [localSelectedIdx, setLocalSelectedIdx] = useState<number | null>(selectedAnswerIndex);

  // Store exact question mount timestamp
  const mountTimeRef = React.useRef<number>(Date.now());

  // Reset mount time & selected answer when question changes
  useEffect(() => {
    mountTimeRef.current = Date.now();
    setLocalSelectedIdx(null);
  }, [questionIndex, question?.id]);

  const calculateTimeLeft = () => {
    if (forceTimeUp) return 0;

    let start = questionStartedAt || mountTimeRef.current;
    const elapsedFromStart = (Date.now() - start) / 1000;

    // If questionStartedAt is invalid/stale (> timeLimit or in the future), use exact mount time
    if (elapsedFromStart < 0 || elapsedFromStart >= timeLimit) {
      start = mountTimeRef.current;
    }

    const elapsed = Math.floor((Date.now() - start) / 1000);
    const remaining = timeLimit - elapsed;
    return Math.max(0, remaining);
  };

  const [timeLeft, setTimeLeft] = useState<number>(calculateTimeLeft);

  // Sync selected answer index without touching timer
  useEffect(() => {
    setLocalSelectedIdx(selectedAnswerIndex);
  }, [selectedAnswerIndex]);

  // Real-time synced timer resilient against tab switching & reload
  useEffect(() => {
    const syncTimer = () => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 5 && remaining > 0) {
        soundFx.playTick();
      }
    };

    syncTimer();
    const interval = setInterval(syncTimer, 250);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [questionIndex, question?.id, questionStartedAt, timeLimit, forceTimeUp]);

  const handleSelectOption = (index: number) => {
    if (timeLeft <= 0 || forceTimeUp) return;
    soundFx.playClick();
    setLocalSelectedIdx(index);
    const timeTaken = (Date.now() - startTime) / 1000;
    onSubmitAnswer(index, timeTaken);
  };

  const isTimeUp = timeLeft <= 0 || forceTimeUp;
  const progressPercent = (timeLeft / timeLimit) * 100;

  const isCorrectAnswer = localSelectedIdx !== null && localSelectedIdx === question?.correct_option_index;
  const isWrongAnswer = localSelectedIdx !== null && localSelectedIdx !== question?.correct_option_index;
  const correctOptionText = question?.options[question?.correct_option_index] || '';

  return (
    <div className="min-h-[80vh] flex flex-col justify-between max-w-4xl mx-auto p-3 sm:p-6 space-y-4">
      {/* Top Question Header & Timer Bar */}
      <div className="bg-[#240a5e] border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl text-center">
        <div className="flex items-center justify-between text-xs font-bold text-purple-200 mb-2">
          <span>Pertanyaan {questionIndex + 1} dari {totalQuestions}</span>
          <span className="flex items-center space-x-1 font-mono text-kahoot-yellow text-sm sm:text-base">
            <Clock className="w-3.5 h-3.5" />
            <span>{isTimeUp ? '0s' : `${timeLeft}s`}</span>
          </span>
        </div>

        {/* Timer Bar Progress */}
        <div className="w-full bg-black/40 h-2.5 sm:h-3 rounded-full overflow-hidden p-0.5 border border-white/10 mb-3">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              isTimeUp ? 'bg-rose-600' : timeLeft <= 5 ? 'bg-rose-500 animate-pulse' : 'bg-gradient-to-r from-kahoot-yellow via-amber-400 to-emerald-400'
            }`}
            style={{ width: isTimeUp ? '0%' : `${progressPercent}%` }}
          />
        </div>

        <h2 className="text-lg sm:text-2xl font-extrabold font-['Fredoka',sans-serif] text-white leading-snug">
          {question?.question_text}
        </h2>
      </div>

      {/* Answer Buttons Grid with Full Feedback on Time Up */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 my-auto">
        {(question?.options || []).map((optionText, idx) => {
          const config = BUTTON_CONFIGS[idx % BUTTON_CONFIGS.length];
          const isSelected = localSelectedIdx === idx;
          const isCorrectOption = idx === question?.correct_option_index;

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={isTimeUp}
              className={`relative min-h-[85px] sm:min-h-[110px] p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex items-center space-x-3 sm:space-x-4 text-left transition-all transform ${
                isTimeUp
                  ? isCorrectOption
                    ? 'bg-emerald-600 text-white border-2 border-white ring-4 ring-emerald-300 shadow-2xl scale-[1.02] cursor-not-allowed font-extrabold'
                    : isSelected
                    ? 'bg-rose-600 text-white border-2 border-white ring-4 ring-rose-400 cursor-not-allowed font-bold opacity-90'
                    : 'bg-white/10 text-purple-300/40 border border-white/10 cursor-not-allowed opacity-30'
                  : isSelected
                  ? `${config.color} ring-4 ring-white border-2 border-kahoot-yellow scale-[1.02] shadow-2xl brightness-110`
                  : `${config.color} opacity-90 hover:opacity-100 active:scale-95`
              }`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-black/20 flex items-center justify-center text-xl sm:text-2xl font-black shrink-0 border border-white/20">
                {config.shape}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm sm:text-xl font-bold leading-snug break-words block">
                  {optionText}
                </span>
                {isTimeUp ? (
                  isCorrectOption ? (
                    <span className="inline-flex items-center space-x-1 text-[10px] sm:text-xs font-black text-emerald-200 mt-1 bg-black/40 px-2 py-0.5 rounded-full border border-emerald-300/50 animate-bounce-short">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>JAWABAN BENAR 🏆</span>
                    </span>
                  ) : isSelected ? (
                    <span className="inline-flex items-center space-x-1 text-[10px] sm:text-xs font-black text-rose-200 mt-1 bg-black/40 px-2 py-0.5 rounded-full border border-rose-300/50">
                      <XCircle className="w-3.5 h-3.5 text-rose-300" />
                      <span>PILIHAN KAMU (SALAH)</span>
                    </span>
                  ) : null
                ) : isSelected ? (
                  <span className="inline-flex items-center space-x-1 text-[10px] sm:text-xs font-black text-amber-300 mt-1 bg-black/30 px-2 py-0.5 rounded-full border border-amber-400/40">
                    <CheckCircle2 className="w-3 h-3 text-amber-300" />
                    <span>Jawaban Dipilih (Dapat diubah)</span>
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Answer Feedback Banner */}
      <div className="bg-[#240a5e] border border-white/20 rounded-xl p-3.5 text-center text-xs font-semibold text-purple-200 shadow-xl">
        {isTimeUp ? (
          isCorrectAnswer ? (
            <div className="flex items-center justify-center space-x-2 text-emerald-300 font-extrabold text-sm sm:text-base">
              <Award className="w-5 h-5 text-emerald-400 animate-bounce" />
              <span>🎉 HEBAT! JAWABAN KAMU BENAR! (+1000 POIN)</span>
            </div>
          ) : isWrongAnswer ? (
            <div className="flex flex-col items-center space-y-1 text-rose-300 font-bold text-xs sm:text-sm">
              <span className="flex items-center space-x-1 text-rose-400">
                <XCircle className="w-4 h-4" />
                <span>JAWABAN KAMU BELUM TEPAT</span>
              </span>
              <span className="text-purple-200 text-[11px] font-normal">
                Jawaban yang benar adalah: <strong className="text-emerald-300">{correctOptionText}</strong>
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-1 text-amber-300 font-bold text-xs sm:text-sm">
              <span className="flex items-center space-x-1 text-amber-400">
                <Hourglass className="w-4 h-4" />
                <span>WAKTU HABIS! KAMU BELUM MEMILIH JAWABAN</span>
              </span>
              <span className="text-purple-200 text-[11px] font-normal">
                Jawaban yang benar adalah: <strong className="text-emerald-300">{correctOptionText}</strong>
              </span>
            </div>
          )
        ) : localSelectedIdx !== null ? (
          <span className="text-emerald-300 flex items-center justify-center space-x-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Jawaban Anda tersimpan! Pilihan dapat diubah hingga waktu habis.</span>
          </span>
        ) : (
          <span>Pilih salah satu jawaban di atas sebelum waktu ({timeLeft}s) habis!</span>
        )}
      </div>
    </div>
  );
};

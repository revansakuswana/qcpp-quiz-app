import React, { useState, useEffect } from 'react';
import { Question } from '../../types/quiz';
import { soundFx } from '../../lib/audio';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

interface PlayerQuestionProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onSubmitAnswer: (answerIndex: number, timeTaken: number) => void;
  hasAnswered: boolean;
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
  onSubmitAnswer,
  hasAnswered,
  selectedAnswerIndex,
}) => {
  const timeLimit = question.time_limit || 20;
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);
  const [startTime] = useState<number>(Date.now());

  useEffect(() => {
    setTimeLeft(timeLimit);
  }, [question, timeLimit]);

  useEffect(() => {
    if (hasAnswered || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        if (prev <= 5) {
          soundFx.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasAnswered, timeLeft]);

  const handleSelectOption = (index: number) => {
    if (hasAnswered || timeLeft <= 0) return;
    soundFx.playClick();
    const timeTaken = (Date.now() - startTime) / 1000;
    onSubmitAnswer(index, timeTaken);
  };

  const progressPercent = (timeLeft / timeLimit) * 100;

  return (
    <div className="min-h-[85vh] flex flex-col justify-between max-w-4xl mx-auto p-4 sm:p-6">
      {/* Top Question Header & Timer Bar */}
      <div className="bg-[#240a5e] border border-white/20 rounded-3xl p-5 shadow-2xl text-center mb-6">
        <div className="flex items-center justify-between text-xs font-bold text-purple-200 mb-2">
          <span>Pertanyaan {questionIndex + 1} dari {totalQuestions}</span>
          <span className="flex items-center space-x-1 font-mono text-kahoot-yellow">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </span>
        </div>

        {/* Timer Bar Progress */}
        <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden p-0.5 border border-white/10 mb-4">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              timeLeft <= 5 ? 'bg-rose-500 animate-pulse' : 'bg-gradient-to-r from-kahoot-yellow via-amber-400 to-emerald-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold font-['Fredoka',sans-serif] text-white leading-tight">
          {question.question_text}
        </h2>
      </div>

      {/* Answer Buttons Grid (Kahoot Shapes & Colors) */}
      {!hasAnswered ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-auto">
          {question.options.map((optionText, idx) => {
            const config = BUTTON_CONFIGS[idx % BUTTON_CONFIGS.length];
            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={hasAnswered || timeLeft <= 0}
                className={`relative min-h-[110px] p-5 rounded-3xl flex items-center space-x-4 text-left transition-all transform hover:-translate-y-1 active:translate-y-0 shadow-2xl ${config.color}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-black/20 flex items-center justify-center text-2xl font-black shrink-0 border border-white/20">
                  {config.shape}
                </div>
                <span className="text-lg sm:text-xl font-bold leading-snug break-words">
                  {optionText}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Waiting / Answer Submitted State */
        <div className="bg-[#240a5e] border border-white/20 rounded-3xl p-8 text-center my-auto shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-kahoot-purple flex items-center justify-center text-4xl shadow-xl mb-4 border border-white/20 animate-bounce">
            {selectedAnswerIndex !== null ? BUTTON_CONFIGS[selectedAnswerIndex % 4].shape : '⏳'}
          </div>
          <h3 className="text-2xl font-black text-white font-['Fredoka',sans-serif]">
            Jawaban Terkirim!
          </h3>
          <p className="text-sm text-purple-200 mt-2 max-w-xs mx-auto">
            Menunggu peserta lain menjawab dan Host melanjutkan ke hasil...
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div className="text-center mt-6 text-xs text-purple-300">
        <span>Tekan tombol warna yang menurut Anda benar secepat mungkin untuk bonus poin!</span>
      </div>
    </div>
  );
};

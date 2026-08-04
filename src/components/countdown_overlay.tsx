import React, { useState, useEffect } from 'react';
import { soundFx } from '../lib/audio';
import confetti from 'canvas-confetti';

interface CountdownOverlayProps {
  onComplete: () => void;
  title?: string;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  onComplete,
  title = 'Persiapkan Diri!',
}) => {
  const [count, setCount] = useState<number>(3);
  const [isGo, setIsGo] = useState<boolean>(false);

  useEffect(() => {
    // Play initial sound beep for "3"
    soundFx.playCountdownBeep(3);

    const interval = setInterval(() => {
      setCount((prev) => {
        const next = prev - 1;
        if (next >= 1) {
          soundFx.playCountdownBeep(next);
          return next;
        } else if (next === 0) {
          setIsGo(true);
          soundFx.playCountdownBeep(0);
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
            });
          } catch {
            // Ignore confetti error if unavailable
          }
          return 0;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600);
          return 0;
        }
      });
    }, 900);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Color theme mapping for 3, 2, 1, GO!
  const getTheme = () => {
    if (isGo) {
      return {
        bg: 'from-emerald-500 to-teal-600',
        border: 'border-emerald-300',
        shadow: 'shadow-emerald-500/50',
        text: 'GO! 🔥',
        subtitle: 'Quiz Dimulai!',
      };
    }
    switch (count) {
      case 3:
        return {
          bg: 'from-rose-500 to-red-600',
          border: 'border-rose-300',
          shadow: 'shadow-rose-500/50',
          text: '3',
          subtitle: 'Bersiap...',
        };
      case 2:
        return {
          bg: 'from-amber-400 to-yellow-500',
          border: 'border-amber-300',
          shadow: 'shadow-amber-500/50',
          text: '2',
          subtitle: 'Konsentrasi!',
        };
      case 1:
        return {
          bg: 'from-cyan-400 to-blue-600',
          border: 'border-cyan-300',
          shadow: 'shadow-cyan-500/50',
          text: '1',
          subtitle: 'Mulai!',
        };
      default:
        return {
          bg: 'from-purple-500 to-indigo-600',
          border: 'border-purple-300',
          shadow: 'shadow-purple-500/50',
          text: '3',
          subtitle: 'Bersiap...',
        };
    }
  };

  const currentTheme = getTheme();

  return (
    <div className="fixed inset-0 z-50 bg-[#0b021a]/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-150">
      {/* Title */}
      <div className="text-center mb-8 animate-bounce-short">
        <span className="text-xs sm:text-sm font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-purple-200 border border-white/20">
          {title}
        </span>
        <h2 className="text-xl sm:text-3xl font-black font-['Fredoka',sans-serif] text-white mt-2">
          Quiz Segera Dimulai!
        </h2>
      </div>

      {/* Countdown Big Animated Circle */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing Ring Glow */}
        <div
          className={`absolute w-52 h-52 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr ${currentTheme.bg} opacity-40 blur-2xl animate-ping`}
          style={{ animationDuration: '0.9s' }}
        />

        {/* Counter Badge Circle */}
        <div
          key={isGo ? 'go' : count}
          className={`w-44 h-44 sm:w-60 sm:h-60 rounded-full bg-gradient-to-tr ${currentTheme.bg} border-4 ${currentTheme.border} ${currentTheme.shadow} shadow-2xl flex flex-col items-center justify-center text-white transform transition-all duration-300 animate-in zoom-in-75 relative z-10`}
        >
          <span className="text-5xl sm:text-8xl font-black font-mono tracking-tighter drop-shadow-lg">
            {currentTheme.text}
          </span>
          <span className="text-xs sm:text-base font-extrabold uppercase tracking-wider mt-1 text-white/90">
            {currentTheme.subtitle}
          </span>
        </div>
      </div>
    </div>
  );
};

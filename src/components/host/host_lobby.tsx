import React, { useState } from 'react';
import { Play, Copy, Check, Users, Radio } from 'lucide-react';
import { Quiz, SessionParticipant } from '../../types/quiz';
import { soundFx } from '../../lib/audio';

interface HostLobbyProps {
  pin: string;
  quiz: Quiz;
  participants: SessionParticipant[];
  onStartGame: () => void;
}

export const HostLobby: React.FC<HostLobbyProps> = ({
  pin,
  quiz,
  participants,
  onStartGame,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyPin = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(pin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-between max-w-5xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Top Banner: Game PIN Display */}
      <div className="w-full bg-[#240a5e] border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center shadow-xl relative overflow-hidden">
        <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-kahoot-purple border border-purple-400/40 text-purple-200 text-[10px] sm:text-xs font-bold mb-2">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Host Lobby Room Live</span>
        </div>

        <h2 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-purple-200">
          Masuk ke room dengan Game PIN:
        </h2>

        {/* PIN Big Card */}
        <div className="my-2 sm:my-3 inline-flex items-center justify-center space-x-2 sm:space-x-3 bg-black/40 px-4 sm:px-8 py-2 sm:py-3 rounded-2xl border border-kahoot-yellow/40 shadow-inner">
          <span className="text-3xl sm:text-6xl font-black font-mono tracking-wider sm:tracking-widest text-kahoot-yellow drop-shadow-md">
            {pin}
          </span>
          <button
            onClick={handleCopyPin}
            className="p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors border border-white/10 active:scale-95"
            title="Salin Game PIN"
          >
            {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-purple-200" />}
          </button>
        </div>

        <p className="text-[11px] sm:text-xs text-purple-200 truncate">
          Judul Quiz: <strong className="text-white font-['Fredoka',sans-serif]">{quiz.title}</strong> ({quiz.questions.length} Soal)
        </p>
      </div>

      {/* Middle: Joined Players Grid */}
      <div className="w-full flex-1 bg-[#240a5e] border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <h3 className="text-sm sm:text-lg font-extrabold text-white flex items-center space-x-2 font-['Fredoka',sans-serif]">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-kahoot-yellow" />
              <span>Peserta Masuk ({participants.length})</span>
            </h3>
            <span className="text-[10px] sm:text-xs text-purple-200">
              {participants.length === 0 ? 'Menunggu peserta...' : 'Siap dimulai!'}
            </span>
          </div>

          {/* Players Chips Grid */}
          {participants.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-56 overflow-y-auto p-1 scrollbar-thin">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/15 animate-in zoom-in-95 duration-200"
                >
                  <span className="text-base shrink-0">{p.avatar || '🚀'}</span>
                  <span className="text-xs font-bold text-white truncate">{p.participant_name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-purple-300 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 flex items-center justify-center text-2xl">
                🎮
              </div>
              <p className="text-xs">Belum ada peserta yang bergabung.</p>
              <p className="text-[10px] text-purple-400">
                Minta peserta buka "Peserta Quiz" dan masukkan PIN <strong className="text-kahoot-yellow font-mono">{pin}</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Start Game Button */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <button
            onClick={() => {
              soundFx.playClick();
              onStartGame();
            }}
            disabled={participants.length === 0}
            className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-extrabold text-sm sm:text-lg shadow-xl flex items-center justify-center space-x-2 transition-all ${
              participants.length > 0
                ? 'bg-gradient-to-r from-kahoot-green to-emerald-600 hover:from-emerald-500 hover:to-kahoot-green text-white shadow-kahoot-green/40 active:scale-95'
                : 'bg-white/10 text-slate-400 border border-white/10 cursor-not-allowed'
            }`}
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            <span>Mulai Quiz Sekarang ({participants.length} Peserta)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Loader2, Users, Radio, Sparkles } from 'lucide-react';
import { SessionParticipant } from '../../types/quiz';

interface PlayerWaitingProps {
  pin: string;
  participantName: string;
  avatar: string;
  participants: SessionParticipant[];
}

export const PlayerWaiting: React.FC<PlayerWaitingProps> = ({
  pin,
  participantName,
  avatar,
  participants,
}) => {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#240a5e] border border-white/20 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Top Status Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold mb-6 animate-pulse">
          <Radio className="w-3.5 h-3.5" />
          <span>Terhubung ke Room PIN: {pin}</span>
        </div>

        {/* Player Avatar */}
        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-kahoot-purple via-purple-600 to-kahoot-blue flex items-center justify-center text-5xl shadow-2xl border-2 border-white/30 mb-4 animate-bounce-short">
          {avatar}
        </div>

        <h2 className="text-2xl font-black font-['Fredoka',sans-serif] text-white">
          Selamat Datang, <span className="text-kahoot-yellow">{participantName}</span>!
        </h2>

        <p className="text-sm text-purple-200 mt-2 max-w-xs mx-auto">
          Anda sudah masuk ke room quiz. Bersiaplah! Host akan segera memulai permainan.
        </p>

        {/* Loading Spinner Indicator */}
        <div className="my-8 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-8 h-8 text-kahoot-yellow animate-spin" />
          <span className="text-xs font-semibold text-purple-300">Menunggu Host memulai quiz...</span>
        </div>

        {/* Participants count & list */}
        <div className="bg-black/20 p-4 rounded-2xl border border-white/10 text-left">
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-purple-200 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-kahoot-yellow" />
              <span>Peserta di Room Ini ({participants.length})</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Sync</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto">
            {participants.map((p) => (
              <div
                key={p.id}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                  p.participant_name === participantName
                    ? 'bg-kahoot-yellow text-black border-yellow-300 font-bold'
                    : 'bg-white/10 text-white border-white/10'
                }`}
              >
                <span>{p.avatar || '🚀'}</span>
                <span>{p.participant_name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

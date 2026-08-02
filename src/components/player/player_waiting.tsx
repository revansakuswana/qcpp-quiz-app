import React, { useState, useEffect } from 'react';
import { Loader2, Users, Radio } from 'lucide-react';
import { SessionParticipant } from '../../types/quiz';
import { fetchSessionParticipants } from '../../lib/supabase';

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
  const [liveList, setLiveList] = useState<SessionParticipant[]>(participants || []);

  // Update liveList when prop changes
  useEffect(() => {
    if (participants && participants.length > 0) {
      setLiveList(participants);
    }
  }, [participants]);

  // 1.5-Second Live Polling for Room Participants on Player Waiting Screen
  useEffect(() => {
    let isMounted = true;
    async function updateRoomParticipants() {
      if (!pin) return;
      const updated = await fetchSessionParticipants(undefined, pin);
      if (isMounted && updated && updated.length > 0) {
        setLiveList(updated);
      }
    }

    updateRoomParticipants();
    const interval = setInterval(updateRoomParticipants, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [pin]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-[#240a5e] border border-white/20 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Top Status Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold mb-4 sm:mb-6 animate-pulse">
          <Radio className="w-3.5 h-3.5" />
          <span>Terhubung ke Room PIN: {pin}</span>
        </div>

        {/* Player Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-kahoot-purple via-purple-600 to-kahoot-blue flex items-center justify-center text-4xl sm:text-5xl shadow-2xl border-2 border-white/30 mb-3 sm:mb-4 animate-bounce-short">
          {avatar}
        </div>

        <h2 className="text-xl sm:text-2xl font-black font-['Fredoka',sans-serif] text-white">
          Selamat Datang, <span className="text-kahoot-yellow">{participantName}</span>!
        </h2>

        <p className="text-xs sm:text-sm text-purple-200 mt-1.5 max-w-xs mx-auto">
          Anda sudah masuk ke room quiz. Bersiaplah! Host akan segera memulai permainan.
        </p>

        {/* Loading Spinner Indicator */}
        <div className="my-6 sm:my-8 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 text-kahoot-yellow animate-spin" />
          <span className="text-xs font-semibold text-purple-300">Menunggu Host memulai quiz...</span>
        </div>

        {/* Participants count & list */}
        <div className="bg-black/20 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 text-left">
          <div className="flex items-center justify-between mb-2.5 border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-purple-200 flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-kahoot-yellow" />
              <span>Peserta di Room Ini ({liveList.length})</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Sync</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-36 overflow-y-auto scrollbar-thin">
            {liveList.map((p) => (
              <div
                key={p.id}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg sm:rounded-xl text-xs font-semibold border ${
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

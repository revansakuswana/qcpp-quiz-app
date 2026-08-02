import React, { useState } from 'react';
import { ArrowRight, Sparkles, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { DropdownParticipant } from '../dropdown_participant';
import { joinGameSession, verifyGameSessionPin } from '../../lib/supabase';
import { soundFx } from '../../lib/audio';

interface PlayerJoinProps {
  onJoined: (pin: string, participantName: string, avatar: string) => void;
  onSwitchToHost: () => void;
}

const AVATARS = ['🦊', '🦄', '🐯', '🐼', '🦁', '🐱', '🐉', '🦉', '🚀', '🤖', '👾', '👑'];

export const PlayerJoin: React.FC<PlayerJoinProps> = ({ onJoined, onSwitchToHost }) => {
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Enter PIN, Step 2: Select Name & Avatar
  const [pin, setPin] = useState<string>('');
  const [participantName, setParticipantName] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🦊');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSelectParticipant = (name: string, avatar: string) => {
    setParticipantName(name);
    setSelectedAvatar(avatar);
  };

  // Step 1: Strictly Validate PIN against database
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPin = pin.trim();
    if (!cleanPin || cleanPin.length < 4) {
      setErrorMsg('Masukkan 6-digit Game PIN Room quiz terlebih dahulu!');
      soundFx.playWrong();
      return;
    }

    setIsVerifyingPin(true);
    soundFx.playClick();

    // Strictly check if game session exists in database
    const validSession = await verifyGameSessionPin(cleanPin);
    setIsVerifyingPin(false);

    if (!validSession) {
      soundFx.playWrong();
      setErrorMsg(`PIN Room "${cleanPin}" tidak ditemukan! Pastikan Host telah membuka room quiz.`);
      return;
    }

    // PIN is valid, proceed to Step 2
    soundFx.playCorrect();
    setStep(2);
  };

  // Step 2: Join Session with Selected Name & Avatar
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!participantName.trim()) {
      setErrorMsg('Pilih nama peserta dari dropdown terlebih dahulu!');
      soundFx.playWrong();
      return;
    }

    setIsSubmitting(true);
    soundFx.playClick();

    const result = await joinGameSession(pin.trim(), participantName, selectedAvatar);
    setIsSubmitting(false);

    if (!result) {
      soundFx.playWrong();
      setErrorMsg(`PIN Room "${pin}" tidak ditemukan atau room telah ditutup oleh Host!`);
      setStep(1);
      return;
    }

    onJoined(pin.trim(), participantName, selectedAvatar);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-[#240a5e] border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Background Accents */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-qcpp-red/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-qcpp-blue/30 rounded-full blur-2xl pointer-events-none" />

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-qcpp-red via-qcpp-purple to-qcpp-blue flex items-center justify-center shadow-xl mb-2 sm:mb-3">
            <span className="text-2xl sm:text-3xl">{step === 1 ? '🔑' : '👤'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-['Fredoka',sans-serif] text-white">
            {step === 1 ? 'Masuk QCPP Quiz' : 'Pilih Nama Peserta'}
          </h2>
          <p className="text-[11px] sm:text-xs text-purple-200 mt-1">
            {step === 1
              ? 'Masukkan 6-digit Game PIN room quiz dari Host.'
              : `Terhubung ke Room PIN #${pin}. Pilih nama Anda.`}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl sm:rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-100 text-xs font-semibold flex items-start space-x-2 animate-shake">
            <span className="text-sm shrink-0">⚠️</span>
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: INPUT GAME PIN ONLY */}
        {step === 1 && (
          <form onSubmit={handleVerifyPin} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-purple-200 mb-2 flex items-center justify-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-qcpp-yellow" />
                <span>GAME PIN ROOM</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Contoh: 123456"
                className="w-full text-center text-2xl sm:text-3xl font-black tracking-widest px-3 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl text-qcpp-yellow placeholder-purple-300/30 placeholder:text-base sm:placeholder:text-2xl focus:outline-none focus:ring-2 focus:ring-qcpp-yellow focus:bg-white/20 transition-all font-mono"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={isVerifyingPin || !pin.trim()}
              className={`w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-extrabold text-base sm:text-lg shadow-xl flex items-center justify-center space-x-2 transition-all ${
                pin.trim()
                  ? 'bg-gradient-to-r from-qcpp-red to-rose-600 hover:from-rose-500 hover:to-qcpp-red text-white shadow-qcpp-red/40 transform active:scale-95'
                  : 'bg-white/10 text-slate-400 border border-white/10 cursor-not-allowed'
              }`}
            >
              <span>{isVerifyingPin ? 'Verifikasi PIN...' : 'Masuk Room Quiz'}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </form>
        )}

        {/* STEP 2: SELECT PARTICIPANT NAME DROPDOWN & AVATAR */}
        {step === 2 && (
          <form onSubmit={handleJoin} className="space-y-4 sm:space-y-5">
            {/* PIN Badge Indicator & Back Button */}
            <div className="flex items-center justify-between px-3 py-2 bg-black/30 rounded-xl border border-white/10">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-white">Room: <strong className="font-mono text-qcpp-yellow">{pin}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  setStep(1);
                }}
                className="text-[11px] font-bold text-purple-300 hover:text-white underline flex items-center space-x-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Ubah PIN</span>
              </button>
            </div>

            {/* Dropdown Participant Selector (Loaded for this PIN) */}
            <div>
              <DropdownParticipant
                selectedName={participantName}
                onSelectParticipant={handleSelectParticipant}
                roomPin={pin}
              />
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-purple-200 mb-2 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-qcpp-yellow" />
                <span>Pilih Avatar Peserta</span>
              </label>
              <div className="grid grid-cols-6 gap-1.5 sm:gap-2 bg-black/20 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-white/10">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedAvatar(av);
                    }}
                    className={`h-8 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center text-base sm:text-lg transition-transform ${
                      selectedAvatar === av
                        ? 'bg-qcpp-yellow text-black scale-105 shadow-md font-bold ring-2 ring-white'
                        : 'bg-white/5 hover:bg-white/15 text-white'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-qcpp-green to-emerald-600 hover:from-emerald-500 hover:to-qcpp-green text-white font-extrabold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-xl shadow-qcpp-green/40 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>{isSubmitting ? 'Menghubungkan...' : 'Mulai Quiz 🚀'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

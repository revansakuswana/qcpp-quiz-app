import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, ArrowRight, Eye, EyeOff, X } from 'lucide-react';
import { soundFx } from '../../lib/audio';

interface HostAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Default Host PIN / Passcode (Can be configured or updated)
const DEFAULT_HOST_PIN = '2109';

export const HostAuthModal: React.FC<HostAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    soundFx.playClick();

    if (!pinInput.trim()) {
      setErrorMsg('Masukkan PIN Host untuk melanjutkan!');
      return;
    }

    setIsSubmitting(true);

    // Verify PIN against Host Passcode
    if (pinInput.trim() === DEFAULT_HOST_PIN) {
      soundFx.playVictory();
      setIsSubmitting(false);
      onSuccess();
      setPinInput('');
    } else {
      soundFx.playWrong();
      setIsSubmitting(false);
      setErrorMsg('PIN Host salah!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-[#2a096c] to-[#1a054a] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-kahoot-blue/30 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            soundFx.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-kahoot-blue to-purple-600 flex items-center justify-center shadow-xl mb-3 border border-white/20 animate-float">
            <Lock className="w-8 h-8 text-kahoot-yellow" />
          </div>
          <h3 className="text-2xl font-bold font-['Fredoka',sans-serif] text-white">
            Autentikasi Host
          </h3>
          <p className="text-xs text-purple-200 mt-1 max-w-xs">
            Halaman ini khusus untuk Game Master / Host Quiz. Masukkan PIN keamanan Host untuk melanjutkan.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-100 text-xs font-semibold flex items-center space-x-2 animate-shake">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-purple-200 mb-1.5 flex items-center space-x-1.5">
              <KeyRound className="w-4 h-4 text-kahoot-yellow" />
              <span>PIN / Passcode Host</span>
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={12}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Masukkan PIN Host"
                className="w-full text-center text-xl font-bold tracking-widest px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-kahoot-yellow placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-kahoot-yellow focus:bg-white/20 transition-all font-mono"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-purple-300 hover:text-white"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-kahoot-blue to-indigo-600 hover:from-indigo-500 hover:to-kahoot-blue text-white font-extrabold text-base rounded-2xl shadow-xl shadow-kahoot-blue/40 flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <span>Verifikasi & Masuk Host</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

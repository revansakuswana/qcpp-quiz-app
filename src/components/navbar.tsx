import React from 'react';
import { Volume2, VolumeX, Database, UserCheck, Gamepad2, PlusCircle, Lock, LogOut, ShieldCheck } from 'lucide-react';
import { soundFx } from '../lib/audio';
import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  activeMode: 'player' | 'host';
  onSelectMode: (mode: 'player' | 'host') => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  isHostAuthenticated: boolean;
  onHostLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeMode,
  onSelectMode,
  isAudioMuted,
  onToggleAudio,
  isHostAuthenticated,
  onHostLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#1a054a] border-b border-white/10 px-2.5 sm:px-4 py-2 sm:py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-between relative gap-2">
        {/* Left Side: Brand Logo (Desktop/Tablet) */}
        <div className="hidden sm:flex items-center space-x-2 cursor-pointer group shrink-0 sm:w-1/4">
          <div
            onClick={() => {
              soundFx.playClick();
              onSelectMode("player");
            }}
            className="flex items-center space-x-2">
            <h1 className="text-base sm:text-xl font-black tracking-tight font-['Fredoka',sans-serif] text-white flex items-center space-x-1">
              <span>QCPP</span>
            </h1>
          </div>
        </div>

        {/* Center Section: Always Perfectly Centered Mode Switcher Tabs */}
        <div className="flex items-center justify-center my-auto">
          <nav className="flex items-center space-x-1 bg-[#130330] p-1 rounded-xl shadow-md border-none">
            {/* Tab 1: Peserta Quiz */}
            <button
              onClick={() => {
                soundFx.playClick();
                onSelectMode("player");
              }}
              className={`flex items-center space-x-1.5 px-3.5 sm:px-5 py-1.5 rounded-lg text-xs sm:text-sm transition-all duration-150 border-none ${
                activeMode === "player"
                  ? "bg-[#e21b3c] text-white font-extrabold shadow-sm"
                  : "text-purple-200/70 hover:text-white hover:bg-white/10 font-bold"
              }`}>
              <Gamepad2 className="w-4 h-4 text-white" />
              <span>Peserta</span>
            </button>

            {/* Tab 2: Host */}
            <button
              onClick={() => {
                soundFx.playClick();
                onSelectMode("host");
              }}
              className={`flex items-center space-x-1.5 px-3.5 sm:px-5 py-1.5 rounded-lg text-xs sm:text-sm transition-all duration-150 Daftar Hasil & Rekap Quiz HostDaftar Hasil & Rekap Quiz Host-none ${
                activeMode === "host"
                  ? "bg-[#1368ce] text-white font-extrabold shadow-sm"
                  : "text-purple-200/70 hover:text-white hover:bg-white/10 font-bold"
              }`}>
              {isHostAuthenticated ? (
                <UserCheck className="w-4 h-4 text-white" />
              ) : (
                <Lock className="w-4 h-4 text-amber-300" />
              )}
              <span>Host</span>
            </button>
          </nav>
        </div>

        {/* Right Side: Tools & Badges */}
        <div className="flex items-center justify-end space-x-1.5 sm:space-x-3 shrink-0 sm:w-1/4">
          {/* Host Authentication Status Badge */}
          {isHostAuthenticated ? (
            <button
              onClick={() => {
                soundFx.playClick();
                onHostLogout();
              }}
              className="flex items-center space-x-1 p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-extrabold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-rose-500/20 hover:border-rose-400/40 hover:text-rose-300 transition-colors shadow-sm"
              title="Klik untuk Keluar / Lock Akses Host">
              <span className="hidden md:inline">Logout</span>
              <LogOut className="w-3 h-3 ml-0.5" />
            </button>
          ) : (
            <div className="hidden xs:flex items-center space-x-1 px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold bg-white/5 border border-white/10 text-purple-300">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>User</span>
            </div>
          )}

          {/* Supabase DB Status Badge - Only Visible When Host is Authenticated */}
          {isHostAuthenticated && (
            <div
              className="hidden lg:flex items-center space-x-1.5 p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[11px] font-semibold bg-white/5 border border-white/10 text-purple-200"
              title={
                isSupabaseConfigured
                  ? "Connected to Live Supabase DB"
                  : "Running in Offline / Mock DB Mode"
              }>
              <Database
                className={`w-4 h-4 ${isSupabaseConfigured ? "text-green-400" : "text-amber-400"}`}
              />
            </div>
          )}

          <button
            onClick={() => {
              onToggleAudio();
              soundFx.playClick();
            }}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 shadow-sm"
            title={
              isAudioMuted ? "Unmute Sound Effects" : "Mute Sound Effects"
            }>
            {isAudioMuted ? (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-300" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

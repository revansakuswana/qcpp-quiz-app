import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Search, Plus, UserCheck, Check, Lock, AlertCircle } from 'lucide-react';
import { Participant } from '../types/quiz';
import { fetchParticipantsList, addParticipantName, fetchSessionParticipants } from '../lib/supabase';
import { soundFx } from '../lib/audio';

interface DropdownParticipantProps {
  selectedName: string;
  onSelectParticipant: (name: string, avatar: string) => void;
  roomPin?: string;
  quizId?: string;
}

export const DropdownParticipant: React.FC<DropdownParticipantProps> = ({
  selectedName,
  onSelectParticipant,
  roomPin,
  quizId,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeNames, setActiveNames] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [lockWarningMsg, setLockWarningMsg] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load participants list & active room participants for lockout check
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const list = await fetchParticipantsList(quizId, roomPin);
      setParticipants(list);

      if (roomPin) {
        const roomParts = await fetchSessionParticipants(undefined, roomPin);
        if (roomParts && roomParts.length > 0) {
          const nameSet = new Set(roomParts.map((p) => p.participant_name.toLowerCase().trim()));
          setActiveNames(nameSet);

          // Find first unassigned participant if none selected
          if (!selectedName) {
            const firstAvailable = list.find((p) => !nameSet.has(p.name.toLowerCase().trim()));
            if (firstAvailable) {
              onSelectParticipant(firstAvailable.name, firstAvailable.avatar || '🚀');
            } else if (list.length > 0) {
              onSelectParticipant(list[0].name, list[0].avatar || '🚀');
            }
          }
        } else if (!selectedName && list.length > 0) {
          onSelectParticipant(list[0].name, list[0].avatar || '🚀');
        }
      } else if (!selectedName && list.length > 0) {
        onSelectParticipant(list[0].name, list[0].avatar || '🚀');
      }

      setLoading(false);
    }
    loadData();
  }, [quizId, roomPin]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Memoized filter for 60fps instant searching
  const filteredParticipants = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return participants;
    return participants.filter((p) => p.name.toLowerCase().includes(query));
  }, [participants, searchQuery]);

  const selectedItem = useMemo(() => {
    return participants.find((p) => p.name === selectedName);
  }, [participants, selectedName]);

  const handleSelect = (participant: Participant) => {
    const isAlreadyActive = activeNames.has(participant.name.toLowerCase().trim());
    if (isAlreadyActive) {
      soundFx.playWrong();
      setLockWarningMsg(`Nama "${participant.name}" sedang aktif digunakan oleh HP/perangkat lain di room ini! Silakan pilih nama Anda yang belum terpakai.`);
      return;
    }

    soundFx.playClick();
    setLockWarningMsg(null);
    onSelectParticipant(participant.name, participant.avatar || '🚀');
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleAddNewParticipant = async () => {
    if (!searchQuery.trim()) return;
    soundFx.playClick();
    setLockWarningMsg(null);
    const avatars = ['🚀', '🦊', '🦄', '🐯', '🐼', '🦁', '🐱', '🐉', '🦉'];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const created = await addParticipantName(searchQuery.trim(), randomAvatar, quizId);
    setParticipants((prev) => [created, ...prev]);
    onSelectParticipant(created.name, created.avatar);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative w-full text-left gpu-accelerated" ref={dropdownRef}>
      <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1.5 flex items-center justify-between">
        <span className="flex items-center space-x-1.5">
          <UserCheck className="w-4 h-4 text-qcpp-yellow" />
          <span>Pilih Nama Peserta</span>
        </span>
        <span className="text-[10px] text-purple-300 font-normal">
          {roomPin ? `Khusus Room #${roomPin}` : 'Daftar Peserta Quiz'}
        </span>
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          soundFx.playClick();
          setIsOpen(!isOpen);
        }}
        className={`w-full flex items-center justify-between px-4 py-3 bg-black/40 border border-white/20 rounded-2xl text-white shadow-inner hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-qcpp-yellow transition-all ${
          isOpen ? 'ring-2 ring-qcpp-yellow border-transparent bg-purple-900/60' : ''
        }`}
      >
        <div className="flex items-center space-x-3 truncate">
          <div className="w-8 h-8 rounded-full bg-purple-600/50 flex items-center justify-center text-lg border border-purple-300/30 shrink-0">
            {selectedItem?.avatar || '🚀'}
          </div>
          <div className="truncate text-left">
            <p className="text-sm font-bold text-white truncate">
              {selectedName || (loading ? 'Memuat daftar peserta...' : 'Pilih Nama Peserta...')}
            </p>
            <p className="text-[11px] text-purple-300 truncate">
              {roomPin ? `Peserta Terdaftar di Quiz Room ${roomPin}` : 'Pilih nama Anda di dropdown'}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-purple-200 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-qcpp-yellow' : ''}`} />
      </button>

      {/* Custom Lock Warning Toast Notification Banner */}
      {lockWarningMsg && (
        <div className="mt-2.5 p-3 bg-rose-600/90 border-2 border-rose-300 text-white rounded-xl text-xs font-bold shadow-xl flex items-center justify-between animate-bounce-short">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
            <span>{lockWarningMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setLockWarningMsg(null)}
            className="ml-2 text-xs font-black text-rose-200 hover:text-white px-2 py-0.5 bg-black/30 rounded-lg shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-[#23085a] border border-white/25 rounded-2xl shadow-2xl overflow-hidden gpu-accelerated animate-in fade-in duration-100">
          {/* Search Box inside dropdown */}
          <div className="p-2 border-b border-white/10 bg-black/30">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-purple-300 absolute left-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari atau ketik nama peserta..."
                className="w-full pl-9 pr-3 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs text-white placeholder-purple-300/60 focus:outline-none focus:ring-1 focus:ring-qcpp-yellow"
                autoFocus
              />
            </div>
          </div>

          {/* Participant List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-white/5 scrollbar-thin">
            {filteredParticipants.length > 0 ? (
              filteredParticipants.map((p) => {
                const isSelected = p.name === selectedName;
                const isAlreadyActive = activeNames.has(p.name.toLowerCase().trim());

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(p)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors hover:bg-white/10 ${
                      isAlreadyActive
                        ? 'bg-black/30 text-purple-300/60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-purple-600/60 text-white font-bold'
                        : 'text-purple-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <span className="text-base">{p.avatar || '🚀'}</span>
                      <span className={`truncate ${isAlreadyActive ? 'line-through opacity-70' : ''}`}>{p.name}</span>
                    </div>

                    {isAlreadyActive ? (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-500/40 shrink-0">
                        <Lock className="w-3 h-3 text-rose-400" />
                        <span>Sedang Aktif</span>
                      </span>
                    ) : isSelected ? (
                      <Check className="w-4 h-4 text-qcpp-yellow shrink-0" />
                    ) : null}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-purple-200">
                <p className="mb-2">Nama "{searchQuery}" tidak ada di daftar quiz ini.</p>
              </div>
            )}
          </div>

          {/* Add New Participant Action Button */}
          {searchQuery.trim().length > 0 && !filteredParticipants.some((p) => p.name.toLowerCase() === searchQuery.trim().toLowerCase()) && (
            <div className="p-2 bg-purple-950 border-t border-white/15">
              <button
                type="button"
                onClick={handleAddNewParticipant}
                className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-qcpp-green hover:bg-qcpp-greenHover text-white font-bold rounded-xl text-xs shadow-md transition-transform active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambahkan "{searchQuery}" Ke Quiz Ini</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

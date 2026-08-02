import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Search, Plus, UserCheck, Check } from 'lucide-react';
import { Participant } from '../types/quiz';
import { fetchParticipantsList, addParticipantName } from '../lib/supabase';
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
  const [loading, setLoading] = useState<boolean>(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load participants list specific to the roomPin or quizId
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const list = await fetchParticipantsList(quizId, roomPin);
      setParticipants(list);
      setLoading(false);

      // Auto select first participant if none selected
      if (!selectedName && list.length > 0) {
        onSelectParticipant(list[0].name, list[0].avatar || '🚀');
      }
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
    soundFx.playClick();
    onSelectParticipant(participant.name, participant.avatar || '🚀');
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleAddNewParticipant = async () => {
    if (!searchQuery.trim()) return;
    soundFx.playClick();
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
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelect(p)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors hover:bg-white/10 ${
                      isSelected ? 'bg-purple-600/60 text-white font-bold' : 'text-purple-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <span className="text-base">{p.avatar || '🚀'}</span>
                      <span className="truncate">{p.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-qcpp-yellow shrink-0" />}
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

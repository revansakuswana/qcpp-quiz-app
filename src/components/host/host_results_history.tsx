import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Users, Search, Download, Calendar, Medal, Eye, X, CheckCircle2, FileSpreadsheet, Check } from 'lucide-react';
import { CompletedSessionResult, SessionParticipant } from '../../types/quiz';
import { fetchCompletedSessionResults } from '../../lib/supabase';
import { soundFx } from '../../lib/audio';

export const HostResultsHistory: React.FC = () => {
  const [results, setResults] = useState<CompletedSessionResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<CompletedSessionResult | null>(null);
  const [modalSearch, setModalSearch] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchCompletedSessionResults();
      setResults(data);
      setLoading(false);
    }
    loadData();
  }, []);

  // Filtered session results by PIN or Title or Code
  const filteredResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return results;
    return results.filter(
      (r) =>
        r.quiz_title.toLowerCase().includes(q) ||
        r.quiz_code.toLowerCase().includes(q) ||
        r.pin.toLowerCase().includes(q)
    );
  }, [results, searchQuery]);

  // Overall Statistics
  const totalSessions = results.length;
  const totalParticipantsCount = useMemo(() => {
    return results.reduce((acc, curr) => acc + (curr.participants?.length || curr.total_participants || 0), 0);
  }, [results]);

  const topScorerOverall = useMemo<{ name: string; score: number; quiz: string; avatar: string } | null>(() => {
    let top: { name: string; score: number; quiz: string; avatar: string } | null = null;
    results.forEach((r) => {
      if (r.participants && r.participants.length > 0) {
        const first = r.participants[0];
        if (!top || first.score > top.score) {
          top = {
            name: first.participant_name,
            score: first.score,
            quiz: r.quiz_title,
            avatar: first.avatar || '🏆',
          };
        }
      }
    });
    return top;
  }, [results]);

  // Function to Export CSV Data
  const handleExportCSV = (session: CompletedSessionResult) => {
    soundFx.playClick();
    const headers = ['Peringkat', 'Nama Peserta', 'Jawaban Benar', 'Total Soal', 'Skor Akhir (PTS)', 'Streak', 'PIN Room', 'Judul Kuis'];
    const rows = (session.participants || []).map((p, idx) => {
      const correct = p.correct_answers_count ?? Math.min(Math.floor(p.score / 950), session.total_questions);
      return [
        idx + 1,
        `"${p.participant_name.replace(/"/g, '""')}"`,
        `"${correct}/${session.total_questions} Benar"`,
        session.total_questions,
        p.score,
        p.streak || 0,
        session.pin,
        `"${session.quiz_title.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hasil_Quiz_${session.quiz_code}_PIN_${session.pin}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Modal Participants
  const modalFilteredParticipants = useMemo(() => {
    if (!selectedSession) return [];
    const q = modalSearch.toLowerCase().trim();
    const sorted = [...(selectedSession.participants || [])].sort((a, b) => b.score - a.score);
    if (!q) return sorted;
    return sorted.filter((p) => p.participant_name.toLowerCase().includes(q));
  }, [selectedSession, modalSearch]);

  return (
    <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#240a5e] border border-white/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-qcpp-yellow shrink-0" />
            <h1 className="text-xl sm:text-2xl font-black font-['Fredoka',sans-serif] text-white">
              Daftar Hasil & Rekap Quiz Host
            </h1>
          </div>
          <p className="text-xs text-purple-200 mt-1">
            Riwayat lengkap skor, jumlah jawaban benar, peringkat peserta, dan analisis hasil kuis yang telah selesai diselenggarakan.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-purple-300 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari PIN atau Judul Kuis..."
            className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/20 rounded-xl text-xs text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-qcpp-yellow"
          />
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#240a5e] border border-white/20 rounded-2xl p-4 flex items-center space-x-3 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-purple-600/40 border border-purple-400/30 flex items-center justify-center text-2xl shrink-0">
            📊
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-purple-200">Total Kuis Selesai</p>
            <p className="text-xl font-black text-white">{totalSessions} Session</p>
          </div>
        </div>

        <div className="bg-[#240a5e] border border-white/20 rounded-2xl p-4 flex items-center space-x-3 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/40 border border-emerald-400/30 flex items-center justify-center text-2xl shrink-0">
            👥
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase text-purple-200">Total Partisipasi Peserta</p>
            <p className="text-xl font-black text-emerald-300">{totalParticipantsCount} Peserta</p>
          </div>
        </div>

        <div className="bg-[#240a5e] border border-white/20 rounded-2xl p-4 flex items-center space-x-3 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-amber-500/40 border border-amber-400/30 flex items-center justify-center text-2xl shrink-0">
            🥇
          </div>
          <div className="truncate">
            <p className="text-[11px] font-bold uppercase text-purple-200">Skor Tertinggi Overall</p>
            <p className="text-sm font-bold text-qcpp-yellow truncate">
              {topScorerOverall ? `${topScorerOverall.name} (${topScorerOverall.score.toLocaleString()} pts)` : 'Belum Ada'}
            </p>
          </div>
        </div>
      </div>

      {/* Completed Quiz Session Cards List */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center justify-between">
          <span>Riwayat Sesi Kuis ({filteredResults.length})</span>
        </h2>

        {loading ? (
          <div className="p-8 text-center bg-[#240a5e] border border-white/10 rounded-2xl text-purple-200 text-sm font-semibold">
            Memuat data riwayat kuis...
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="p-8 text-center bg-[#240a5e] border border-white/10 rounded-2xl text-purple-200 text-sm font-semibold">
            Belum ada data kuis yang ditemukan.
          </div>
        ) : (
          filteredResults.map((session) => {
            const top3 = (session.participants || []).slice(0, 3);
            const dateStr = session.created_at
              ? new Date(session.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Baru saja';

            return (
              <div
                key={session.id}
                className="bg-[#240a5e] border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 hover:border-purple-400/50 transition-all"
              >
                {/* Session Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-qcpp-purple text-purple-200 border border-purple-400/30">
                        {session.quiz_code}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>SELESAI</span>
                      </span>
                      <span className="text-xs text-purple-300 font-mono">PIN: #{session.pin}</span>
                    </div>
                    <h3 className="text-base sm:text-xl font-bold text-white mt-1">{session.quiz_title}</h3>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-purple-200">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-qcpp-yellow" />
                      <span>{dateStr}</span>
                    </span>
                    <span className="flex items-center space-x-1 font-bold text-white">
                      <Users className="w-3.5 h-3.5 text-qcpp-yellow" />
                      <span>{session.participants?.length || session.total_participants} Peserta</span>
                    </span>
                  </div>
                </div>

                {/* Top 3 Podium Mini Grid */}
                <div>
                  <p className="text-xs font-bold uppercase text-purple-200 mb-2 flex items-center space-x-1">
                    <Medal className="w-3.5 h-3.5 text-qcpp-yellow" />
                    <span>Top 3 Pemuncak Podium:</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {top3.map((p, idx) => {
                      const correctCount = p.correct_answers_count ?? Math.min(Math.floor(p.score / 950), session.total_questions);
                      return (
                        <div
                          key={p.id || idx}
                          className={`p-3 rounded-xl border flex items-center justify-between ${
                            idx === 0
                              ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                              : idx === 1
                              ? 'bg-slate-400/20 border-slate-300/40 text-slate-200'
                              : 'bg-amber-700/20 border-amber-600/40 text-amber-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <span className="text-lg">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                            <span className="text-base">{p.avatar || '🚀'}</span>
                            <div className="truncate">
                              <p className="text-xs font-bold text-white truncate">{p.participant_name}</p>
                              <div className="flex items-center space-x-1.5 mt-0.5">
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/25 text-emerald-300 border border-emerald-400/30">
                                  {correctCount}/{session.total_questions} Benar ✅
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-black font-mono ml-2 shrink-0">{p.score.toLocaleString()} pts</span>
                        </div>
                      );
                    })}

                    {top3.length === 0 && (
                      <div className="col-span-3 p-3 bg-black/20 rounded-xl text-xs text-purple-300 italic text-center">
                        Belum ada data nilai peserta untuk sesi ini.
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedSession(session);
                      setModalSearch('');
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-xs rounded-xl border border-purple-400/40 transition-all flex items-center justify-center space-x-1.5 active:scale-95 shadow-md"
                  >
                    <Eye className="w-4 h-4 text-qcpp-yellow" />
                    <span>Lihat Rekap Lengkap ({session.participants?.length || 0} Peserta)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportCSV(session)}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl border border-emerald-400/40 transition-all flex items-center justify-center space-x-1.5 active:scale-95 shadow-md"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                    <span>Export Data (CSV)</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FULL LEADERBOARD DETAIL MODAL POPUP */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-4xl bg-[#1e074d] border-2 border-purple-400/30 rounded-3xl p-5 sm:p-8 max-h-[85vh] flex flex-col shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedSession(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-rose-500/30 text-purple-200 hover:text-white border border-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-4 pr-10">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-qcpp-purple text-purple-200">
                {selectedSession.quiz_code} • PIN #{selectedSession.pin}
              </span>
              <h2 className="text-lg sm:text-2xl font-black font-['Fredoka',sans-serif] text-white mt-1">
                {selectedSession.quiz_title}
              </h2>
              <p className="text-xs text-purple-200 mt-1">
                Rekap peringkat akhir dan jumlah jawaban benar dari total {selectedSession.total_questions} soal untuk sesi ini.
              </p>
            </div>

            {/* Search Filter inside Modal */}
            <div className="mb-3 relative">
              <Search className="w-4 h-4 text-purple-300 absolute left-3 top-2.5" />
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="Cari nama peserta..."
                className="w-full pl-9 pr-3 py-2 bg-[#12032d] border border-purple-400/30 rounded-xl text-xs text-white placeholder-purple-300/60 focus:outline-none focus:ring-1 focus:ring-qcpp-yellow"
              />
            </div>

            {/* Full Participants Ranking Table (Fast 60fps Smooth Scroll & Solid Header) */}
            <div className="flex-1 overflow-y-auto border border-purple-400/20 rounded-2xl bg-[#140436] scrollbar-thin scrollbar-thumb-purple-500/40 overscroll-contain">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#2b0b6e] text-purple-200 uppercase font-bold sticky top-0 border-b border-purple-400/30 z-20 shadow-md">
                  <tr>
                    <th className="py-3.5 px-4 bg-[#2b0b6e]">Peringkat</th>
                    <th className="py-3.5 px-4 bg-[#2b0b6e]">Peserta</th>
                    <th className="py-3.5 px-4 text-center bg-[#2b0b6e]">Jawaban Benar</th>
                    <th className="py-3.5 px-4 text-center bg-[#2b0b6e]">Streak</th>
                    <th className="py-3.5 px-4 text-right bg-[#2b0b6e]">Skor Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {modalFilteredParticipants.map((p, idx) => {
                    const correctCount = p.correct_answers_count ?? Math.min(Math.floor(p.score / 950), selectedSession.total_questions);
                    const percentage = Math.round((correctCount / selectedSession.total_questions) * 100);

                    return (
                      <tr
                        key={p.id || idx}
                        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 44px' }}
                        className={`hover:bg-purple-600/20 transition-colors ${
                          idx === 0
                            ? 'bg-amber-500/10 font-bold text-amber-200'
                            : idx === 1
                            ? 'bg-slate-400/10 font-bold text-slate-200'
                            : idx === 2
                            ? 'bg-amber-700/10 font-bold text-amber-300'
                            : 'text-purple-100'
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold">
                          {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                        </td>
                        <td className="py-3 px-4 flex items-center space-x-2">
                          <span className="text-base">{p.avatar || '🚀'}</span>
                          <span className="font-bold text-white">{p.participant_name}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                            <span>{correctCount} / {selectedSession.total_questions} Benar</span>
                            <span className="text-[10px] opacity-80">({percentage}%)</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {p.streak && p.streak > 0 ? `🔥 ${p.streak}` : '-'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-qcpp-yellow text-sm">
                          {p.score.toLocaleString()} pts
                        </td>
                      </tr>
                    );
                  })}
                  {modalFilteredParticipants.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs text-purple-300">
                        Tidak ada data peserta yang cocok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-purple-300 font-semibold">
                Total {selectedSession.participants?.length || 0} Peserta Terdaftar
              </span>

              <button
                type="button"
                onClick={() => handleExportCSV(selectedSession)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center space-x-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download File CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

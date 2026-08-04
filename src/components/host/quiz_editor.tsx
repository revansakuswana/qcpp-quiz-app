import React, { useState, useRef } from 'react';
import { Plus, Trash2, Save, BookOpen, Users, Clock, AlertTriangle, X, Edit3, CheckCircle2 } from 'lucide-react';
import { Quiz, Question } from '../../types/quiz';
import { createQuiz, updateQuiz, INITIAL_PARTICIPANT_NAMES } from '../../lib/supabase';
import { soundFx } from '../../lib/audio';

interface QuizEditorProps {
  onQuizCreated: (quiz: Quiz) => void;
  onQuizUpdated?: (quiz: Quiz) => void;
  onSelectExistingQuiz: (quizId: string) => void;
  onDeleteQuiz?: (quizId: string) => void;
  existingQuizzes: Quiz[];
}

export const QuizEditor: React.FC<QuizEditorProps> = ({
  onQuizCreated,
  onQuizUpdated,
  onSelectExistingQuiz,
  onDeleteQuiz,
  existingQuizzes,
}) => {
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [participantInput, setParticipantInput] = useState<string>(INITIAL_PARTICIPANT_NAMES.join(', '));
  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([
    {
      question_text: 'Contoh: Apa ibu kota negara Indonesia?',
      options: ['Surabaya', 'DKI Jakarta', 'Bandung', 'Medan'],
      correct_option_index: 1,
      time_limit: 30,
      points: 1000,
    },
  ]);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

  const formRef = useRef<HTMLDivElement>(null);

  const handleStartEditQuiz = (q: Quiz) => {
    soundFx.playClick();
    setEditingQuizId(q.id);
    setTitle(q.title);
    setDescription(q.description || '');
    setParticipantInput((q.allowed_participants || []).join(', '));
    setQuestions(
      (q.questions || []).map((item) => ({
        question_text: item.question_text,
        options: [...item.options],
        correct_option_index: item.correct_option_index,
        time_limit: item.time_limit || 30,
        points: item.points || 1000,
      }))
    );
    setErrorMessage(null);
    setSuccessMessage(`Sedang mengedit kuis "${q.title}". Anda dapat menambah, mengubah, atau menghapus soal-soal di bawah.`);

    // Scroll to form smoothly
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    soundFx.playClick();
    setEditingQuizId(null);
    setTitle('');
    setDescription('');
    setQuestions([
      {
        question_text: '',
        options: ['', '', '', ''],
        correct_option_index: 0,
        time_limit: 30,
        points: 1000,
      },
    ]);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleAddQuestion = () => {
    soundFx.playClick();
    setQuestions((prev) => [
      ...prev,
      {
        question_text: '',
        options: ['', '', '', ''],
        correct_option_index: 0,
        time_limit: 30,
        points: 1000,
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    soundFx.playClick();
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: string, value: any) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const newOpts = [...copy[qIdx].options];
      newOpts[optIdx] = value;
      copy[qIdx].options = newOpts;
      return copy;
    });
  };

  const handleConfirmDeleteQuiz = () => {
    if (!quizToDelete || !onDeleteQuiz) return;
    soundFx.playClick();
    onDeleteQuiz(quizToDelete.id);
    setSuccessMessage(`Kuis "${quizToDelete.title}" berhasil dihapus.`);
    setQuizToDelete(null);
    if (editingQuizId === quizToDelete.id) {
      handleCancelEdit();
    }
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      soundFx.playWrong();
      setErrorMessage('Masukkan judul quiz terlebih dahulu!');
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question_text.trim()) {
        soundFx.playWrong();
        setErrorMessage(`Teks pertanyaan ke-${i + 1} tidak boleh kosong!`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!questions[i].options[j]?.trim()) {
          soundFx.playWrong();
          setErrorMessage(`Pilihan jawaban ke-${j + 1} pada Soal #${i + 1} tidak boleh kosong!`);
          return;
        }
      }
    }

    setSaving(true);
    soundFx.playClick();

    // Process participant names from comma-separated input
    const allowedParticipants = participantInput
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    const fullQuestions: Question[] = questions.map((q, index) => ({
      ...q,
      id: `q-custom-${Date.now()}-${index}`,
    }));

    if (editingQuizId) {
      // Update existing quiz
      const updated = await updateQuiz(editingQuizId, {
        title: title.trim(),
        description: description.trim(),
        allowed_participants: allowedParticipants,
        questions: fullQuestions,
      });

      setSaving(false);
      if (updated) {
        setSuccessMessage(`Kuis "${updated.title}" berhasil diperbarui! Perubahan ${fullQuestions.length} soal telah tersimpan.`);
        if (onQuizUpdated) onQuizUpdated(updated);
        setEditingQuizId(null);
        setTitle('');
        setDescription('');
      }
    } else {
      // Create new quiz
      const code = `QZ-${Math.floor(1000 + Math.random() * 9000)}`;
      const saved = await createQuiz({
        title: title.trim(),
        description: description.trim(),
        code,
        allowed_participants: allowedParticipants,
        questions: fullQuestions,
      });

      setSaving(false);
      setSuccessMessage(`Kuis "${saved.title}" berhasil dibuat! Kuis baru Anda dengan ${fullQuestions.length} soal telah ditambahkan.`);
      setTitle('');
      setDescription('');
      onQuizCreated(saved);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
      {/* Error Validation Notification Banner */}
      {errorMessage && (
        <div className="bg-rose-600/90 border-2 border-rose-300 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between text-xs sm:text-sm font-bold animate-bounce-short">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-200 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="ml-3 px-2 py-1 bg-black/30 hover:bg-black/50 text-white rounded-lg border border-white/20 text-xs font-bold shrink-0"
          >
            Tutup ✕
          </button>
        </div>
      )}

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-600/90 border-2 border-emerald-300 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between text-xs sm:text-sm font-bold animate-bounce-short">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="ml-3 px-2 py-1 bg-black/30 hover:bg-black/50 text-white rounded-lg border border-white/20 text-xs font-bold shrink-0"
          >
            Tutup ✕
          </button>
        </div>
      )}

      {/* Existing Preset Quizzes Card */}
      <div className="bg-[#240a5e] border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-qcpp-yellow shrink-0" />
          <h2 className="text-base sm:text-xl font-bold font-['Fredoka',sans-serif] text-white">
            Pilih Quiz Terdaftar, Edit & Mulai Kuis
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {existingQuizzes.map((q) => {
            const isEditing = editingQuizId === q.id;
            return (
              <div
                key={q.id}
                className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between ${
                  isEditing
                    ? 'bg-purple-600/30 border-qcpp-yellow ring-2 ring-qcpp-yellow/50'
                    : 'bg-white/5 hover:bg-white/15 border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-qcpp-purple text-purple-200">
                      {q.code} • {(q.questions || []).length} Soal
                    </span>
                    {isEditing && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-qcpp-yellow text-black flex items-center space-x-1 animate-pulse">
                        <Edit3 className="w-3 h-3" />
                        <span>SEDANG DIEDIT</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-white mt-1.5 leading-snug">{q.title}</h3>
                  <p className="text-[11px] sm:text-xs text-purple-200 mt-1 line-clamp-2">{q.description}</p>

                  {/* Show allowed participants tag */}
                  {q.allowed_participants && q.allowed_participants.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-white/10">
                      <span className="text-[10px] font-bold text-purple-300 block mb-1">
                        Peserta ({q.allowed_participants.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {q.allowed_participants.slice(0, 3).map((pName, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white">
                            {pName}
                          </span>
                        ))}
                        {q.allowed_participants.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-qcpp-yellow/20 text-qcpp-yellow">
                            +{q.allowed_participants.length - 3} lagi
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons: Start Quiz, Edit Quiz & Delete Quiz */}
                <div className="mt-4 flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick();
                      onSelectExistingQuiz(q.id);
                    }}
                    className="flex-1 py-2 sm:py-2.5 px-2 bg-qcpp-yellow hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-1"
                  >
                    <span>Mulai</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartEditQuiz(q)}
                    className="py-2 sm:py-2.5 px-3 bg-purple-500/20 hover:bg-purple-600 border border-purple-400/30 text-purple-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 active:scale-95 shrink-0"
                    title="Edit Judul, Deskripsi, dan Tambah Soal pada Kuis ini"
                  >
                    <span>Edit</span>
                  </button>

                  {onDeleteQuiz && (
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playWrong();
                        setQuizToDelete(q);
                      }}
                      className="py-2 sm:py-2.5 px-2.5 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-400/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 active:scale-95 shrink-0"
                      title="Hapus Kuis ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE & EDIT QUIZ FORM CARD */}
      <div ref={formRef} className="bg-[#240a5e] border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2">
            <div>
              <h2 className="text-base sm:text-xl font-black font-['Fredoka',sans-serif] text-white">
                {editingQuizId ? 'Edit Kuis & Tambah Soal' : 'Buat Quiz Baru Kustom'}
              </h2>
              <p className="text-xs text-purple-200">
                {editingQuizId
                  ? 'Ubah judul, deskripsi, peserta, atau tambah/edit daftar pertanyaan soal kuis.'
                  : 'Buat set kuis baru dari awal dengan pertanyaan, pilihan jawaban, dan durasi timer kustom.'}
              </p>
            </div>
          </div>

          {editingQuizId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white text-xs font-bold rounded-xl border border-white/20 flex items-center space-x-1 shrink-0"
            >
              <span>Batal</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSaveQuiz} className="space-y-6">
          {/* Quiz Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-purple-200">Judul Quiz *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="mis. Quiz Pre Test Refresh WI 2026..."
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-qcpp-yellow"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-purple-200">Deskripsi Quiz (Opsional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="mis. Evaluasi Kesiapan Lahan & Finishing Ridger..."
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-qcpp-yellow"
              />
            </div>
          </div>

          {/* Participant Names Input Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-purple-200 flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-qcpp-yellow" />
                <span>Daftar Peserta Terdaftar (Pisahkan dengan koma)</span>
              </label>
              <span className="text-[10px] text-purple-300">
                {participantInput.split(',').filter((n) => n.trim()).length} Nama Peserta
              </span>
            </div>
            <textarea
              value={participantInput}
              onChange={(e) => setParticipantInput(e.target.value)}
              rows={2}
              placeholder="Masukkan nama-nama peserta dipisahkan koma..."
              className="w-full px-3.5 py-2 bg-black/40 border border-white/20 rounded-xl text-xs text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-qcpp-yellow scrollbar-thin"
            />
          </div>

          {/* Questions Header & Add Button */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
                <span>Daftar Soal Pertanyaan ({questions.length})</span>
              </h3>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-xs rounded-xl border border-purple-400/40 transition-all flex items-center space-x-1 active:scale-95 shadow-md"
              >
                <Plus className="w-4 h-4 text-qcpp-yellow" />
                <span>Tambah Soal Baru</span>
              </button>
            </div>

            {/* Questions List Form */}
            <div className="space-y-4">
              {questions.map((q, qIdx) => (
                <div key={qIdx} className="bg-black/30 border border-white/15 rounded-2xl p-4 sm:p-5 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-qcpp-purple text-qcpp-yellow font-mono border border-purple-400/30">
                      Soal #{qIdx + 1}
                    </span>

                    <div className="flex items-center space-x-3">
                      {/* Timer Option selector */}
                      <div className="flex items-center space-x-1 text-xs text-purple-200">
                        <Clock className="w-3.5 h-3.5 text-qcpp-yellow" />
                        <select
                          value={q.time_limit}
                          onChange={(e) => handleQuestionChange(qIdx, 'time_limit', Number(e.target.value))}
                          className="bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-qcpp-yellow"
                        >
                          <option value={10}>10 Detik</option>
                          <option value={15}>15 Detik</option>
                          <option value={20}>20 Detik</option>
                          <option value={30}>30 Detik (Default)</option>
                          <option value={45}>45 Detik</option>
                          <option value={60}>60 Detik</option>
                        </select>
                      </div>

                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="p-1.5 text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-600 rounded-lg border border-rose-400/30 transition-all text-xs flex items-center space-x-1"
                          title="Hapus soal ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Hapus Soal</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <textarea
                    value={q.question_text}
                    onChange={(e) => handleQuestionChange(qIdx, 'question_text', e.target.value)}
                    rows={2}
                    placeholder={`Tuliskan teks pertanyaan soal ke-${qIdx + 1}...`}
                    className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-qcpp-yellow"
                    required
                  />

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {['A', 'B', 'C', 'D'].map((label, optIdx) => {
                      const isCorrect = q.correct_option_index === optIdx;
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center space-x-2 p-2 rounded-xl border transition-all ${
                            isCorrect ? 'bg-emerald-500/20 border-emerald-400/50' : 'bg-black/40 border-white/10'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleQuestionChange(qIdx, 'correct_option_index', optIdx)}
                            className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border transition-all ${
                              isCorrect
                                ? 'bg-emerald-500 border-emerald-300 text-black shadow-md'
                                : 'bg-white/10 border-white/20 text-purple-200 hover:bg-white/20'
                            }`}
                            title="Klik untuk memilih sebagai Jawaban Benar"
                          >
                            {label}
                          </button>
                          <input
                            type="text"
                            value={q.options[optIdx] || ''}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            placeholder={`Pilihan ${label}...`}
                            className="w-full bg-transparent text-xs text-white placeholder-purple-300/40 focus:outline-none"
                            required
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
            {editingQuizId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all"
              >
                Batal Edit
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-qcpp-yellow hover:bg-amber-400 text-black font-black text-sm rounded-xl shadow-xl active:scale-95 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <span>{saving ? 'Menyimpan...' : editingQuizId ? 'Simpan Perubahan Kuis' : 'Simpan Kuis Baru'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* CUSTOM CONFIRMATION DELETE QUIZ MODAL */}
      {quizToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#240a5e] border-2 border-rose-500/50 rounded-3xl p-6 shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setQuizToDelete(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-purple-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-xl shrink-0">
                ⚠️
              </div>
              <h3 className="text-lg font-black font-['Fredoka',sans-serif] text-white">
                Konfirmasi Hapus Kuis
              </h3>
            </div>

            <p className="text-xs text-purple-100 leading-relaxed">
              Apakah Anda yakin ingin menghapus kuis <span className="font-bold text-qcpp-yellow">"{quizToDelete.title}"</span>? Semua soal dan data kuis ini akan dihapus permanen dari sistem.
            </p>

            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setQuizToDelete(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-purple-200 font-bold text-xs rounded-xl border border-white/20 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteQuiz}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg active:scale-95 transition-all flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Permanen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

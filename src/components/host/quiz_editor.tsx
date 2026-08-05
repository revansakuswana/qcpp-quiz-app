import React, { useState, useRef } from 'react';
import { Plus, Trash2, Save, BookOpen, Users, Clock, AlertTriangle, X, Edit3, RotateCcw } from 'lucide-react';
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
      q.questions && q.questions.length > 0
        ? q.questions.map((ques) => ({
            question_text: ques.question_text,
            options: [...ques.options],
            correct_option_index: ques.correct_option_index,
            time_limit: ques.time_limit || 30,
            points: ques.points || 1000,
          }))
        : [
            {
              question_text: '',
              options: ['', '', '', ''],
              correct_option_index: 0,
              time_limit: 30,
              points: 1000,
            },
          ]
    );
    setErrorMessage(null);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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
    setSuccessMessage(null);
    setErrorMessage(null);
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
    if (editingQuizId === quizToDelete.id) {
      handleCancelEdit();
    }
    setQuizToDelete(null);
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
    }

    setSaving(true);
    soundFx.playClick();

    const allowedParticipants = participantInput
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    const fullQuestions: Question[] = questions.map((q, index) => ({
      ...q,
      id: `q-custom-${Date.now()}-${index}`,
    }));

    if (editingQuizId) {
      // UPDATE EXISTING QUIZ
      const updated = await updateQuiz(editingQuizId, {
        title: title.trim(),
        description: description.trim(),
        allowed_participants: allowedParticipants,
        questions: fullQuestions,
      });

      setSaving(false);
      if (updated) {
        setSuccessMessage(`Kuis "${updated.title}" berhasil diperbarui! Perubahan telah disimpan.`);
        if (onQuizUpdated) onQuizUpdated(updated);
        handleCancelEdit();
      }
    } else {
      // CREATE NEW QUIZ
      const code = `QZ-${Math.floor(1000 + Math.random() * 9000)}`;
      const saved = await createQuiz({
        title: title.trim(),
        description: description.trim(),
        code,
        allowed_participants: allowedParticipants,
        questions: fullQuestions,
      });

      setSaving(false);
      setSuccessMessage(`Kuis "${saved.title}" berhasil dibuat! Kuis baru Anda telah ditambahkan ke daftar kuis terdaftar.`);
      setTitle('');
      setDescription('');
      onQuizCreated(saved);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
      {/* Existing Preset Quizzes Card */}
      <div className="bg-[#240a5e] border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-qcpp-yellow shrink-0" />
            <h2 className="text-base sm:text-xl font-bold font-['Fredoka',sans-serif] text-white">
              Kelola & Mulai Quiz ({existingQuizzes.length})
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {existingQuizzes.map((q) => (
            <div
              key={q.id}
              className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between ${
                editingQuizId === q.id
                  ? 'bg-purple-900/40 border-qcpp-yellow ring-2 ring-qcpp-yellow/50 shadow-2xl'
                  : 'bg-white/5 hover:bg-white/15 border-white/10'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-qcpp-purple text-purple-200">
                    {q.code} • {(q.questions || []).length} Soal
                  </span>
                  {editingQuizId === q.id && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-qcpp-yellow text-black animate-pulse font-mono">
                      Sedang Di-Edit
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

              {/* Action Buttons: Mulai, Edit, Hapus */}
              <div className="mt-4 flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick();
                    onSelectExistingQuiz(q.id);
                  }}
                  className="flex-1 py-2 sm:py-2.5 bg-qcpp-yellow hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-1"
                >
                  <span>Mulai</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStartEditQuiz(q)}
                  className="py-2 sm:py-2.5 px-3 bg-purple-600/40 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-400/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 active:scale-95 shrink-0"
                  title="Edit Kuis ini"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {onDeleteQuiz && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playWrong();
                      setQuizToDelete(q);
                    }}
                    className="py-2 sm:py-2.5 px-3 bg-rose-500/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-400/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 active:scale-95 shrink-0"
                    title="Hapus Kuis ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quiz Creator / Editor Form Card */}
      <div ref={formRef} className="bg-[#240a5e] border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <h2 className="text-base sm:text-xl font-bold font-['Fredoka',sans-serif] text-white flex items-center space-x-2">
            {editingQuizId ? <Edit3 className="w-5 h-5 text-qcpp-yellow" /> : <Plus className="w-5 h-5 text-qcpp-yellow" />}
            <span>{editingQuizId ? `Edit Kuis: "${title}"` : 'Buat Quiz'}</span>
          </h2>

          {editingQuizId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-purple-200 hover:text-white rounded-xl border border-white/20 text-xs font-bold transition-all flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Batal</span>
            </button>
          )}
        </div>

        <form onSubmit={handleSaveQuiz} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold uppercase text-purple-200 mb-1">
                Judul Kuis *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Evaluasi Kesiapan Lahan 2026..."
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-qcpp-yellow font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] sm:text-xs font-bold uppercase text-purple-200 mb-1">
                Deskripsi Kuis
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat..."
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-qcpp-yellow"
              />
            </div>
          </div>

          {/* Section: Allowed Participants per Quiz */}
          <div className="p-3 sm:p-4 bg-black/20 rounded-xl sm:rounded-2xl border border-white/10">
            <label className="block text-[11px] sm:text-xs font-bold uppercase text-qcpp-yellow mb-1 flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Daftar Peserta Terdaftar ({INITIAL_PARTICIPANT_NAMES.length} Peserta)</span>
            </label>
            <p className="text-[10px] sm:text-[11px] text-purple-200 mb-2 leading-relaxed">
              Nama-nama berikut dapat memilih nama saat masuk kuis. Pisahkan dengan koma:
            </p>
            <textarea
              rows={3}
              value={participantInput}
              onChange={(e) => setParticipantInput(e.target.value)}
              placeholder="Jaelani, Tri Widodo, Agustinus Triono..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/40 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-qcpp-yellow scrollbar-thin"
            />
          </div>

          {/* Question Cards List */}
          <div className="space-y-4 sm:space-y-6 pt-3 border-t border-white/10">
            <div className="flex items-center justify-start">
              <h3 className="text-base sm:text-lg font-bold text-white">
                Daftar Soal Pertanyaan ({questions.length})
              </h3>
            </div>

            {questions.map((q, qIdx) => (
              <div key={qIdx} className="p-3.5 sm:p-5 bg-black/20 rounded-xl sm:rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-qcpp-yellow">
                      Soal #{qIdx + 1}
                    </span>

                    {/* Question Time Limit Duration Selector */}
                    <div className="flex items-center space-x-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                      <Clock className="w-3.5 h-3.5 text-qcpp-yellow" />
                      <span className="text-[11px] font-bold text-purple-200">Durasi:</span>
                      <select
                        value={q.time_limit}
                        onChange={(e) => handleQuestionChange(qIdx, 'time_limit', Number(e.target.value))}
                        className="bg-transparent text-xs font-extrabold text-qcpp-yellow focus:outline-none cursor-pointer"
                      >
                        <option value={10} className="bg-[#240a5e] text-white">10 Detik</option>
                        <option value={20} className="bg-[#240a5e] text-white">20 Detik</option>
                        <option value={30} className="bg-[#240a5e] text-white">30 Detik (Default)</option>
                        <option value={45} className="bg-[#240a5e] text-white">45 Detik</option>
                        <option value={60} className="bg-[#240a5e] text-white">60 Detik</option>
                        <option value={90} className="bg-[#240a5e] text-white">90 Detik</option>
                        <option value={120} className="bg-[#240a5e] text-white">120 Detik</option>
                      </select>
                    </div>
                  </div>

                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="text-rose-400 hover:text-rose-300 text-xs flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={q.question_text}
                  onChange={(e) => handleQuestionChange(qIdx, 'question_text', e.target.value)}
                  placeholder="Tulis pertanyaan di sini..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/40 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-qcpp-yellow"
                  required
                />

                {/* 4 Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {['Merah (▲)', 'Biru (◆)', 'Kuning (●)', 'Hijau (■)'].map((label, optIdx) => (
                    <div key={optIdx} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correct_option_index === optIdx}
                        onChange={() => handleQuestionChange(qIdx, 'correct_option_index', optIdx)}
                        className="w-3.5 h-3.5 accent-qcpp-yellow cursor-pointer shrink-0"
                        title="Tandai sebagai jawaban yang benar"
                      />
                      <input
                        type="text"
                        value={q.options[optIdx] || ''}
                        onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                        placeholder={`Pilihan ${label}`}
                        className="w-full px-2.5 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-purple-300/40 focus:outline-none focus:ring-1 focus:ring-qcpp-yellow"
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Prominent Add Question Button placed below the last question */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleAddQuestion}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-extrabold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-900/40 border border-emerald-300/40 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 text-yellow-300" />
                <span>Tambah Soal</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-qcpp-purple to-purple-800 hover:from-purple-700 hover:to-qcpp-purple border-2 border-purple-400/50 text-white font-extrabold text-sm sm:text-lg rounded-xl sm:rounded-2xl shadow-xl shadow-purple-900/40 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5 text-qcpp-yellow" />
            <span>{saving ? 'Menyimpan Kuis...' : 'Simpan Kuis'}</span>
          </button>
        </form>
      </div>

      {/* CONFIRMATION DELETE QUIZ MODAL DIALOG */}
      {quizToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#240a5e] border-2 border-rose-500/40 rounded-3xl p-6 shadow-2xl text-center relative space-y-4">
            <button
              onClick={() => setQuizToDelete(null)}
              className="absolute top-4 right-4 text-purple-300 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-black font-['Fredoka',sans-serif] text-white">
                Hapus Kuis Ini?
              </h3>
              <p className="text-xs text-purple-200 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus kuis <span className="font-bold text-rose-300">"{quizToDelete.title}"</span> ({quizToDelete.code})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setQuizToDelete(null)}
                className="flex-1 py-2.5 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteQuiz}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-900/40 transition-all flex items-center justify-center space-x-1.5 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Kuis</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

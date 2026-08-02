import React, { useState } from 'react';
import { Plus, Trash2, Save, Sparkles, BookOpen, Users } from 'lucide-react';
import { Quiz, Question } from '../../types/quiz';
import { createQuiz, INITIAL_PARTICIPANT_NAMES } from '../../lib/supabase';
import { soundFx } from '../../lib/audio';

interface QuizEditorProps {
  onQuizCreated: (quiz: Quiz) => void;
  onSelectExistingQuiz: (quizId: string) => void;
  existingQuizzes: Quiz[];
}

export const QuizEditor: React.FC<QuizEditorProps> = ({
  onQuizCreated,
  onSelectExistingQuiz,
  existingQuizzes,
}) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [participantInput, setParticipantInput] = useState<string>(INITIAL_PARTICIPANT_NAMES.join(', '));
  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>([
    {
      question_text: 'Contoh: Apa ibu kota negara Indonesia?',
      options: ['Surabaya', 'DKI Jakarta', 'Bandung', 'Medan'],
      correct_option_index: 1,
      time_limit: 15,
      points: 1000,
    },
  ]);
  const [saving, setSaving] = useState<boolean>(false);

  const handleAddQuestion = () => {
    soundFx.playClick();
    setQuestions((prev) => [
      ...prev,
      {
        question_text: '',
        options: ['', '', '', ''],
        correct_option_index: 0,
        time_limit: 15,
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

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Masukkan judul quiz terlebih dahulu!');
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question_text.trim()) {
        alert(`Teks pertanyaan ke-${i + 1} tidak boleh kosong!`);
        return;
      }
    }

    setSaving(true);
    soundFx.playClick();

    // Process participant names from comma-separated input
    const allowedParticipants = participantInput
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    const code = `QZ-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullQuestions: Question[] = questions.map((q, index) => ({
      ...q,
      id: `q-custom-${Date.now()}-${index}`,
    }));

    const saved = await createQuiz({
      title: title.trim(),
      description: description.trim(),
      code,
      allowed_participants: allowedParticipants,
      questions: fullQuestions,
    });

    setSaving(false);
    onQuizCreated(saved);
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
      {/* Existing Preset Quizzes Card */}
      <div className="bg-[#240a5e] border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-qcpp-yellow shrink-0" />
          <h2 className="text-base sm:text-xl font-bold font-['Fredoka',sans-serif] text-white">
            Pilih Quiz Terdaftar (Preset Demo)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {existingQuizzes.map((q) => (
            <div
              key={q.id}
              className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-qcpp-purple text-purple-200">
                  {q.code} • {q.questions.length} Soal
                </span>
                <h3 className="text-sm sm:text-lg font-bold text-white mt-1.5 leading-snug">{q.title}</h3>
                <p className="text-[11px] sm:text-xs text-purple-200 mt-1 line-clamp-2">{q.description}</p>

                {/* Show allowed participants tag */}
                {q.allowed_participants && q.allowed_participants.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-white/10">
                    <span className="text-[10px] font-bold text-purple-300 block mb-1">
                      👥 Peserta ({q.allowed_participants.length}):
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

              <button
                type="button"
                onClick={() => {
                  soundFx.playClick();
                  onSelectExistingQuiz(q.id);
                }}
                className="mt-3 w-full py-2 sm:py-2.5 bg-qcpp-blue hover:bg-qcpp-blueHover text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gunakan & Host Quiz Ini</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Create New Custom Quiz Form */}
      <div className="bg-[#240a5e] border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl">
        <div className="flex items-center space-x-2 mb-4 sm:mb-6">
          <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-qcpp-green shrink-0" />
          <h2 className="text-lg sm:text-2xl font-bold font-['Fredoka',sans-serif] text-white">
            Buat Quiz Baru
          </h2>
        </div>

        <form onSubmit={handleSaveQuiz} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold uppercase text-purple-200 mb-1">
                Judul Quiz
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul Quiz..."
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-qcpp-yellow"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] sm:text-xs font-bold uppercase text-purple-200 mb-1">
                Deskripsi Singkat
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi..."
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-qcpp-yellow"
              />
            </div>
          </div>

          {/* Section: Allowed Participants per Quiz */}
          <div className="p-3 sm:p-4 bg-black/20 rounded-xl sm:rounded-2xl border border-white/10">
            <label className="block text-[11px] sm:text-xs font-bold uppercase text-qcpp-yellow mb-1 flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Peserta Khusus ({INITIAL_PARTICIPANT_NAMES.length} Peserta)</span>
            </label>
            <p className="text-[10px] sm:text-[11px] text-purple-200 mb-2 leading-relaxed">
              Nama-nama berikut akan muncul di dropdown room. Pisahkan dengan koma:
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
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center justify-between">
              <span>Daftar Soal ({questions.length})</span>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-2.5 py-1.5 bg-qcpp-green hover:bg-qcpp-greenHover text-white text-xs font-bold rounded-xl flex items-center space-x-1 shadow-md active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Soal</span>
              </button>
            </h3>

            {questions.map((q, qIdx) => (
              <div key={qIdx} className="p-3.5 sm:p-5 bg-black/20 rounded-xl sm:rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-qcpp-yellow">
                    Soal #{qIdx + 1}
                  </span>
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
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 sm:py-4 bg-gradient-to-r from-qcpp-green to-emerald-600 hover:from-emerald-500 hover:to-qcpp-green text-white font-extrabold text-sm sm:text-lg rounded-xl sm:rounded-2xl shadow-xl shadow-qcpp-green/30 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{saving ? 'Menyimpan...' : 'Simpan & Mulai Host'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

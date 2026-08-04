import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Quiz, GameSession, Participant, SessionParticipant, PlayerAnswer, CompletedSessionResult } from '../types/quiz';

// Environmental Keys
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial Participant list for QCPP Quiz
export const INITIAL_PARTICIPANT_NAMES = [
  'Jaelani', 'Rosidi, SAG', 'Putra Fauzan Agung', 'Rangga Paksi Herdani Putra', 'Aldi', 'Anggi Muhlisin',
  'Dwi Febri Saputra', 'Harun Abidin', 'Muhamad Anis Ikhsan', 'Rikqi Setiawan', 'Wayan Kerte',
  'Dian Arifin', 'Feri Anwar', 'Feri Eko Saputra', 'Dava Hafizza', 'Arif Waluyo Bonar',
  'Andi Angga Saputra', 'Syapriansah', 'Sindu Andion', 'Muhammad Sulthan Faris', 'I Made Cerita',
  'Beni Santoso', 'Deni Rudiyanto', 'Rama Dana', 'Rido Nusa Putra', 'Septian Adi Saputra',
  'Hamdani', 'Anggi Putra', 'Dian Candra', 'Muhammad Ilham Rasyidin', 'Tri Irwanto',
  'Suhendri', 'Wiyanto', 'Dodi Saputra', 'Hadi Irawan', 'Setiawan',
  'Tedi Hadi Suryanto', 'Agus Tiawan', 'Muhammad Dedy Prasetyo', 'Dicky Agastian', 'Yogi Sektiawan Pranoto',
  'Ivan Rivandi', 'Solikhin', 'Wahyu Darmawan', 'Ardi Abdul Majid', 'Ridho Jula Ariyanto',
  'Susilo', 'Dimas Ramadhiansyah', 'Ahmad Hafif Fauzi', 'Wiyatno', 'Achmad Inzan Masruri',
  'Ari Saputra',
  'I Nengah Aryata', 'Rafika Dewi', 'M Iqbal Maulana', 'Anggi Agung Pambudi', 'Yohan Yogaswara',
  'Indra Yulianto', 'Rizka Esty Wulandari', 'Sugiyanto', 'Andri Tri Wicaksono', 'Zakiyatun Nafsiah',
  'Yahya Maulana', 'Sylfaa Aalimatul H', 'Revansa Helsa Kuswana', 'Reza Adi Saputra', 'Pandu Wiratama',
  'Annisa Indrani', 'Merry Nafisa', 'Dwi Handoyo', 'Erlangga Dwi Jiwantoro', 'Sylfaa Aalimatul Haqqi',
  'M Aldi Darmawan'
];

const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'quiz-agri-1',
    title: 'Uji Profisiensi & Pengamatan Agregat Tanah 🚜',
    description: 'Quiz Evaluasi Pengamatan Finishing, Subsoil, Bonggol, dan Bajak Rake',
    code: 'QCPP-AGRI',
    allowed_participants: INITIAL_PARTICIPANT_NAMES,
    questions: [
      {
        id: 'ag1',
        question_text: 'Bagaimana cara menghitung % bonggol tercacah?',
        options: [
          '% Bonggol Tercacah (BC) = (10 – jumlah bonggol yang utuh) / 10 x 100%.',
          '% Bonggol Tercacah (BC) = (15 – jumlah bonggol yang utuh) / 10 x 100%.',
          '% Bonggol Tercacah (BC) = (10 – jumlah bonggol yang utuh) / 5 x 100%.',
          'Semua jawaban diatas salah'
        ],
        correct_option_index: 0,
        time_limit: 30,
        points: 1000,
      },
      {
        id: 'ag2',
        question_text: 'Bonggol utuh adalah bonggol yang tidak tercacah dengan panjang .... Cm:',
        options: [
          '<10cm',
          '>10cm',
          '≥10 cm',
          '0 cm'
        ],
        correct_option_index: 2,
        time_limit: 30,
        points: 1000,
      },
      {
        id: 'ag3',
        question_text: 'Berapa % Standart Agregat/lolos ayakan pada Pengamatan Finishing (implemen rotary ridger)?',
        options: [
          '>70%',
          '<70%',
          '≥ 70%',
          '50%'
        ],
        correct_option_index: 2,
        time_limit: 30,
        points: 1000,
      },
      {
        id: 'ag4',
        question_text: 'Sebutkan urutan cara kerja pengambilan sampel ukuran agregat:',
        options: [
          'Mengambil sampel tanah, tanah ditimbang, tanah diayak, lalu bongkahan tidak std ditimbang',
          'Mengambil sampel tanah, tanah bongkahan diayak, tanah ditimbang',
          'Mengambil sampel tanah, tanah diayak, bongkahan dibuang',
          'Mengambil sampel tanah langsung dibuang'
        ],
        correct_option_index: 0,
        time_limit: 30,
        points: 1000,
      },
      {
        id: 'ag5',
        question_text: 'Apa standar kualitas aplikasi pinggiran?',
        options: [
          'Tidak dilakukan',
          'Dilakukan aplikasi pinggiran',
          'Lolos ayakan',
          'Semua benar'
        ],
        correct_option_index: 1,
        time_limit: 30,
        points: 1000,
      },
      {
        id: 'ag6',
        question_text: 'Berapa std lolos ayakan agregat bajak rake?',
        options: [
          '>=60%',
          '55%',
          '>=55%',
          '<50%'
        ],
        correct_option_index: 0,
        time_limit: 30,
        points: 1000,
      },
      {
        id: 'ag7',
        question_text: 'Berapakah standar kedalaman subsoil?',
        options: [
          '>60cm',
          '>=60cm',
          '<60cm',
          '50cm'
        ],
        correct_option_index: 1,
        time_limit: 30,
        points: 1000,
      },
      {
        id: 'ag8',
        question_text: 'Apa saja yang diamati dalam pengamatan subsoil dan berapa bobot masing-masing item?',
        options: [
          'kedalaman aplikasi (50%) & kerataan aplikasi/jarak antar leg (50%)',
          'kedalaman aplikasi (60%) & kerataan aplikasi/jarak antar leg (40%)',
          'kedalaman aplikasi (60%) & kerapatan aplikasi (40%)',
          'kedalaman aplikasi (70%) & kerataan aplikasi (30%)'
        ],
        correct_option_index: 0,
        time_limit: 30,
        points: 1000,
      }
    ]
  },
  {
    id: 'quiz-crown-2',
    title: 'Quiz Pre Test Refresh WI 2026 (Bibit, Tanam dan Potensi Crown) 🍍',
    description: 'Evaluasi Standar Kelolosan Bibit, Kerapatan Tanam, Kedalaman Tanam, dan Potensi Crown Nenas',
    code: 'QCPP-CROWN',
    allowed_participants: INITIAL_PARTICIPANT_NAMES,
    questions: [
      {
        id: 'cr1',
        question_text: 'Berapa standar persentase kelolosan bibit pada pengamatan kualitas bibit?',
        options: [
          '≥ 95%',
          '≥ 90%',
          '< 90%',
          '80%'
        ],
        correct_option_index: 0,
        time_limit: 30,
        points: 1000,
      },
      {
        id: 'cr2',
        question_text: 'Berapa standar populasi / kerapatan tanam nenas per hektar pada lokasi standar?',
        options: [
          '60.000 - 65.000 tanaman/ha',
          '50.000 - 55.000 tanaman/ha',
          '70.000 - 75.000 tanaman/ha',
          '40.000 tanaman/ha'
        ],
        correct_option_index: 0,
        time_limit: 30,
        points: 1000,
      },
      {
        id: 'cr3',
        question_text: 'Berapa potensi crown/mahkota yang ideal untuk kriteria pengamatan kualitas bibit Nenas?',
        options: [
          'Crown Utuh & Sehat tanpa cacat mekanis',
          'Crown kerdil',
          'Crown ganda',
          'Crown layu'
        ],
        correct_option_index: 0,
        time_limit: 30,
        points: 1000,
      },
      {
        id: 'cr4',
        question_text: 'Berapa standar kedalaman penanaman bibit di lahan produksi?',
        options: [
          '5 - 7 cm (tidak tertimbun tanah)',
          '10 - 15 cm',
          '< 3 cm',
          '20 cm'
        ],
        correct_option_index: 0,
        time_limit: 30,
        points: 1000,
      }
    ]
  }
];

const avatarsList = ['🦊', '🦄', '🐯', '🐼', '🦁', '🐱', '🐉', '🦉', '🚀', '🤖', '👾', '👑'];

let mockQuizzesStore = [...MOCK_QUIZZES];
let mockParticipantsStore: Record<string, Participant[]> = {
  'quiz-agri-1': INITIAL_PARTICIPANT_NAMES.map((name, idx) => ({
    id: `p-quiz-agri-${idx}`,
    name,
    avatar: avatarsList[idx % avatarsList.length],
    quiz_id: 'quiz-agri-1',
  })),
  'quiz-crown-2': INITIAL_PARTICIPANT_NAMES.map((name, idx) => ({
    id: `p-quiz-crown-${idx}`,
    name,
    avatar: avatarsList[idx % avatarsList.length],
    quiz_id: 'quiz-crown-2',
  })),
};

let mockSessionsStore: Record<string, GameSession> = {};
let mockSessionParticipantsStore: Record<string, SessionParticipant[]> = {};
let mockPlayerAnswersStore: Record<string, PlayerAnswer[]> = {};

// Helper for Mock Broadcaster
type ListenerCallback = (data: any) => void;
const mockBroadcasters: Record<string, Set<ListenerCallback>> = {};

function notifyMockListeners(channelKey: string, data: any) {
  if (mockBroadcasters[channelKey]) {
    mockBroadcasters[channelKey].forEach((cb) => cb(data));
  }
}

// -------------------------------------------------------------
// VERIFY GAME SESSION PIN
// -------------------------------------------------------------
export async function verifyGameSessionPin(pin: string): Promise<GameSession | null> {
  const cleanPin = pin.trim();

  // 1. Check local mock sessions store first
  const localSess = Object.values(mockSessionsStore).find((s) => s.pin === cleanPin);
  if (localSess) {
    return localSess;
  }

  // 2. Check Supabase DB
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*, quiz:quizzes(*, questions(*))')
        .eq('pin', cleanPin)
        .single();

      if (!error && data) {
        let fullQuiz: Quiz | undefined = undefined;

        if (data.quiz) {
          fullQuiz = {
            ...data.quiz,
            questions: data.quiz.questions && data.quiz.questions.length > 0 ? data.quiz.questions : [],
            allowed_participants: data.quiz.allowed_participants || [],
          };

          // If questions are empty, fetch from questions table directly
          if (fullQuiz.questions.length === 0) {
            const { data: qData } = await supabase
              .from('questions')
              .select('*')
              .eq('quiz_id', data.quiz_id);
            if (qData && qData.length > 0) {
              fullQuiz.questions = qData;
            } else {
              const matchedMock = mockQuizzesStore.find((mq) => mq.id === data.quiz_id || mq.code === data.quiz?.code || mq.title === data.quiz?.title);
              if (matchedMock && matchedMock.questions.length > 0) {
                fullQuiz.questions = matchedMock.questions;
              }
            }
          }
        }

        if (!fullQuiz) {
          fullQuiz = mockQuizzesStore.find((mq) => mq.id === data.quiz_id || mq.code === data.quiz?.code) || mockQuizzesStore[0];
        }

        const startTimestamp = data.updated_at
          ? new Date(data.updated_at).getTime()
          : data.created_at
          ? new Date(data.created_at).getTime()
          : Date.now();

        const sess: GameSession = {
          id: data.id,
          pin: data.pin,
          quiz_id: data.quiz_id,
          quiz: fullQuiz,
          status: data.status as any,
          current_question_index: data.current_question_index || 0,
          question_started_at: startTimestamp,
        };

        mockSessionsStore[sess.id] = sess;
        return sess;
      }
    } catch {
      // Fallback
    }
  }

  return null;
}

// -------------------------------------------------------------
// FETCH PARTICIPANTS FOR QUIZ / ROOM
// -------------------------------------------------------------
export async function fetchParticipantsForQuiz(quizId?: string, roomPin?: string): Promise<Participant[]> {
  const key = quizId || 'quiz-agri-1';
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('quiz_id', key);
      if (!error && data && data.length > 0) {
        return data as Participant[];
      }
    } catch {
      // Fallback
    }
  }

  if (mockParticipantsStore[key]) {
    return mockParticipantsStore[key];
  }

  return INITIAL_PARTICIPANT_NAMES.map((name, idx) => ({
    id: `p-${key}-${idx}`,
    name,
    avatar: avatarsList[idx % avatarsList.length],
    quiz_id: key,
  }));
}

// Add a single custom participant
export async function addParticipantToQuiz(quizId: string, name: string, avatar: string = '🚀'): Promise<Participant> {
  const cleanName = name.trim();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('participants')
        .insert([{ quiz_id: quizId, name: cleanName, avatar }])
        .select()
        .single();
      if (!error && data) {
        return data as Participant;
      }
    } catch {
      // Fallback
    }
  }

  const newP: Participant = {
    id: `part-${Date.now()}`,
    name: cleanName,
    avatar,
    quiz_id: quizId,
  };

  const key = quizId || 'global';
  if (!mockParticipantsStore[key]) {
    mockParticipantsStore[key] = [];
  }
  mockParticipantsStore[key].unshift(newP);
  return newP;
}

// -------------------------------------------------------------
// FETCH & CREATE QUIZZES
// -------------------------------------------------------------
export async function fetchQuizzes(): Promise<Quiz[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*, questions(*)');
      if (!error && data && data.length > 0) {
        const quizList: Quiz[] = [];
        for (const q of data) {
          let qList = q.questions || [];
          if (!qList || qList.length === 0) {
            const { data: qData } = await supabase.from('questions').select('*').eq('quiz_id', q.id);
            if (qData && qData.length > 0) {
              qList = qData;
            }
          }

          // If still empty, check mockQuizzesStore by code or title
          if (!qList || qList.length === 0) {
            const matchedMock = mockQuizzesStore.find((mq) => mq.id === q.id || mq.code === q.code || mq.title === q.title);
            if (matchedMock && matchedMock.questions.length > 0) {
              qList = matchedMock.questions;
            }
          }

          quizList.push({
            ...q,
            questions: qList,
            allowed_participants: q.allowed_participants || [],
          });
        }
        return quizList;
      }
    } catch {
      // Fallback
    }
  }
  return mockQuizzesStore;
}

export async function createQuiz(quiz: Omit<Quiz, 'id'>): Promise<Quiz> {
  const newId = `quiz-${Date.now()}`;
  const fullQuiz: Quiz = {
    id: newId,
    ...quiz,
    allowed_participants: quiz.allowed_participants || [],
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert([{ title: quiz.title, description: quiz.description, code: quiz.code, allowed_participants: quiz.allowed_participants }])
        .select()
        .single();
      if (!error && data) {
        const quizId = data.id;
        const qInserts = quiz.questions.map((q) => ({
          quiz_id: quizId,
          question_text: q.question_text,
          options: q.options,
          correct_option_index: q.correct_option_index,
          time_limit: q.time_limit,
          points: q.points,
        }));
        await supabase.from('questions').insert(qInserts);

        if (quiz.allowed_participants && quiz.allowed_participants.length > 0) {
          const pInserts = quiz.allowed_participants.map((pName, idx) => ({
            quiz_id: quizId,
            name: pName,
            avatar: avatarsList[idx % avatarsList.length],
          }));
          await supabase.from('participants').insert(pInserts);
        }

        const savedQuiz = { ...fullQuiz, id: quizId };
        mockQuizzesStore.unshift(savedQuiz);
        return savedQuiz;
      }
    } catch {
      // Fallback
    }
  }

  mockQuizzesStore.unshift(fullQuiz);

  if (quiz.allowed_participants && quiz.allowed_participants.length > 0) {
    mockParticipantsStore[newId] = quiz.allowed_participants.map((pName, idx) => ({
      id: `p-${newId}-${idx}`,
      name: pName,
      avatar: avatarsList[idx % avatarsList.length],
      quiz_id: newId,
    }));
  }

  return fullQuiz;
}

export async function deleteQuiz(quizId: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('questions').delete().eq('quiz_id', quizId);
      await supabase.from('participants').delete().eq('quiz_id', quizId);
      await supabase.from('quizzes').delete().eq('id', quizId);
    } catch (err) {
      console.warn('Supabase delete quiz error:', err);
    }
  }

  mockQuizzesStore = mockQuizzesStore.filter((q) => q.id !== quizId);
  delete mockParticipantsStore[quizId];

  return true;
}

export async function updateQuiz(quizId: string, updatedData: Partial<Quiz>): Promise<Quiz | null> {
  const existingIdx = mockQuizzesStore.findIndex((q) => q.id === quizId);

  const prev = existingIdx >= 0 ? mockQuizzesStore[existingIdx] : null;
  const updatedQuiz: Quiz = {
    id: quizId,
    title: updatedData.title || prev?.title || 'Kuis QCPP',
    description: updatedData.description !== undefined ? updatedData.description : (prev?.description || ''),
    code: updatedData.code || prev?.code || 'QCPP',
    allowed_participants: updatedData.allowed_participants || prev?.allowed_participants || [],
    questions: updatedData.questions || prev?.questions || [],
  };

  if (existingIdx >= 0) {
    mockQuizzesStore[existingIdx] = updatedQuiz;
  } else {
    mockQuizzesStore.unshift(updatedQuiz);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Update quizzes table
      await supabase
        .from('quizzes')
        .update({
          title: updatedQuiz.title,
          description: updatedQuiz.description,
          allowed_participants: updatedQuiz.allowed_participants,
        })
        .eq('id', quizId);

      // 2. Refresh questions table for this quiz_id
      if (updatedData.questions) {
        await supabase.from('questions').delete().eq('quiz_id', quizId);

        const qInserts = updatedQuiz.questions.map((q) => ({
          quiz_id: quizId,
          question_text: q.question_text,
          options: q.options,
          correct_option_index: q.correct_option_index,
          time_limit: q.time_limit || 30,
          points: q.points || 1000,
        }));

        await supabase.from('questions').insert(qInserts);
      }
    } catch (err) {
      console.warn('Supabase update quiz error:', err);
    }
  }

  return updatedQuiz;
}

// -------------------------------------------------------------
// GAME SESSIONS (HOST)
// -------------------------------------------------------------
export async function createGameSession(quizId: string): Promise<GameSession> {
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  let quiz = mockQuizzesStore.find((q) => q.id === quizId);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('quizzes').select('*, questions(*)').eq('id', quizId).single();
      if (data) {
        let qList = data.questions || [];
        if (!qList || qList.length === 0) {
          const { data: qData } = await supabase.from('questions').select('*').eq('quiz_id', quizId);
          if (qData && qData.length > 0) qList = qData;
        }
        if (qList && qList.length > 0) {
          quiz = {
            ...data,
            questions: qList,
            allowed_participants: data.allowed_participants || [],
          } as Quiz;
        }
      }
    } catch {
      // ignore
    }
  }

  if (!quiz) {
    quiz = mockQuizzesStore.find((q) => q.id === quizId || q.code.includes('CROWN')) || mockQuizzesStore[0];
  }

  // Guarantee quiz has its exact questions
  if (!quiz.questions || quiz.questions.length === 0) {
    const matched = mockQuizzesStore.find((mq) => mq.id === quizId || mq.code === quiz?.code || mq.title === quiz?.title);
    if (matched && matched.questions && matched.questions.length > 0) {
      quiz.questions = matched.questions;
    }
  }

  const session: GameSession = {
    id: `sess-${Date.now()}`,
    pin,
    quiz_id: quizId,
    quiz,
    status: 'WAITING',
    current_question_index: 0,
    question_started_at: Date.now(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .insert([{ pin, quiz_id: quizId, status: 'WAITING', current_question_index: 0 }])
        .select()
        .single();
      if (!error && data) {
        session.id = data.id;
      }
    } catch {
      // Fallback to local
    }
  }

  mockSessionsStore[session.id] = session;
  return session;
}

export async function updateGameSessionState(
  sessionId: string,
  status: 'WAITING' | 'QUESTION' | 'SHOW_RESULT' | 'LEADERBOARD' | 'FINISHED',
  questionIndex: number = 0,
  questionStartedAt?: number
): Promise<boolean> {
  const now = questionStartedAt || Date.now();
  const session = mockSessionsStore[sessionId];
  if (session) {
    session.status = status;
    session.current_question_index = questionIndex;
    session.question_started_at = now;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('game_sessions')
        .update({
          status,
          current_question_index: questionIndex,
          updated_at: new Date(now).toISOString(),
        })
        .eq('id', sessionId);
    } catch {
      // ignore
    }
  }

  notifyMockListeners(`session:${sessionId}`, {
    type: 'SESSION_UPDATED',
    status,
    questionIndex,
    questionStartedAt: now,
  });

  return true;
}

// -------------------------------------------------------------
// SESSION PARTICIPANTS (LOBBY & GAMEPLAY)
// -------------------------------------------------------------
export async function joinGameSession(
  sessionId: string,
  participantName: string,
  avatar: string = '🚀'
): Promise<SessionParticipant | null> {
  const cleanName = participantName.trim();
  const newPart: SessionParticipant = {
    id: `sp-${Date.now()}`,
    session_id: sessionId,
    participant_name: cleanName,
    avatar,
    score: 0,
    streak: 0,
  };

  if (!mockSessionParticipantsStore[sessionId]) {
    mockSessionParticipantsStore[sessionId] = [];
  }

  const existingIdx = mockSessionParticipantsStore[sessionId].findIndex(
    (p) => p.participant_name.toLowerCase() === cleanName.toLowerCase()
  );
  if (existingIdx >= 0) {
    mockSessionParticipantsStore[sessionId][existingIdx] = {
      ...mockSessionParticipantsStore[sessionId][existingIdx],
      avatar,
    };
  } else {
    mockSessionParticipantsStore[sessionId].push(newPart);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: existing } = await supabase
        .from('session_participants')
        .select('*')
        .eq('session_id', sessionId)
        .eq('participant_name', cleanName)
        .single();

      if (existing) {
        await supabase
          .from('session_participants')
          .update({ avatar })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('session_participants')
          .insert([
            {
              session_id: sessionId,
              participant_name: cleanName,
              avatar,
              score: 0,
              streak: 0,
            },
          ]);
      }
    } catch {
      // ignore
    }
  }

  notifyMockListeners(`session:${sessionId}`, {
    type: 'PLAYER_JOINED',
    participant: newPart,
    participants: mockSessionParticipantsStore[sessionId],
  });

  return newPart;
}

export async function leaveGameSession(
  sessionId: string,
  participantName: string
): Promise<boolean> {
  const cleanName = participantName.trim();

  if (mockSessionParticipantsStore[sessionId]) {
    mockSessionParticipantsStore[sessionId] = mockSessionParticipantsStore[sessionId].filter(
      (p) => p.participant_name.toLowerCase() !== cleanName.toLowerCase()
    );
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('session_participants')
        .delete()
        .eq('session_id', sessionId)
        .eq('participant_name', cleanName);
    } catch {
      // ignore
    }
  }

  notifyMockListeners(`session:${sessionId}`, {
    type: 'PLAYER_LEFT',
    participantName: cleanName,
    participants: mockSessionParticipantsStore[sessionId] || [],
  });

  return true;
}

export async function fetchSessionParticipants(sessionId?: string, currentParticipantNameOrPin?: string): Promise<SessionParticipant[]> {
  let participants: SessionParticipant[] = [];

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('session_participants').select('*');
      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }
      const { data, error } = await query;
      if (!error && data) {
        participants = data as SessionParticipant[];
      }
    } catch {
      // Fallback
    }
  }

  if (participants.length === 0 && sessionId) {
    participants = mockSessionParticipantsStore[sessionId] || [];
  } else if (participants.length === 0) {
    const allSess = Object.values(mockSessionParticipantsStore);
    if (allSess.length > 0) {
      participants = allSess[allSess.length - 1];
    }
  }

  if (currentParticipantNameOrPin) {
    const isStillIn = participants.some(
      (p) => p.participant_name.toLowerCase() === currentParticipantNameOrPin.trim().toLowerCase()
    );
    if (!isStillIn) {
      return participants;
    }
  }

  return participants;
}

export function getSessionParticipants(sessionId: string): SessionParticipant[] {
  return mockSessionParticipantsStore[sessionId] || [];
}

// -------------------------------------------------------------
// PLAYER ANSWERS & SCORE UPDATES
// -------------------------------------------------------------
export async function submitPlayerAnswer(
  sessionId: string,
  questionId: string,
  participantName: string,
  answerIndex: number,
  isCorrect: boolean,
  pointsEarned: number,
  timeTaken: number
): Promise<boolean> {
  const newAns: PlayerAnswer = {
    id: `ans-${Date.now()}`,
    session_id: sessionId,
    question_id: questionId,
    participant_name: participantName,
    answer_index: answerIndex,
    is_correct: isCorrect,
    points_earned: pointsEarned,
    time_taken: timeTaken,
  };

  if (!mockPlayerAnswersStore[sessionId]) {
    mockPlayerAnswersStore[sessionId] = [];
  }
  mockPlayerAnswersStore[sessionId].push(newAns);

  const parts = mockSessionParticipantsStore[sessionId] || [];
  const part = parts.find((p) => p.participant_name === participantName);
  if (part) {
    part.score += pointsEarned;
    part.streak = isCorrect ? part.streak + 1 : 0;
    part.last_points_gained = pointsEarned;
    part.last_is_correct = isCorrect;
    if (isCorrect) {
      part.correct_answers_count = (part.correct_answers_count || 0) + 1;
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('player_answers').insert([
        {
          session_id: sessionId,
          question_id: questionId,
          participant_name: participantName,
          answer_index: answerIndex,
          is_correct: isCorrect,
          points_earned: pointsEarned,
          time_taken: timeTaken,
        },
      ]);

      if (part) {
        await supabase
          .from('session_participants')
          .update({
            score: part.score,
            streak: part.streak,
          })
          .eq('session_id', sessionId)
          .eq('participant_name', participantName);
      }
    } catch {
      // ignore
    }
  }

  notifyMockListeners(`session:${sessionId}`, {
    type: 'ANSWER_SUBMITTED',
    answer: newAns,
    participants: parts,
  });

  return true;
}

export async function fetchPlayerAnswersForQuestion(sessionId: string, questionId: string): Promise<PlayerAnswer[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('player_answers')
        .select('*')
        .eq('session_id', sessionId)
        .eq('question_id', questionId);
      if (!error && data) {
        const latestMap = new Map<string, PlayerAnswer>();
        (data as PlayerAnswer[]).forEach((ans) => {
          latestMap.set(ans.participant_name, ans);
        });
        return Array.from(latestMap.values());
      }
    } catch {
      // Fallback
    }
  }

  const mockList = (mockPlayerAnswersStore[sessionId] || []).filter((a) => a.question_id === questionId);
  const latestMap = new Map<string, PlayerAnswer>();
  mockList.forEach((ans) => {
    latestMap.set(ans.participant_name, ans);
  });
  return Array.from(latestMap.values());
}

export function getPlayerAnswersForQuestion(sessionId: string, questionId: string): PlayerAnswer[] {
  const mockList = (mockPlayerAnswersStore[sessionId] || []).filter((a) => a.question_id === questionId);
  const latestMap = new Map<string, PlayerAnswer>();
  mockList.forEach((ans) => {
    latestMap.set(ans.participant_name, ans);
  });
  return Array.from(latestMap.values());
}

// -------------------------------------------------------------
// COMPLETED SESSIONS HISTORY REKAP
// -------------------------------------------------------------
export async function fetchCompletedSessionResults(): Promise<CompletedSessionResult[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: sessionsData, error } = await supabase
        .from('game_sessions')
        .select('*, quiz:quizzes(*)')
        .order('created_at', { ascending: false });

      if (!error && sessionsData && sessionsData.length > 0) {
        const results: CompletedSessionResult[] = [];
        for (const sess of sessionsData) {
          const parts = await fetchSessionParticipants(sess.id);
          
          let totalQ = 0;
          const { count } = await supabase
            .from('questions')
            .select('id', { count: 'exact', head: true })
            .eq('quiz_id', sess.quiz_id);

          if (count && count > 0) {
            totalQ = count;
          } else {
            const matchedQuiz = mockQuizzesStore.find((mq) => mq.id === sess.quiz_id || mq.code === sess.quiz?.code || mq.title === sess.quiz?.title);
            totalQ = matchedQuiz?.questions?.length || (sess.quiz?.questions || []).length || 4;
          }

          results.push({
            id: sess.id,
            pin: sess.pin,
            quiz_id: sess.quiz_id,
            quiz_title: sess.quiz?.title || 'Kuis QCPP',
            quiz_code: sess.quiz?.code || 'QCPP',
            created_at: sess.created_at || new Date().toISOString(),
            total_questions: totalQ,
            total_participants: parts.length,
            participants: parts.sort((a, b) => b.score - a.score),
          });
        }
        if (results.length > 0) return results;
      }
    } catch {
      // Fallback
    }
  }

  // Demo fallback results with exact questions count per quiz
  return [
    {
      id: 'sess-history-1',
      pin: '849201',
      quiz_id: 'quiz-agri-1',
      quiz_title: 'Uji Profisiensi & Pengamatan Agregat Tanah 🚜',
      quiz_code: 'QCPP-AGRI',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      total_questions: 8,
      total_participants: 21,
      participants: [
        { id: 'h1', session_id: 'sess-history-1', participant_name: 'Jaelani', avatar: '🦊', score: 7850, streak: 8, correct_answers_count: 8 },
        { id: 'h2', session_id: 'sess-history-1', participant_name: 'Revansa Helsa Kuswana', avatar: '🦄', score: 7420, streak: 7, correct_answers_count: 7 },
        { id: 'h3', session_id: 'sess-history-1', participant_name: 'Sugiyanto', avatar: '🦉', score: 6910, streak: 7, correct_answers_count: 7 },
        { id: 'h4', session_id: 'sess-history-1', participant_name: 'Tri Widodo', avatar: '🦁', score: 6540, streak: 6, correct_answers_count: 6 },
        { id: 'h5', session_id: 'sess-history-1', participant_name: 'Rafika Dewi', avatar: '🐱', score: 6210, streak: 6, correct_answers_count: 6 },
        { id: 'h6', session_id: 'sess-history-1', participant_name: 'M Iqbal Maulana', avatar: '🐯', score: 5890, streak: 5, correct_answers_count: 5 },
        { id: 'h7', session_id: 'sess-history-1', participant_name: 'Anggi Agung Pambudi', avatar: '🐼', score: 5430, streak: 5, correct_answers_count: 5 },
        { id: 'h8', session_id: 'sess-history-1', participant_name: 'Yohan Yogaswara', avatar: '🐉', score: 5120, streak: 4, correct_answers_count: 4 },
        { id: 'h9', session_id: 'sess-history-1', participant_name: 'Indra Yulianto', avatar: '🚀', score: 4800, streak: 4, correct_answers_count: 4 },
        { id: 'h10', session_id: 'sess-history-1', participant_name: 'Rizka Esty Wulandari', avatar: '🤖', score: 4350, streak: 3, correct_answers_count: 3 },
      ],
    },
    {
      id: 'sess-history-2',
      pin: '610492',
      quiz_id: 'quiz-crown-2',
      quiz_title: 'Quiz Pre Test Refresh WI 2026 (Bibit, Tanam dan Potensi Crown) 🍍',
      quiz_code: 'QCPP-CROWN',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      total_questions: 4,
      total_participants: 18,
      participants: [
        { id: 'h21', session_id: 'sess-history-2', participant_name: 'Rafika Dewi', avatar: '🦄', score: 3950, streak: 4, correct_answers_count: 4 },
        { id: 'h22', session_id: 'sess-history-2', participant_name: 'Anggi Agung Pambudi', avatar: '🐼', score: 3810, streak: 4, correct_answers_count: 4 },
        { id: 'h23', session_id: 'sess-history-2', participant_name: 'Yohan Yogaswara', avatar: '🦁', score: 2950, streak: 3, correct_answers_count: 3 },
        { id: 'h24', session_id: 'sess-history-2', participant_name: 'Zakiyatun Nafsiah', avatar: '🤖', score: 2880, streak: 3, correct_answers_count: 3 },
        { id: 'h25', session_id: 'sess-history-2', participant_name: 'Yahya Maulana', avatar: '👾', score: 1950, streak: 2, correct_answers_count: 2 },
      ],
    },
  ];
}

// -------------------------------------------------------------
// REALTIME SUBSCRIPTION SYSTEM
// -------------------------------------------------------------
export function subscribeToSession(sessionId: string, callback: (event: any) => void) {
  if (!mockBroadcasters[sessionId]) {
    mockBroadcasters[sessionId] = new Set();
  }
  mockBroadcasters[sessionId].add(callback);

  if (isSupabaseConfigured && supabase) {
    const channel = supabase
      .channel(`game_session:${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
        (payload) => {
          callback({
            type: 'SESSION_UPDATED',
            status: payload.new.status,
            questionIndex: payload.new.current_question_index,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'session_participants', filter: `session_id=eq.${sessionId}` },
        async () => {
          const parts = await fetchSessionParticipants(sessionId);
          callback({
            type: 'PLAYER_JOINED',
            participants: parts,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'player_answers', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          callback({
            type: 'ANSWER_SUBMITTED',
            answer: payload.new,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (mockBroadcasters[sessionId]) {
        mockBroadcasters[sessionId].delete(callback);
      }
    };
  }

  return () => {
    if (mockBroadcasters[sessionId]) {
      mockBroadcasters[sessionId].delete(callback);
    }
  };
}

// Export Aliases for Component Backward Compatibility
export const fetchParticipantsList = fetchParticipantsForQuiz;
export const addParticipantName = addParticipantToQuiz;
export const updateSessionStatus = updateGameSessionState;



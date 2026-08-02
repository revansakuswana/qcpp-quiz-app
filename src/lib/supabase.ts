import { createClient } from '@supabase/supabase-js';
import { Participant, Quiz, GameSession, SessionParticipant, PlayerAnswer } from '../types/quiz';

// Environmental variables read from VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Full Participant Names transcribed from image
export const INITIAL_PARTICIPANT_NAMES = [
  'Jaelani', 'Tri Widodo', 'Agustinus Triono', 'Adi Suryanto', 'Ari Wijonarto',
  'Rizky Kienzle O', 'Wondo Sudarto', 'Teguh Suwitono', 'Slamet A', 'Dwi Angga Winata',
  'Kiswatak', 'Legiyanto', 'Fauzi Darwis', 'Sudibyo', 'Sopyan',
  'Agus Susanto', 'Dicky Ari Kurniawan', 'Muhajirin', 'M. Subandi', 'Cahyono',
  'Rosidi, SAG', 'Putra Fauzan Agung', 'Rangga Paksi Herdani Putra', 'Aldi', 'Anggi Muhlisin',
  'Dwi Febri Saputra', 'Harun Abidin', 'Muhamad Anis Ikhsan', 'Rikqi Setiawan', 'Wayan Kerte',
  'Dian Arifin', 'Feri Anwar', 'Feri Eko Saputra', 'Dava Hafizza', 'Arif Waluyo Bonar',
  'Andi Angga Saputra', 'Syapriansah', 'Sindu Andion', 'Muhammad Sulthan Faris', 'I Made Cerita',
  'Beni Santoso', 'Deni Rudiyanto', 'Rama Dana', 'Rido Nusa Putra', 'Septian Adi Saputra',
  'Hamdani', 'Anggi Putra', 'Dian Candra', 'Muhammad Ilham Rasyidin', 'Tri Irwanto',
  'Suhendri', 'Wiyanto', 'Dodi Saputra', 'Hadi Irawan', 'Setiawan',
  'Tedi Hadi Suryanto', 'Agus Tiawan', 'Muhammad Dedy Prasetyo', 'Dicky Agastian', 'Yogi Sektiawan Pranoto',
  'Ivan Rivandi', 'Solikhin', 'Wahyu Darmawan', 'Ardi Abdul Majid', 'Ridho Jula Ariyanto',
  'Susilo', 'Dimas Ramadhiansyah', 'Ahmad Hafif Fauzi', 'Wiyatno', 'Achmad Inzan Masruri',
  'Ari Saputra'
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
        correct_option_index: 0, // Jawaban A
        time_limit: 20,
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
        correct_option_index: 2, // Jawaban C
        time_limit: 15,
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
        correct_option_index: 2, // Jawaban C
        time_limit: 15,
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
        correct_option_index: 0, // Jawaban A
        time_limit: 25,
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
        correct_option_index: 1, // Jawaban B
        time_limit: 15,
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
        correct_option_index: 0, // Jawaban A
        time_limit: 15,
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
        correct_option_index: 1, // Jawaban B
        time_limit: 15,
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
        correct_option_index: 0, // Jawaban A
        time_limit: 20,
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

// Service Methods (Supports both Supabase & Mock local storage seamlessly)

export async function verifyGameSessionPin(pin: string): Promise<GameSession | null> {
  const cleanPin = pin.trim();
  if (!cleanPin) return null;

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
              const matchedMock = mockQuizzesStore.find((mq) => mq.id === data.quiz_id || mq.code === data.quiz.code);
              if (matchedMock) {
                fullQuiz.questions = matchedMock.questions;
              }
            }
          }
        }

        if (!fullQuiz) {
          fullQuiz = mockQuizzesStore.find((mq) => mq.id === data.quiz_id) || mockQuizzesStore[0];
        }

        return {
          id: data.id,
          pin: data.pin,
          quiz_id: data.quiz_id,
          quiz: fullQuiz,
          status: data.status,
          current_question_index: data.current_question_index || 0,
        } as GameSession;
      }
    } catch {
      // Fallback to local check
    }
  }

  // Check mock sessions store
  const mockSess = mockSessionsStore[cleanPin] || Object.values(mockSessionsStore).find((s) => s.pin === cleanPin);
  if (mockSess) {
    return mockSess;
  }

  return null;
}

export async function fetchParticipantsList(quizId?: string, pin?: string): Promise<Participant[]> {
  let targetQuizId = quizId;
  if (!targetQuizId && pin) {
    const sess = await verifyGameSessionPin(pin);
    if (sess) {
      targetQuizId = sess.quiz_id;
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from('participants').select('*');
      if (targetQuizId) {
        query = query.eq('quiz_id', targetQuizId);
      }
      const { data, error } = await query.order('name', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as Participant[];
      }
    } catch {
      // Fallback
    }
  }

  // If specific quizId is targeted, return its allowed participants
  if (targetQuizId && mockParticipantsStore[targetQuizId]) {
    return mockParticipantsStore[targetQuizId];
  }

  if (targetQuizId) {
    const targetQuiz = mockQuizzesStore.find((q) => q.id === targetQuizId);
    if (targetQuiz && targetQuiz.allowed_participants) {
      return targetQuiz.allowed_participants.map((name, idx) => ({
        id: `p-${targetQuizId}-${idx}`,
        name,
        avatar: avatarsList[idx % avatarsList.length],
        quiz_id: targetQuizId,
      }));
    }
  }

  // Fallback to initial participant list
  return INITIAL_PARTICIPANT_NAMES.map((name, idx) => ({
    id: `p-init-${idx}`,
    name,
    avatar: avatarsList[idx % avatarsList.length],
  }));
}

export async function addParticipantName(name: string, avatar: string = '🚀', quizId?: string): Promise<Participant> {
  const cleanName = name.trim();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('participants')
        .insert([{ name: cleanName, avatar, quiz_id: quizId || null }])
        .select()
        .single();
      if (!error && data) {
        return data as Participant;
      }
    } catch {
      // Fallback to local
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

export async function fetchQuizzes(): Promise<Quiz[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*, questions(*)');
      if (!error && data && data.length > 0) {
        return data.map((q: any) => ({
          ...q,
          questions: q.questions || [],
          allowed_participants: q.allowed_participants || [],
        })) as Quiz[];
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

        // Also insert allowed participants for this quiz if provided
        if (quiz.allowed_participants && quiz.allowed_participants.length > 0) {
          const pInserts = quiz.allowed_participants.map((pName, idx) => ({
            quiz_id: quizId,
            name: pName,
            avatar: avatarsList[idx % avatarsList.length],
          }));
          await supabase.from('participants').insert(pInserts);
        }

        return { ...fullQuiz, id: quizId };
      }
    } catch {
      // Fallback
    }
  }

  mockQuizzesStore.unshift(fullQuiz);

  // Store mock participants for this new quiz
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

export async function createGameSession(quizId: string): Promise<GameSession> {
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  let quiz = mockQuizzesStore.find((q) => q.id === quizId);

  if (!quiz && isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('quizzes').select('*, questions(*)').eq('id', quizId).single();
      if (data) {
        quiz = {
          ...data,
          questions: data.questions || [],
          allowed_participants: data.allowed_participants || [],
        } as Quiz;
      }
    } catch {
      // ignore
    }
  }
  if (!quiz) quiz = mockQuizzesStore[0];

  const session: GameSession = {
    id: `sess-${Date.now()}`,
    pin,
    quiz_id: quizId,
    quiz,
    status: 'WAITING',
    current_question_index: 0,
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
      // Fallback
    }
  }

  mockSessionsStore[pin] = session;
  mockSessionParticipantsStore[session.id] = [];
  mockPlayerAnswersStore[session.id] = [];
  return session;
}

export async function joinGameSession(pin: string, participantName: string, avatar: string = '🚀'): Promise<{ session: GameSession; participant: SessionParticipant } | null> {
  const session = await verifyGameSessionPin(pin);
  if (!session) {
    return null;
  }

  const newPart: SessionParticipant = {
    id: `sp-${Date.now()}-${Math.random()}`,
    session_id: session.id,
    participant_name: participantName,
    avatar,
    score: 0,
    streak: 0,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('session_participants')
        .upsert(
          [{ session_id: session.id, participant_name: participantName, avatar, score: 0, streak: 0 }],
          { onConflict: 'session_id,participant_name' }
        )
        .select()
        .single();
      if (!error && data) {
        newPart.id = data.id;
      }
    } catch (err) {
      console.warn('Supabase join failed, falling back to local memory:', err);
    }
  }

  if (!mockSessionParticipantsStore[session.id]) {
    mockSessionParticipantsStore[session.id] = [];
  }

  const existingIdx = mockSessionParticipantsStore[session.id].findIndex((p) => p.participant_name === participantName);
  if (existingIdx >= 0) {
    mockSessionParticipantsStore[session.id][existingIdx].avatar = avatar;
  } else {
    mockSessionParticipantsStore[session.id].push(newPart);
  }

  // Broadcast join event locally
  notifyMockListeners(`session-${session.id}`, {
    type: 'PLAYER_JOINED',
    participants: mockSessionParticipantsStore[session.id],
  });

  return {
    session,
    participant: newPart,
  };
}

export async function fetchSessionParticipants(sessionId?: string, pin?: string): Promise<SessionParticipant[]> {
  let targetSessionId = sessionId;
  if (!targetSessionId && pin) {
    const sess = await verifyGameSessionPin(pin);
    if (sess) {
      targetSessionId = sess.id;
    }
  }

  if (isSupabaseConfigured && supabase && targetSessionId) {
    try {
      const { data, error } = await supabase
        .from('session_participants')
        .select('*')
        .eq('session_id', targetSessionId)
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        return data as SessionParticipant[];
      }
    } catch {
      // Fallback
    }
  }

  if (targetSessionId && mockSessionParticipantsStore[targetSessionId]) {
    return mockSessionParticipantsStore[targetSessionId];
  }

  if (pin && mockSessionsStore[pin]) {
    const sess = mockSessionsStore[pin];
    return mockSessionParticipantsStore[sess.id] || [];
  }

  return [];
}

export async function updateSessionStatus(sessionId: string, status: GameSession['status'], questionIndex?: number) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('game_sessions')
        .update({ status, current_question_index: questionIndex ?? 0 })
        .eq('id', sessionId);
    } catch {
      // Fallback
    }
  }

  Object.values(mockSessionsStore).forEach((s) => {
    if (s.id === sessionId) {
      s.status = status;
      if (questionIndex !== undefined) {
        s.current_question_index = questionIndex;
      }
    }
  });

  notifyMockListeners(`session-${sessionId}`, {
    type: 'SESSION_UPDATED',
    status,
    questionIndex,
  });
}

export async function submitPlayerAnswer(
  sessionId: string,
  questionId: string,
  participantName: string,
  answerIndex: number,
  isCorrect: boolean,
  pointsEarned: number,
  timeTaken: number
): Promise<PlayerAnswer> {
  const answer: PlayerAnswer = {
    id: `ans-${Date.now()}`,
    session_id: sessionId,
    question_id: questionId,
    participant_name: participantName,
    answer_index: answerIndex,
    is_correct: isCorrect,
    points_earned: pointsEarned,
    time_taken: timeTaken,
  };

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
        }
      ]);

      // Increment score in Supabase
      const { data: currentPart } = await supabase
        .from('session_participants')
        .select('score, streak')
        .eq('session_id', sessionId)
        .eq('participant_name', participantName)
        .single();

      if (currentPart) {
        const newScore = (currentPart.score || 0) + (isCorrect ? pointsEarned : 0);
        const newStreak = isCorrect ? (currentPart.streak || 0) + 1 : 0;
        await supabase
          .from('session_participants')
          .update({ score: newScore, streak: newStreak })
          .eq('session_id', sessionId)
          .eq('participant_name', participantName);
      }
    } catch {
      // Fallback
    }
  }

  if (!mockPlayerAnswersStore[sessionId]) {
    mockPlayerAnswersStore[sessionId] = [];
  }
  mockPlayerAnswersStore[sessionId].push(answer);

  // Update player score in session
  if (mockSessionParticipantsStore[sessionId]) {
    const part = mockSessionParticipantsStore[sessionId].find((p) => p.participant_name === participantName);
    if (part) {
      if (isCorrect) {
        part.score += pointsEarned;
        part.streak += 1;
      } else {
        part.streak = 0;
      }
      part.last_points_gained = pointsEarned;
      part.last_is_correct = isCorrect;
    }
  }

  notifyMockListeners(`session-${sessionId}`, {
    type: 'ANSWER_SUBMITTED',
    answer,
    participants: mockSessionParticipantsStore[sessionId],
  });

  return answer;
}

export function subscribeToSession(sessionId: string, callback: ListenerCallback) {
  let channel: any = null;

  if (isSupabaseConfigured && supabase) {
    try {
      channel = supabase
        .channel(`room-${sessionId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'session_participants', filter: `session_id=eq.${sessionId}` },
          async () => {
            const updated = await fetchSessionParticipants(sessionId);
            callback({ type: 'PLAYER_JOINED', participants: updated });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
          (payload: any) => {
            callback({
              type: 'SESSION_UPDATED',
              status: payload.new?.status,
              questionIndex: payload.new?.current_question_index,
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'player_answers', filter: `session_id=eq.${sessionId}` },
          async (payload: any) => {
            const updated = await fetchSessionParticipants(sessionId);
            callback({
              type: 'ANSWER_SUBMITTED',
              answer: payload.new,
              participants: updated,
            });
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Supabase Realtime subscription error:', err);
    }
  }

  // Also register local broadcaster fallback
  const channelKey = `session-${sessionId}`;
  if (!mockBroadcasters[channelKey]) {
    mockBroadcasters[channelKey] = new Set();
  }
  mockBroadcasters[channelKey].add(callback);

  return () => {
    if (channel && supabase) {
      supabase.removeChannel(channel);
    }
    if (mockBroadcasters[channelKey]) {
      mockBroadcasters[channelKey].delete(callback);
    }
  };
}

export function getSessionParticipants(sessionId: string): SessionParticipant[] {
  return mockSessionParticipantsStore[sessionId] || [];
}

export function getPlayerAnswersForQuestion(sessionId: string, questionId: string): PlayerAnswer[] {
  return (mockPlayerAnswersStore[sessionId] || []).filter((a) => a.question_id === questionId);
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  quiz_id?: string;
  created_at?: string;
}

export interface Question {
  id: string;
  question_text: string;
  options: string[]; // 4 options [Red, Blue, Yellow, Green]
  correct_option_index: number; // 0, 1, 2, or 3
  time_limit: number; // in seconds, default 20
  points: number; // default 1000
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  code: string;
  questions: Question[];
  allowed_participants?: string[]; // Participant names assigned specifically to this quiz
  created_at?: string;
}

export type GameStatus = 'WAITING' | 'QUESTION' | 'SHOW_RESULT' | 'LEADERBOARD' | 'FINISHED';

export interface GameSession {
  id: string;
  pin: string;
  quiz_id: string;
  quiz?: Quiz;
  status: GameStatus;
  current_question_index: number;
  question_started_at?: number;
  created_at?: string;
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  participant_name: string;
  avatar: string;
  score: number;
  streak: number;
  correct_answers_count?: number;
  last_points_gained?: number;
  last_is_correct?: boolean;
}

export interface PlayerAnswer {
  id: string;
  session_id: string;
  question_id: string;
  participant_name: string;
  answer_index: number;
  is_correct: boolean;
  points_earned: number;
  time_taken: number;
  created_at?: string;
}

export interface CompletedSessionResult {
  id: string;
  pin: string;
  quiz_id: string;
  quiz_title: string;
  quiz_code: string;
  created_at: string;
  total_questions: number;
  total_participants: number;
  participants: SessionParticipant[];
}

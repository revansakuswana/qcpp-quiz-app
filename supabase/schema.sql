-- =======================================================
-- QCPP QUIZ APP DATABASE SCHEMA & INITIAL SEED DATA
-- Run this SQL in your Supabase SQL Editor
-- =======================================================

-- 1. Create Quizzes Table (Includes allowed_participants per quiz)
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    code TEXT NOT NULL UNIQUE,
    allowed_participants JSONB DEFAULT '[]'::jsonb, -- List of participant names assigned to this quiz
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of 4 option strings
    correct_option_index INT NOT NULL,
    time_limit INT DEFAULT 20, -- Seconds
    points INT DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Participants Table (Linked to specific quiz_id or master)
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL DEFAULT '🚀',
    role TEXT NOT NULL DEFAULT 'peserta',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Game Sessions Table
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pin VARCHAR(6) NOT NULL UNIQUE,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'WAITING', -- WAITING, QUESTION, SHOW_RESULT, FINISHED
    current_question_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Session Participants Table
CREATE TABLE IF NOT EXISTS public.session_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    avatar TEXT DEFAULT '🚀',
    score INT DEFAULT 0,
    streak INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(session_id, participant_name)
);

-- 6. Create Player Answers Table
CREATE TABLE IF NOT EXISTS public.player_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    answer_index INT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    points_earned INT DEFAULT 0,
    time_taken FLOAT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) & Allow public read/write access for game interactions
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous full access to quizzes" ON public.quizzes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous full access to questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous full access to participants" ON public.participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous full access to game_sessions" ON public.game_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous full access to session_participants" ON public.session_participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous full access to player_answers" ON public.player_answers FOR ALL USING (true) WITH CHECK (true);

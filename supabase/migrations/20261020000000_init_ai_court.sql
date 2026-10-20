-- AI COURT PostgreSQL Database Schema
-- Migration: 20261020000000_init_ai_court.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT NOT NULL,
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  xp INTEGER DEFAULT 100,
  level INTEGER DEFAULT 1,
  rank TEXT DEFAULT 'Rookie',
  elo_rating INTEGER DEFAULT 1000,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  completed_trials INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  badges JSONB DEFAULT '["Rookie Advocate"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CASES TABLE
CREATE TABLE IF NOT EXISTS public.cases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  estimated_duration TEXT NOT NULL,
  scenario TEXT NOT NULL,
  disputed_facts JSONB NOT NULL DEFAULT '[]'::jsonb,
  prosecution_theory TEXT NOT NULL,
  defense_theory TEXT NOT NULL,
  starting_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_featured BOOLEAN DEFAULT FALSE,
  is_daily BOOLEAN DEFAULT FALSE,
  supports_ai BOOLEAN DEFAULT TRUE,
  supports_multiplayer BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LOBBIES TABLE
CREATE TABLE IF NOT EXISTS public.lobbies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_id TEXT REFERENCES public.cases(id) ON DELETE SET NULL,
  mode TEXT NOT NULL DEFAULT '1v1_friend',
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'in_progress', 'completed'
  round_duration INTEGER DEFAULT 90,
  custom_rules TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LOBBY PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.lobby_participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lobby_id UUID REFERENCES public.lobbies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'spectator', -- 'prosecution', 'defense', 'judge', 'jury', 'witness', 'spectator'
  is_ready BOOLEAN DEFAULT FALSE,
  is_ai BOOLEAN DEFAULT FALSE,
  ai_personality TEXT,
  ai_difficulty TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lobby_id, user_id)
);

-- 5. TRIALS TABLE
CREATE TABLE IF NOT EXISTS public.trials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lobby_id UUID REFERENCES public.lobbies(id) ON DELETE SET NULL,
  case_id TEXT REFERENCES public.cases(id) ON DELETE RESTRICT,
  phase TEXT NOT NULL DEFAULT 'opening',
  round_number INTEGER DEFAULT 1,
  current_turn_role TEXT NOT NULL DEFAULT 'prosecution',
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'concluded'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ARGUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.arguments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trial_id UUID REFERENCES public.trials(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  speaker_role TEXT NOT NULL,
  speaker_name TEXT NOT NULL,
  content TEXT NOT NULL,
  citations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EVIDENCE TABLE
CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trial_id UUID REFERENCES public.trials(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  source TEXT NOT NULL,
  relevance_explanation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed', -- 'proposed', 'accepted', 'challenged', 'excluded'
  submitted_by_role TEXT NOT NULL,
  challenged_reason TEXT,
  judge_ruling_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. OBJECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.objections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trial_id UUID REFERENCES public.trials(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  raised_by TEXT NOT NULL,
  speaker_name TEXT NOT NULL,
  objection_type TEXT NOT NULL, -- 'irrelevant', 'unsupported_claim', 'contradiction', 'speculation'
  reason TEXT NOT NULL,
  ruling TEXT NOT NULL, -- 'sustained', 'overruled'
  judge_explanation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. VERDICTS TABLE
CREATE TABLE IF NOT EXISTS public.verdicts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trial_id UUID REFERENCES public.trials(id) ON DELETE CASCADE,
  case_id TEXT REFERENCES public.cases(id),
  case_title TEXT NOT NULL,
  winner TEXT NOT NULL, -- 'prosecution', 'defense', 'inconclusive'
  confidence NUMERIC(5, 2) NOT NULL,
  confidence_explanation TEXT NOT NULL,
  scores JSONB NOT NULL,
  strongest_prosecution_arg TEXT,
  strongest_defense_arg TEXT,
  weakest_prosecution_claim TEXT,
  weakest_defense_claim TEXT,
  most_influential_evidence TEXT,
  key_contradictions JSONB DEFAULT '[]'::jsonb,
  judge_summary TEXT NOT NULL,
  reasoning_feedback TEXT NOT NULL,
  alternative_perspectives TEXT,
  jury_vote JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobby_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.arguments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verdicts ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can view profiles; users can update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Cases: public can view all cases; authenticated can create custom cases
CREATE POLICY "Cases are viewable by everyone" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Users can insert custom cases" ON public.cases FOR INSERT WITH CHECK (auth.uid() = created_by OR created_by IS NULL);

-- Lobbies: viewable if participant or knowing code
CREATE POLICY "Lobbies viewable by all" ON public.lobbies FOR SELECT USING (true);
CREATE POLICY "Lobbies insertable by authenticated users" ON public.lobbies FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host can update lobby" ON public.lobbies FOR UPDATE USING (auth.uid() = host_id);

-- Trials, Arguments, Evidence, Objections, Verdicts: accessible to public/participants
CREATE POLICY "Trials viewable by everyone" ON public.trials FOR SELECT USING (true);
CREATE POLICY "Trials insertable by lobby host" ON public.trials FOR INSERT WITH CHECK (true);
CREATE POLICY "Trials updatable" ON public.trials FOR UPDATE USING (true);

CREATE POLICY "Arguments viewable by everyone" ON public.arguments FOR SELECT USING (true);
CREATE POLICY "Arguments insertable" ON public.arguments FOR INSERT WITH CHECK (true);

CREATE POLICY "Evidence viewable by everyone" ON public.evidence FOR SELECT USING (true);
CREATE POLICY "Evidence insertable" ON public.evidence FOR INSERT WITH CHECK (true);
CREATE POLICY "Evidence updatable" ON public.evidence FOR UPDATE USING (true);

CREATE POLICY "Objections viewable by everyone" ON public.objections FOR SELECT USING (true);
CREATE POLICY "Objections insertable" ON public.objections FOR INSERT WITH CHECK (true);

CREATE POLICY "Verdicts viewable by everyone" ON public.verdicts FOR SELECT USING (true);
CREATE POLICY "Verdicts insertable" ON public.verdicts FOR INSERT WITH CHECK (true);

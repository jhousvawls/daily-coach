-- Daily Focus Coach Database Setup v2
-- Run this ENTIRE script in Supabase SQL Editor
-- Project: uqvsmdfcydokeaxmzfaw

-- =====================================================
-- 1. GOALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('personal', 'professional')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  target_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_modified_device TEXT,
  version INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_category ON goals(user_id, category);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only access their own goals" ON goals;
CREATE POLICY "Users can only access their own goals" ON goals
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 2. TINY GOALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tiny_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_modified_device TEXT,
  version INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_tiny_goals_user_id ON tiny_goals(user_id);
ALTER TABLE tiny_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only access their own tiny goals" ON tiny_goals;
CREATE POLICY "Users can only access their own tiny goals" ON tiny_goals
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 3. DAILY TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_modified_device TEXT,
  version INTEGER DEFAULT 1,
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON daily_tasks(user_id, date);
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only access their own daily tasks" ON daily_tasks;
CREATE POLICY "Users can only access their own daily tasks" ON daily_tasks
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 4. RECURRING TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS recurring_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  recurrence_type TEXT CHECK (recurrence_type IN ('weekly', 'monthly')),
  weekly_days INTEGER[],
  monthly_option TEXT,
  last_completed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_modified_device TEXT,
  version INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_recurring_tasks_user_id ON recurring_tasks(user_id);
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only access their own recurring tasks" ON recurring_tasks;
CREATE POLICY "Users can only access their own recurring tasks" ON recurring_tasks
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 5. USER PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_encrypted TEXT,
  reminder_time TIME DEFAULT '09:00:00',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  notifications BOOLEAN DEFAULT TRUE,
  sync_enabled BOOLEAN DEFAULT TRUE,
  show_daily_quote BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only access their own preferences" ON user_preferences;
CREATE POLICY "Users can only access their own preferences" ON user_preferences
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 6. DAILY QUOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  quote TEXT NOT NULL,
  author TEXT NOT NULL,
  mood TEXT DEFAULT 'motivational',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_modified_device TEXT,
  version INTEGER DEFAULT 1,
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_quotes_user_date ON daily_quotes(user_id, date);
ALTER TABLE daily_quotes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only access their own quotes" ON daily_quotes;
CREATE POLICY "Users can only access their own quotes" ON daily_quotes
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 7. TEAM DATA TABLE (stores team members & team config)
-- =====================================================
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- team owner/manager
  full_name TEXT NOT NULL,
  slug TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_team_members_owner ON team_members(owner_id);
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own team" ON team_members;
CREATE POLICY "Users can manage their own team" ON team_members
  FOR ALL USING ((SELECT auth.uid()) = owner_id);

-- =====================================================
-- 8. TEAM MEMBER DATA (goals, tasks etc per team member)
-- =====================================================
CREATE TABLE IF NOT EXISTS team_member_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL CHECK (data_type IN ('goals', 'tiny_goals', 'daily_tasks', 'achievement_stats')),
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, data_type)
);

CREATE INDEX IF NOT EXISTS idx_team_member_data_owner ON team_member_data(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_member_data_member ON team_member_data(member_id);
ALTER TABLE team_member_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their team member data" ON team_member_data;
CREATE POLICY "Users can manage their team member data" ON team_member_data
  FOR ALL USING ((SELECT auth.uid()) = owner_id);

-- =====================================================
-- 9. AGENCY FOCUS DATA
-- =====================================================
CREATE TABLE IF NOT EXISTS agency_focus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  quarter TEXT,
  agencies JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE agency_focus ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their agency focus" ON agency_focus;
CREATE POLICY "Users can manage their agency focus" ON agency_focus
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 10. QUARTERLY FOCUS DATA
-- =====================================================
CREATE TABLE IF NOT EXISTS quarterly_focus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  quarter TEXT,
  date_range TEXT,
  areas JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quarterly_focus ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their quarterly focus" ON quarterly_focus;
CREATE POLICY "Users can manage their quarterly focus" ON quarterly_focus
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 11. SECTION ORDER (dashboard layout)
-- =====================================================
CREATE TABLE IF NOT EXISTS section_order (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  sections JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE section_order ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their section order" ON section_order;
CREATE POLICY "Users can manage their section order" ON section_order
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 12. AUTO-UPDATE TIMESTAMPS FUNCTION & TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for all tables
DO $$ 
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'goals', 'tiny_goals', 'daily_tasks', 'recurring_tasks', 
    'user_preferences', 'daily_quotes', 'team_members', 
    'team_member_data', 'agency_focus', 'quarterly_focus', 'section_order'
  ])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%s_updated_at ON %I;
      CREATE TRIGGER update_%s_updated_at 
        BEFORE UPDATE ON %I 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    ', tbl, tbl, tbl, tbl);
  END LOOP;
END $$;

-- =====================================================
-- 13. VERIFICATION
-- =====================================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Daily Focus Coach Database Setup Script
-- Run this in Supabase SQL Editor to set up the complete database schema

-- =====================================================
-- 1. GOALS TABLE
-- =====================================================

CREATE TABLE goals (
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
  
  -- For conflict resolution
  last_modified_device TEXT,
  version INTEGER DEFAULT 1
);

-- Indexes for performance
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_category ON goals(user_id, category);
CREATE INDEX idx_goals_updated_at ON goals(updated_at);

-- Row Level Security
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own goals" ON goals
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 2. TINY GOALS TABLE
-- =====================================================

CREATE TABLE tiny_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_modified_device TEXT,
  version INTEGER DEFAULT 1
);

-- Indexes for performance
CREATE INDEX idx_tiny_goals_user_id ON tiny_goals(user_id);
CREATE INDEX idx_tiny_goals_completed ON tiny_goals(user_id, completed_at);

-- Row Level Security
ALTER TABLE tiny_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own tiny goals" ON tiny_goals
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 3. DAILY TASKS TABLE
-- =====================================================

CREATE TABLE daily_tasks (
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
  
  -- Ensure one task per user per day
  UNIQUE(user_id, date)
);

-- Indexes for performance
CREATE INDEX idx_daily_tasks_user_date ON daily_tasks(user_id, date);
CREATE INDEX idx_daily_tasks_recent ON daily_tasks(user_id, date DESC);

-- Row Level Security
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own daily tasks" ON daily_tasks
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 4. RECURRING TASKS TABLE
-- =====================================================

CREATE TABLE recurring_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  recurrence_type TEXT CHECK (recurrence_type IN ('weekly', 'monthly')),
  weekly_days INTEGER[] CHECK (
    CASE 
      WHEN recurrence_type = 'weekly' THEN weekly_days IS NOT NULL 
      ELSE weekly_days IS NULL 
    END
  ),
  monthly_option TEXT CHECK (
    CASE 
      WHEN recurrence_type = 'monthly' THEN monthly_option IN ('firstDay', 'midMonth', 'lastDay')
      ELSE monthly_option IS NULL 
    END
  ),
  last_completed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_modified_device TEXT,
  version INTEGER DEFAULT 1
);

-- Indexes for performance
CREATE INDEX idx_recurring_tasks_user_id ON recurring_tasks(user_id);
CREATE INDEX idx_recurring_tasks_type ON recurring_tasks(user_id, recurrence_type);

-- Row Level Security
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own recurring tasks" ON recurring_tasks
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 5. USER PREFERENCES TABLE
-- =====================================================

CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_encrypted TEXT, -- Encrypted OpenAI API key
  reminder_time TIME DEFAULT '09:00:00',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  notifications BOOLEAN DEFAULT TRUE,
  sync_enabled BOOLEAN DEFAULT TRUE,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own preferences" ON user_preferences
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- =====================================================
-- 6. UTILITY FUNCTIONS
-- =====================================================

-- Function to increment version for conflict resolution
-- Security: Uses empty search_path to prevent SQL injection attacks
CREATE OR REPLACE FUNCTION increment_version(table_name TEXT, record_id UUID)
RETURNS INTEGER 
SET search_path = ''
AS $$
DECLARE
  current_version INTEGER;
BEGIN
  -- Use fully qualified table names for security
  EXECUTE format('SELECT version FROM public.%I WHERE id = $1', table_name) 
  INTO current_version USING record_id;
  
  RETURN COALESCE(current_version, 0) + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp automatically
-- Security: Uses empty search_path to prevent SQL injection attacks
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =====================================================

-- Goals table trigger
CREATE TRIGGER update_goals_updated_at 
  BEFORE UPDATE ON goals 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Tiny goals table trigger
CREATE TRIGGER update_tiny_goals_updated_at 
  BEFORE UPDATE ON tiny_goals 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Daily tasks table trigger
CREATE TRIGGER update_daily_tasks_updated_at 
  BEFORE UPDATE ON daily_tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Recurring tasks table trigger
CREATE TRIGGER update_recurring_tasks_updated_at 
  BEFORE UPDATE ON recurring_tasks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- User preferences table trigger
CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Uncomment the following section if you want to insert sample data for testing
-- Note: This requires a valid user_id from auth.users table

/*
-- Insert sample goals (replace 'your-user-id' with actual user ID)
INSERT INTO goals (user_id, text, category, progress) VALUES
  ('your-user-id', 'Read 12 books this year', 'personal', 50),
  ('your-user-id', 'Launch a new personal project', 'professional', 30),
  ('your-user-id', 'Run a 10k marathon', 'personal', 10);

-- Insert sample tiny goals
INSERT INTO tiny_goals (user_id, text) VALUES
  ('your-user-id', 'Water the plants'),
  ('your-user-id', 'Reply to mom''s email'),
  ('your-user-id', 'Take out the trash');

-- Insert sample daily task
INSERT INTO daily_tasks (user_id, date, text, completed) VALUES
  ('your-user-id', CURRENT_DATE, 'Work on database implementation', false);

-- Insert sample recurring tasks
INSERT INTO recurring_tasks (user_id, text, recurrence_type, weekly_days) VALUES
  ('your-user-id', 'Take out recycling', 'weekly', ARRAY[1]), -- Monday
  ('your-user-id', 'Team standup', 'weekly', ARRAY[1,3,5]); -- Mon, Wed, Fri

INSERT INTO recurring_tasks (user_id, text, recurrence_type, monthly_option) VALUES
  ('your-user-id', 'Review monthly budget', 'monthly', 'lastDay'),
  ('your-user-id', 'Pay bills', 'monthly', 'midMonth');

-- Insert sample user preferences
INSERT INTO user_preferences (user_id, reminder_time, theme, notifications) VALUES
  ('your-user-id', '09:00:00', 'light', true);
*/

-- =====================================================
-- 9. VERIFICATION QUERIES
-- =====================================================

-- Run these queries to verify the setup was successful

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('goals', 'tiny_goals', 'daily_tasks', 'recurring_tasks', 'user_preferences')
ORDER BY table_name;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('goals', 'tiny_goals', 'daily_tasks', 'recurring_tasks', 'user_preferences');

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check indexes exist
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('goals', 'tiny_goals', 'daily_tasks', 'recurring_tasks', 'user_preferences')
ORDER BY tablename, indexname;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Your database is now ready for the Daily Focus Coach application!
-- 
-- Next steps:
-- 1. Configure authentication in Supabase dashboard
-- 2. Set up environment variables in your application
-- 3. Install @supabase/supabase-js in your React app
-- 4. Implement the services as outlined in DATABASE-IMPLEMENTATION-PLAN.md
--
-- For any issues, refer to:
-- - DATABASE-IMPLEMENTATION-PLAN.md for detailed implementation
-- - DATABASE-CHECKLIST.md for step-by-step progress tracking

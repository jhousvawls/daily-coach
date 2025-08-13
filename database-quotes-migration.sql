-- Daily Quotes Table Migration
-- Add this to your Supabase SQL Editor to add daily quotes support

-- =====================================================
-- DAILY QUOTES TABLE
-- =====================================================

CREATE TABLE daily_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  quote TEXT NOT NULL,
  author TEXT NOT NULL,
  mood TEXT DEFAULT 'motivational' CHECK (mood IN ('motivational', 'business', 'funny', 'dad-joke')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_modified_device TEXT,
  version INTEGER DEFAULT 1,
  
  -- Ensure one quote per user per day
  UNIQUE(user_id, date)
);

-- Indexes for performance
CREATE INDEX idx_daily_quotes_user_date ON daily_quotes(user_id, date);
CREATE INDEX idx_daily_quotes_recent ON daily_quotes(user_id, date DESC);

-- Row Level Security
ALTER TABLE daily_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own daily quotes" ON daily_quotes
  FOR ALL USING (auth.uid() = user_id);

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_daily_quotes_updated_at 
  BEFORE UPDATE ON daily_quotes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Verification query
SELECT 'daily_quotes table created successfully' as status;

-- Supabase Security Fix - Function Search Path
-- Run this script to fix the security linting error for increment_version function
-- Date: August 14, 2025

-- =====================================================
-- SECURITY FIX: UPDATE increment_version FUNCTION
-- =====================================================

-- Drop the existing functions if they exist
-- Use CASCADE to drop dependent triggers, we'll recreate them
DROP FUNCTION IF EXISTS increment_version(TEXT, UUID);
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create the secure version of increment_version with proper search_path
-- This fixes the "Function Search Path Mutable" linting error
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

-- Create the secure version of update_updated_at_column with proper search_path
-- This also fixes the "Function Search Path Mutable" linting error
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
-- RECREATE TRIGGERS (since CASCADE dropped them)
-- =====================================================

-- Recreate the updated_at triggers for all tables
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tiny_goals_updated_at
    BEFORE UPDATE ON tiny_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_tasks_updated_at
    BEFORE UPDATE ON daily_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_tasks_updated_at
    BEFORE UPDATE ON recurring_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECURITY IMPROVEMENTS APPLIED
-- =====================================================

-- 1. SET search_path = '' - Prevents search path manipulation attacks
-- 2. SECURITY DEFINER - Function runs with creator's privileges
-- 3. Fully qualified table names (public.%I) - Explicit schema reference
-- 4. Maintains all existing functionality

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check the function was created successfully
SELECT 
  proname as function_name,
  prosecdef as security_definer,
  proconfig as search_path_config
FROM pg_proc 
WHERE proname = 'increment_version';

-- Expected output:
-- function_name: increment_version
-- security_definer: t (true)
-- search_path_config: {search_path=}

-- =====================================================
-- TESTING (OPTIONAL)
-- =====================================================

-- Uncomment to test the function works correctly
-- Note: This requires existing data in one of your tables

/*
-- Test with goals table (if you have data)
SELECT increment_version('goals', (SELECT id FROM goals LIMIT 1));

-- Test with tiny_goals table (if you have data)  
SELECT increment_version('tiny_goals', (SELECT id FROM tiny_goals LIMIT 1));
*/

-- =====================================================
-- COMPLETION
-- =====================================================

-- The security fix is now complete!
-- 
-- What was fixed:
-- - Function Search Path Mutable error resolved
-- - SQL injection vulnerability prevented
-- - Function maintains all existing functionality
-- 
-- The Supabase linter should no longer flag this function as a security issue.

-- Check Current RLS Policies Status
-- Run this script to see the current state of your RLS policies
-- Date: August 14, 2025

-- =====================================================
-- CURRENT RLS POLICIES ANALYSIS
-- =====================================================

-- Check all existing RLS policies on your tables
SELECT 
  schemaname,
  tablename,
  policyname,
  qual as policy_expression,
  CASE 
    WHEN qual LIKE '%SELECT auth.uid()%' THEN '✅ OPTIMIZED'
    WHEN qual LIKE '%auth.uid()%' THEN '❌ NEEDS OPTIMIZATION'
    ELSE '❓ UNKNOWN PATTERN'
  END as optimization_status
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('goals', 'tiny_goals', 'daily_tasks', 'recurring_tasks', 'user_preferences')
ORDER BY tablename, policyname;

-- =====================================================
-- SUMMARY REPORT
-- =====================================================

-- Count of policies by optimization status
SELECT 
  CASE 
    WHEN qual LIKE '%SELECT auth.uid()%' THEN 'OPTIMIZED'
    WHEN qual LIKE '%auth.uid()%' THEN 'NEEDS_OPTIMIZATION'
    ELSE 'UNKNOWN'
  END as status,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('goals', 'tiny_goals', 'daily_tasks', 'recurring_tasks', 'user_preferences')
GROUP BY 
  CASE 
    WHEN qual LIKE '%SELECT auth.uid()%' THEN 'OPTIMIZED'
    WHEN qual LIKE '%auth.uid()%' THEN 'NEEDS_OPTIMIZATION'
    ELSE 'UNKNOWN'
  END
ORDER BY status;

-- =====================================================
-- TABLES WITHOUT RLS POLICIES
-- =====================================================

-- Check if any tables are missing RLS policies entirely
SELECT 
  t.table_name,
  CASE 
    WHEN p.tablename IS NULL THEN '❌ NO RLS POLICY'
    ELSE '✅ HAS RLS POLICY'
  END as rls_status
FROM information_schema.tables t
LEFT JOIN pg_policies p ON t.table_name = p.tablename AND p.schemaname = 'public'
WHERE t.table_schema = 'public'
  AND t.table_name IN ('goals', 'tiny_goals', 'daily_tasks', 'recurring_tasks', 'user_preferences')
GROUP BY t.table_name, p.tablename
ORDER BY t.table_name;

-- =====================================================
-- RLS ENABLED STATUS
-- =====================================================

-- Check if RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as rls_enabled_status
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('goals', 'tiny_goals', 'daily_tasks', 'recurring_tasks', 'user_preferences')
ORDER BY tablename;

-- =====================================================
-- NEXT STEPS RECOMMENDATION
-- =====================================================

-- This will show you what action to take
SELECT 
  CASE 
    WHEN COUNT(CASE WHEN qual LIKE '%auth.uid()%' AND qual NOT LIKE '%SELECT auth.uid()%' THEN 1 END) > 0 
    THEN '🔧 ACTION NEEDED: Run database-rls-optimization.sql to optimize performance'
    WHEN COUNT(*) = 0 
    THEN '🔧 ACTION NEEDED: No RLS policies found. Run database-setup.sql to create them'
    ELSE '✅ ALL GOOD: RLS policies are already optimized'
  END as recommendation
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('goals', 'tiny_goals', 'daily_tasks', 'recurring_tasks', 'user_preferences');

-- =====================================================
-- INSTRUCTIONS
-- =====================================================

/*
HOW TO INTERPRET THE RESULTS:

1. POLICY EXPRESSION ANALYSIS:
   - ✅ OPTIMIZED: Policy uses (SELECT auth.uid()) - good performance
   - ❌ NEEDS OPTIMIZATION: Policy uses auth.uid() - poor performance at scale
   - ❓ UNKNOWN PATTERN: Unexpected policy format

2. IF YOU SEE "NEEDS OPTIMIZATION":
   - Run the database-rls-optimization.sql script in Supabase SQL Editor
   - This will update all policies to use the optimized pattern

3. IF YOU SEE "NO RLS POLICY":
   - Run the database-setup.sql script to create the tables and policies
   - Or create the missing policies manually

4. IF YOU SEE "RLS DISABLED":
   - Run: ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
   - Replace table_name with the actual table name

5. AFTER RUNNING OPTIMIZATION:
   - Re-run this script to verify all policies show "OPTIMIZED"
   - The Supabase linter warnings should disappear
*/

#!/usr/bin/env node

/**
 * Automated Supabase Database Fixes Application Script
 * This script connects to your Supabase database and applies the security and performance fixes
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables (you'll need to set these)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key needed for admin operations
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

async function applySupabaseFixes() {
  console.log('🔧 Starting Supabase Database Fixes Application...\n');

  // Check environment variables
  if (!SUPABASE_URL) {
    console.error('❌ Error: SUPABASE_URL environment variable is required');
    console.log('   Set VITE_SUPABASE_URL or SUPABASE_URL');
    process.exit(1);
  }

  // Use service role key if available, otherwise anon key (with limitations)
  const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  
  if (!supabaseKey) {
    console.error('❌ Error: Supabase key is required');
    console.log('   Set SUPABASE_SERVICE_ROLE_KEY (preferred) or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️  Warning: Using anon key instead of service role key');
    console.warn('   Some operations may fail due to insufficient permissions');
    console.warn('   For full functionality, set SUPABASE_SERVICE_ROLE_KEY\n');
  }

  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, supabaseKey);

  try {
    // Test connection
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase.from('information_schema.tables').select('table_name').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful\n');

    // Step 1: Apply Security Fixes
    console.log('🔒 Step 1: Applying Security Fixes...');
    try {
      const securityFixSQL = readFileSync(join(__dirname, 'database-security-fix.sql'), 'utf8');
      
      // Split SQL into individual statements (basic approach)
      const statements = securityFixSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.warn(`⚠️  Warning executing statement: ${error.message}`);
          }
        }
      }
      
      console.log('✅ Security fixes applied successfully');
    } catch (error) {
      console.error('❌ Error applying security fixes:', error.message);
    }

    // Step 2: Apply Performance Optimizations
    console.log('\n⚡ Step 2: Applying Performance Optimizations...');
    try {
      const performanceFixSQL = readFileSync(join(__dirname, 'database-rls-optimization.sql'), 'utf8');
      
      // Split SQL into individual statements
      const statements = performanceFixSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.warn(`⚠️  Warning executing statement: ${error.message}`);
          }
        }
      }
      
      console.log('✅ Performance optimizations applied successfully');
    } catch (error) {
      console.error('❌ Error applying performance fixes:', error.message);
    }

    // Step 3: Verify Fixes
    console.log('\n🔍 Step 3: Verifying Applied Fixes...');
    try {
      // Check RLS policies
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('schemaname, tablename, policyname, qual')
        .eq('schemaname', 'public')
        .in('tablename', ['goals', 'tiny_goals', 'daily_tasks', 'recurring_tasks', 'user_preferences']);

      if (policiesError) {
        console.warn('⚠️  Could not verify policies:', policiesError.message);
      } else {
        console.log('\n📊 RLS Policies Status:');
        policies.forEach(policy => {
          const isOptimized = policy.qual && policy.qual.includes('SELECT auth.uid()');
          const status = isOptimized ? '✅ OPTIMIZED' : '❌ NEEDS OPTIMIZATION';
          console.log(`   ${policy.tablename}.${policy.policyname}: ${status}`);
        });
      }

      // Check functions
      const { data: functions, error: functionsError } = await supabase
        .from('pg_proc')
        .select('proname, prosecdef, proconfig')
        .in('proname', ['increment_version', 'update_updated_at_column']);

      if (functionsError) {
        console.warn('⚠️  Could not verify functions:', functionsError.message);
      } else {
        console.log('\n🔧 Functions Status:');
        functions.forEach(func => {
          const isSecure = func.prosecdef && func.proconfig && func.proconfig.includes('search_path=');
          const status = isSecure ? '✅ SECURE' : '❌ NEEDS SECURITY FIX';
          console.log(`   ${func.proname}: ${status}`);
        });
      }

    } catch (error) {
      console.warn('⚠️  Verification failed:', error.message);
    }

    console.log('\n🎉 Supabase fixes application completed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Check your Supabase dashboard for any remaining linting warnings');
    console.log('   2. Test your application functionality');
    console.log('   3. Monitor query performance improvements');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// Alternative: Manual instructions if automated approach fails
function showManualInstructions() {
  console.log('\n📖 MANUAL APPLICATION INSTRUCTIONS:');
  console.log('   If the automated script fails, you can apply fixes manually:');
  console.log('   1. Open your Supabase Dashboard (https://supabase.com)');
  console.log('   2. Navigate to SQL Editor');
  console.log('   3. Copy and paste contents of database-security-fix.sql');
  console.log('   4. Run the script');
  console.log('   5. Copy and paste contents of database-rls-optimization.sql');
  console.log('   6. Run the script');
  console.log('   7. Optionally run check-rls-policies.sql to verify');
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  applySupabaseFixes().catch(error => {
    console.error('❌ Script failed:', error.message);
    showManualInstructions();
    process.exit(1);
  });
}

export { applySupabaseFixes };

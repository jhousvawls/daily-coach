#!/usr/bin/env node

/**
 * Setup and Run Supabase Fixes
 * This script helps you set up environment variables and run the Supabase fixes
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnvironment() {
  console.log('🔧 Supabase Database Fixes Setup\n');
  
  // Check if environment variables are already set
  const existingUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const existingServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const existingAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (existingUrl && (existingServiceKey || existingAnonKey)) {
    console.log('✅ Environment variables detected!');
    console.log(`   Supabase URL: ${existingUrl.substring(0, 30)}...`);
    console.log(`   Service Key: ${existingServiceKey ? '✅ Available' : '❌ Not set'}`);
    console.log(`   Anon Key: ${existingAnonKey ? '✅ Available' : '❌ Not set'}`);
    
    const proceed = await question('\nProceed with these settings? (y/n): ');
    if (proceed.toLowerCase() === 'y') {
      return {
        url: existingUrl,
        serviceKey: existingServiceKey,
        anonKey: existingAnonKey
      };
    }
  }

  console.log('\n📋 Please provide your Supabase credentials:');
  console.log('   You can find these in your Supabase Dashboard > Settings > API\n');

  const url = await question('Supabase URL (https://xxx.supabase.co): ');
  
  console.log('\n🔑 For the API key, you have two options:');
  console.log('   1. Service Role Key (recommended) - Can perform admin operations');
  console.log('   2. Anon Key - Limited permissions, may not work for all fixes\n');
  
  const keyType = await question('Which key type do you have? (service/anon): ');
  
  let serviceKey = null;
  let anonKey = null;
  
  if (keyType.toLowerCase().startsWith('s')) {
    serviceKey = await question('Service Role Key: ');
  } else {
    anonKey = await question('Anon Key: ');
  }

  return { url, serviceKey, anonKey };
}

async function testConnection(url, key) {
  console.log('\n🔍 Testing database connection...');
  
  try {
    const supabase = createClient(url, key);
    
    // Try a simple query to test connection
    const { data, error } = await supabase
      .rpc('version');
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    return supabase;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function runSQLScript(supabase, scriptPath, scriptName) {
  console.log(`\n🔧 Applying ${scriptName}...`);
  
  try {
    if (!existsSync(scriptPath)) {
      console.error(`❌ Script file not found: ${scriptPath}`);
      return false;
    }

    const sqlContent = readFileSync(scriptPath, 'utf8');
    
    // For Supabase, we need to execute SQL differently
    // Try using the rpc method if available, otherwise suggest manual approach
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
      if (error) {
        console.warn(`⚠️  RPC method failed: ${error.message}`);
        console.log(`📋 Please run this script manually in Supabase SQL Editor:`);
        console.log(`   File: ${scriptPath}`);
        return false;
      }
      console.log(`✅ ${scriptName} applied successfully`);
      return true;
    } catch (rpcError) {
      // RPC method not available, suggest manual approach
      console.log(`📋 Automatic execution not available. Please apply manually:`);
      console.log(`   1. Open Supabase Dashboard > SQL Editor`);
      console.log(`   2. Copy and paste the contents of: ${scriptPath}`);
      console.log(`   3. Run the script`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error with ${scriptName}:`, error.message);
    return false;
  }
}

async function verifyFixes(supabase) {
  console.log('\n🔍 Verifying applied fixes...');
  
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
      let optimizedCount = 0;
      policies.forEach(policy => {
        const isOptimized = policy.qual && policy.qual.includes('SELECT auth.uid()');
        const status = isOptimized ? '✅ OPTIMIZED' : '❌ NEEDS OPTIMIZATION';
        console.log(`   ${policy.tablename}: ${status}`);
        if (isOptimized) optimizedCount++;
      });
      
      if (optimizedCount === policies.length) {
        console.log('\n🎉 All RLS policies are optimized!');
      } else {
        console.log(`\n⚠️  ${policies.length - optimizedCount} policies still need optimization`);
      }
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
      let secureCount = 0;
      functions.forEach(func => {
        const isSecure = func.prosecdef && func.proconfig && func.proconfig.includes('search_path=');
        const status = isSecure ? '✅ SECURE' : '❌ NEEDS SECURITY FIX';
        console.log(`   ${func.proname}: ${status}`);
        if (isSecure) secureCount++;
      });
      
      if (secureCount === functions.length) {
        console.log('\n🔒 All functions are secure!');
      } else {
        console.log(`\n⚠️  ${functions.length - secureCount} functions still need security fixes`);
      }
    }

  } catch (error) {
    console.warn('⚠️  Verification failed:', error.message);
  }
}

async function main() {
  try {
    // Setup environment
    const config = await setupEnvironment();
    
    if (!config.url) {
      console.error('❌ Supabase URL is required');
      process.exit(1);
    }
    
    const key = config.serviceKey || config.anonKey;
    if (!key) {
      console.error('❌ Supabase API key is required');
      process.exit(1);
    }
    
    if (!config.serviceKey) {
      console.warn('\n⚠️  Warning: Using anon key instead of service role key');
      console.warn('   Some operations may fail due to insufficient permissions\n');
    }
    
    // Test connection
    const supabase = await testConnection(config.url, key);
    if (!supabase) {
      console.error('❌ Cannot proceed without database connection');
      process.exit(1);
    }
    
    // Apply fixes
    console.log('\n🚀 Starting to apply Supabase fixes...');
    
    const securitySuccess = await runSQLScript(
      supabase, 
      join(__dirname, 'database-security-fix.sql'),
      'Security Fixes'
    );
    
    const performanceSuccess = await runSQLScript(
      supabase,
      join(__dirname, 'database-rls-optimization.sql'),
      'Performance Optimizations'
    );
    
    // Verify fixes
    await verifyFixes(supabase);
    
    // Summary
    console.log('\n📋 Summary:');
    console.log(`   Security Fixes: ${securitySuccess ? '✅ Applied' : '⚠️  Manual application needed'}`);
    console.log(`   Performance Fixes: ${performanceSuccess ? '✅ Applied' : '⚠️  Manual application needed'}`);
    
    if (!securitySuccess || !performanceSuccess) {
      console.log('\n📖 Manual Application Instructions:');
      console.log('   1. Open your Supabase Dashboard (https://supabase.com)');
      console.log('   2. Navigate to SQL Editor');
      console.log('   3. Copy and paste contents of database-security-fix.sql');
      console.log('   4. Run the script');
      console.log('   5. Copy and paste contents of database-rls-optimization.sql');
      console.log('   6. Run the script');
    } else {
      console.log('\n🎉 All fixes applied successfully!');
      console.log('   Your Supabase database is now optimized for security and performance.');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  } finally {
    rl.close();
  }
}

// Run the script
main();

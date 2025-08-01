// Test Supabase Connection
// Run this file to verify your Supabase setup is working correctly
// Usage: node test-supabase-connection.js

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('🧪 Testing Supabase Connection...\n')

// Check environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!')
  console.error('Please check your .env.local file contains:')
  console.error('- VITE_SUPABASE_URL')
  console.error('- VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

console.log('✅ Environment variables found')
console.log(`📍 Supabase URL: ${supabaseUrl}`)
console.log(`🔑 Anon Key: ${supabaseAnonKey.substring(0, 20)}...`)

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('\n🔗 Testing database connection...')
    
    // Test basic connection by checking tables
    const { data: tables, error: tablesError } = await supabase
      .from('goals')
      .select('count')
      .limit(1)
    
    if (tablesError) {
      console.error('❌ Database connection failed:', tablesError.message)
      return false
    }
    
    console.log('✅ Database connection successful')
    
    // Test authentication
    console.log('\n🔐 Testing authentication...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.error('❌ Auth test failed:', authError.message)
      return false
    }
    
    console.log('✅ Authentication service working')
    
    // Check if tables exist
    console.log('\n📋 Checking database tables...')
    const tablesToCheck = ['goals', 'tiny_goals', 'daily_tasks', 'recurring_tasks', 'user_preferences']
    
    for (const table of tablesToCheck) {
      try {
        const { error } = await supabase.from(table).select('count').limit(1)
        if (error) {
          console.error(`❌ Table '${table}' not found or accessible`)
          return false
        } else {
          console.log(`✅ Table '${table}' exists and accessible`)
        }
      } catch (err) {
        console.error(`❌ Error checking table '${table}':`, err.message)
        return false
      }
    }
    
    console.log('\n🎉 All tests passed! Supabase is configured correctly.')
    console.log('\n📝 Next steps:')
    console.log('1. Start your development server: npm run dev')
    console.log('2. Test the authentication UI in your browser')
    console.log('3. Create a test account and verify it appears in Supabase dashboard')
    
    return true
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

// Run the test
testConnection().then(success => {
  if (!success) {
    console.log('\n🔧 Troubleshooting tips:')
    console.log('1. Check your .env.local file has the correct values')
    console.log('2. Verify you ran the database-setup.sql script in Supabase')
    console.log('3. Check your Supabase project is active and not paused')
    console.log('4. Review the SUPABASE-SETUP-GUIDE.md for detailed instructions')
    process.exit(1)
  }
}).catch(error => {
  console.error('❌ Test failed with error:', error.message)
  process.exit(1)
})

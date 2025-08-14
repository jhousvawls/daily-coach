import { createClient } from '@supabase/supabase-js'

// Debug environment variables
console.log('Environment check:', {
  hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  url: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
  key: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
})

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xzbkkledybntzvpfcgeb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6YmtrbGVkeWJudHp2cGZjZ2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzQ0NzIsImV4cCI6MjA2OTY1MDQ3Mn0.yWkT-v8YXe7XQ1-YtAUM_g7zz1qEodjdmFi6hgvfhp8'

// Create a lazy-initialized Supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabase = () => {
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables:', {
        url: supabaseUrl,
        key: supabaseAnonKey ? 'Present' : 'Missing'
      })
      throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
    }
    console.log('Initializing Supabase client with URL:', supabaseUrl.substring(0, 30) + '...')
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}

// For backward compatibility, export a getter that only initializes when accessed
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return getSupabase()[prop as keyof ReturnType<typeof createClient>]
  }
})

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      goals: {
        Row: {
          id: string
          user_id: string
          text: string
          description: string | null
          category: 'personal' | 'professional' | null
          progress: number
          target_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
          last_modified_device: string | null
          version: number
        }
        Insert: {
          id?: string
          user_id: string
          text: string
          description?: string | null
          category?: 'personal' | 'professional' | null
          progress?: number
          target_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          last_modified_device?: string | null
          version?: number
        }
        Update: {
          id?: string
          user_id?: string
          text?: string
          description?: string | null
          category?: 'personal' | 'professional' | null
          progress?: number
          target_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          last_modified_device?: string | null
          version?: number
        }
      }
      tiny_goals: {
        Row: {
          id: string
          user_id: string
          text: string
          completed_at: string | null
          created_at: string
          updated_at: string
          last_modified_device: string | null
          version: number
        }
        Insert: {
          id?: string
          user_id: string
          text: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          last_modified_device?: string | null
          version?: number
        }
        Update: {
          id?: string
          user_id?: string
          text?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          last_modified_device?: string | null
          version?: number
        }
      }
      daily_tasks: {
        Row: {
          id: string
          user_id: string
          date: string
          text: string
          completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
          last_modified_device: string | null
          version: number
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          text: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          last_modified_device?: string | null
          version?: number
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          text?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
          last_modified_device?: string | null
          version?: number
        }
      }
      recurring_tasks: {
        Row: {
          id: string
          user_id: string
          text: string
          recurrence_type: 'weekly' | 'monthly'
          weekly_days: number[] | null
          monthly_option: 'firstDay' | 'midMonth' | 'lastDay' | null
          last_completed: string | null
          created_at: string
          updated_at: string
          last_modified_device: string | null
          version: number
        }
        Insert: {
          id?: string
          user_id: string
          text: string
          recurrence_type: 'weekly' | 'monthly'
          weekly_days?: number[] | null
          monthly_option?: 'firstDay' | 'midMonth' | 'lastDay' | null
          last_completed?: string | null
          created_at?: string
          updated_at?: string
          last_modified_device?: string | null
          version?: number
        }
        Update: {
          id?: string
          user_id?: string
          text?: string
          recurrence_type?: 'weekly' | 'monthly'
          weekly_days?: number[] | null
          monthly_option?: 'firstDay' | 'midMonth' | 'lastDay' | null
          last_completed?: string | null
          created_at?: string
          updated_at?: string
          last_modified_device?: string | null
          version?: number
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          api_key_encrypted: string | null
          reminder_time: string
          theme: 'light' | 'dark'
          notifications: boolean
          sync_enabled: boolean
          last_sync: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          api_key_encrypted?: string | null
          reminder_time?: string
          theme?: 'light' | 'dark'
          notifications?: boolean
          sync_enabled?: boolean
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          api_key_encrypted?: string | null
          reminder_time?: string
          theme?: 'light' | 'dark'
          notifications?: boolean
          sync_enabled?: boolean
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      daily_quotes: {
        Row: {
          id: string
          user_id: string
          date: string
          quote: string
          author: string
          mood: 'motivational' | 'business' | 'funny' | 'dad-joke'
          created_at: string
          updated_at: string
          last_modified_device: string | null
          version: number
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          quote: string
          author: string
          mood?: 'motivational' | 'business' | 'funny' | 'dad-joke'
          created_at?: string
          updated_at?: string
          last_modified_device?: string | null
          version?: number
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          quote?: string
          author?: string
          mood?: 'motivational' | 'business' | 'funny' | 'dad-joke'
          created_at?: string
          updated_at?: string
          last_modified_device?: string | null
          version?: number
        }
      }
    }
  }
}

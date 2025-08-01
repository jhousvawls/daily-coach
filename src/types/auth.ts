import type { User } from '@supabase/supabase-js'

export type AuthUser = User

export interface AuthUserProfile {
  id: string
  email?: string
  fullName?: string
  avatarUrl?: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

export interface SignUpData {
  email: string
  password: string
  fullName?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResponse {
  user: AuthUser | null
  error: string | null
}

export interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signUp: (data: SignUpData) => Promise<AuthResponse>
  signIn: (data: SignInData) => Promise<AuthResponse>
  signOut: () => Promise<{ error: string | null }>
  clearError: () => void
}

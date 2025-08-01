import { useState, useEffect } from 'react'
import { authService } from '../services/auth'
import type { AuthUser, SignUpData, SignInData } from '../types/auth'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { session, error } = await authService.getSession()
        
        if (mounted) {
          if (error) {
            setError(error)
          } else {
            setUser(session?.user ?? null)
          }
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize auth')
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      if (mounted) {
        setUser(user)
        setLoading(false)
        setError(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (data: SignUpData) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await authService.signUp(data)
      
      if (result.error) {
        setError(result.error)
      }
      
      return result
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Sign up failed'
      setError(error)
      return { user: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (data: SignInData) => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await authService.signIn(data)
      
      if (result.error) {
        setError(result.error)
      }
      
      return result
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Sign in failed'
      setError(error)
      return { user: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await authService.signOut()
      
      if (result.error) {
        setError(result.error)
      } else {
        setUser(null)
      }
      
      return result
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Sign out failed'
      setError(error)
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    clearError,
    isAuthenticated: !!user,
  }
}

// Helper hook for checking if user is authenticated
export function useAuthUser() {
  const { user, loading } = useAuth()
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
  }
}

// Helper hook for auth actions
export function useAuthActions() {
  const { signUp, signIn, signOut, clearError } = useAuth()
  
  return {
    signUp,
    signIn,
    signOut,
    clearError,
  }
}

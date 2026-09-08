import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext(null)

const DEMO_USER = {
  id: 'demo-user',
  email: 'maria@pipelinehq.demo',
  user_metadata: { full_name: 'Maria Chen', role: 'Agency Owner' },
  isDemo: true,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(supabase ? null : DEMO_USER)
  const [loading, setLoading] = useState(!!supabase)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    if (!supabase) return // no Supabase configured — demo user is already set

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = async ({ email, password }) => {
    if (!supabase) return { error: null }
    setAuthError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
    return { error }
  }

  const signUp = async ({ email, password, fullName }) => {
    if (!supabase) return { error: null }
    setAuthError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) setAuthError(error.message)
    return { error }
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  const resetPassword = async (email) => {
    if (!supabase) return { error: null }
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, loading, authError, setAuthError, signIn, signUp, signOut, resetPassword, isConfigured: !!supabase }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

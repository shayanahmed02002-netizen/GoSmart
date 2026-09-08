import React, { useState } from 'react'
import { GitBranch, Mail, Lock, User, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const inputWrapCls = 'flex items-center gap-2.5 bg-canvas border border-line rounded-lg px-3 py-2.5 focus-within:border-primary'
const inputCls = 'bg-transparent outline-none text-sm w-full placeholder:text-subink/70'

export default function LoginView() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState('signin') // signin | signup
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)

    const { error } =
      mode === 'signin'
        ? await signIn({ email, password })
        : await signUp({ email, password, fullName })

    setSubmitting(false)
    if (error) {
      setError(error)
    } else if (mode === 'signup') {
      setInfo('Account created — check your email to confirm, then sign in.')
      setMode('signin')
    }
  }

  const handleForgotPassword = async () => {
    if (!email) { setError('Enter your email above first, then click "Forgot password".'); return }
    setError(null)
    const { error } = await resetPassword(email)
    setInfo(error ? null : `Password reset email sent to ${email}.`)
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center mb-3">
            <GitBranch size={20} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-xl text-ink">Pipeline HQ</h1>
          <p className="text-sm text-subink mt-1">
            {mode === 'signin' ? 'Sign in to your workspace' : 'Create your workspace account'}
          </p>
        </div>

        <div className="bg-surface border border-line rounded-xl2 shadow-card p-6">
          <div className="flex gap-1 bg-canvas border border-line rounded-lg p-1 mb-5">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); setInfo(null) }}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'signin' ? 'bg-surface text-ink shadow-card' : 'text-subink'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setInfo(null) }}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'signup' ? 'bg-surface text-ink shadow-card' : 'text-subink'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            {mode === 'signup' && (
              <div className={inputWrapCls}>
                <User size={15} className="text-subink shrink-0" />
                <input className={inputCls} placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}

            <div className={inputWrapCls}>
              <Mail size={15} className="text-subink shrink-0" />
              <input
                type="email"
                className={inputCls}
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={inputWrapCls}>
              <Lock size={15} className="text-subink shrink-0" />
              <input
                type="password"
                className={inputCls}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            {error && <p className="text-xs text-danger bg-danger-light rounded-lg px-3 py-2">{error}</p>}
            {info && <p className="text-xs text-won bg-won-light rounded-lg px-3 py-2">{info}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {mode === 'signin' && (
            <button onClick={handleForgotPassword} type="button" className="w-full text-center text-xs text-subink hover:text-ink mt-4">
              Forgot password?
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

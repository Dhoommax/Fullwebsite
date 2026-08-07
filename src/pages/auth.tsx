import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'

export default function AuthPage(){
  const { signInWithPassword, signUp, signInWithMagicLink, sendPasswordReset, setGuest } = useAuth()
  const [mode, setMode] = useState<'login'|'register'|'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as any)?.from?.pathname || '/'

  async function handleLogin(e: React.FormEvent){
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      const res = await signInWithPassword(email, password)
      // supabase returns error in res.error or res.data
      if ((res as any)?.error) {
        setError((res as any).error.message || 'Login failed')
      } else {
        setMessage('Login successful')
        navigate(from)
      }
    } catch (err: any){
      setError(err?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  async function handleRegister(e: React.FormEvent){
    e.preventDefault()
    setError(null); setMessage(null); setLoading(true)
    try {
      const res = await signUp(email, password)
      if ((res as any)?.error) setError((res as any).error.message || 'Registration failed')
      else setMessage('Registration successful — please check your email to verify your address')
    } catch (err: any){
      setError(err?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  async function handleMagicLink(e: React.FormEvent){
    e.preventDefault(); setError(null); setMessage(null); setLoading(true)
    try {
      const res = await signInWithMagicLink(email)
      if ((res as any)?.error) setError((res as any).error.message || 'Magic link failed')
      else setMessage('Magic link sent — check your email')
    } catch (err: any){ setError(err?.message || 'Failed to send magic link') }
    finally { setLoading(false) }
  }

  async function handleForgot(e: React.FormEvent){
    e.preventDefault(); setError(null); setMessage(null); setLoading(true)
    try {
      const res = await sendPasswordReset(email)
      if ((res as any)?.error) setError((res as any).error.message || 'Failed to send password reset')
      else setMessage('Password reset email sent — check your inbox')
    } catch (err: any){ setError(err?.message || 'Failed to send password reset') }
    finally { setLoading(false) }
  }

  function continueAsGuest(){
    // Mark guest mode locally; Protected routes will still require login.
    setGuest(true)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow">
        <h3 className="text-xl font-semibold text-center">Codex AI Studio</h3>
        <p className="text-sm text-center text-slate-500 mt-1">Create voice, subtitles and videos powered by AI — start for free.</p>

        <div className="mt-4 flex justify-center gap-2">
          <button className={`px-3 py-1 rounded ${mode==='login'?'bg-violet-600 text-white':'bg-slate-100 dark:bg-slate-700'}`} onClick={()=>setMode('login')}>Login</button>
          <button className={`px-3 py-1 rounded ${mode==='register'?'bg-violet-600 text-white':'bg-slate-100 dark:bg-slate-700'}`} onClick={()=>setMode('register')}>Register</button>
          <button className={`px-3 py-1 rounded ${mode==='forgot'?'bg-violet-600 text-white':'bg-slate-100 dark:bg-slate-700'}`} onClick={()=>setMode('forgot')}>Forgot</button>
        </div>

        <form className="mt-4" onSubmit={mode==='login'?handleLogin: mode==='register'?handleRegister: mode==='forgot'?handleForgot:handleLogin}>
          <label className="block text-sm font-medium">Email</label>
          <input className="mt-1 w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />

          {mode!=='forgot' && (
            <>
              <label className="block text-sm font-medium mt-3">Password</label>
              <input type="password" className="mt-1 w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••" />
            </>
          )}

          <div className="mt-4">
            <button type="submit" disabled={loading} className="w-full px-4 py-2 rounded bg-violet-600 text-white">{loading? 'Please wait...' : (mode==='login'?'Login': mode==='register'?'Register':'Send')}</button>
          </div>
        </form>

        <div className="mt-3 flex items-center justify-between">
          <button onClick={handleMagicLink} className="text-sm text-violet-600">Send magic link</button>
          <button onClick={continueAsGuest} className="text-sm text-slate-500">Continue as guest</button>
        </div>

        {message && <div className="mt-3 text-sm text-green-600">{message}</div>}
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

        <div className="mt-4 text-xs text-slate-400">By continuing you agree to the Terms of Service and Privacy Policy.</div>
      </div>
    </div>
  )
}

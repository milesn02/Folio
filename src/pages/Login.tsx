import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export default function Login() {
  const { user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null
  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) setError(err.message)
    setSubmitting(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: 'linear-gradient(160deg, #1a3f28 0%, #112b1c 100%)' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(200,169,110,0.06) 0%, transparent 100%)',
      }} />

      <div className="relative w-full max-w-[320px] flex flex-col items-center">

        {/* Wordmark */}
        <div className="flex items-center gap-2.5 mb-2">
          <span className="font-serif text-[64px] text-white tracking-tight leading-none">Folio</span>
          <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mb-2" />
        </div>

        {/* Thin rule */}
        <div className="w-full h-px mb-10" style={{ background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.3), transparent)' }} />

        {/* Form — bare inputs on canvas */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoFocus
            className="w-full bg-transparent text-[14px] text-white placeholder:text-white/25 outline-none py-2 transition-colors"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
            onFocus={e => e.currentTarget.style.borderBottomColor = 'rgba(200,169,110,0.7)'}
            onBlur={e => e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)'}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full bg-transparent text-[14px] text-white placeholder:text-white/25 outline-none py-2 transition-colors"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
            onFocus={e => e.currentTarget.style.borderBottomColor = 'rgba(200,169,110,0.7)'}
            onBlur={e => e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.15)'}
          />

          {error && (
            <p className="text-[12px] text-red-300/80 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-lg text-[13px] font-semibold mt-2 transition-opacity disabled:opacity-50 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #c8a96e 0%, #b8924a 100%)', color: '#112b1c' }}
          >
            {submitting ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <p className="text-[11px] text-white/20 mt-8 tracking-wide">
          Contact your firm administrator for access.
        </p>
      </div>
    </div>
  )
}

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
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg, #1a3f28 0%, #142e1e 100%)' }}
    >
      {/* Subtle radial glow behind the card */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '600px', height: '600px',
          background: 'radial-gradient(ellipse, rgba(200,169,110,0.07) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        }}
      />

      <div className="relative w-full max-w-[360px] flex flex-col items-center gap-8">
        {/* Wordmark */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="font-serif text-[42px] text-white tracking-tight leading-none">Folio</span>
            <div className="w-[7px] h-[7px] rounded-full bg-accent flex-shrink-0 mb-1" />
          </div>
          <p className="text-[10px] font-bold tracking-[.2em] text-white/30 uppercase">
            Tax Advisory Platform
          </p>
        </div>

        {/* Form card */}
        <div className="w-full rounded-2xl p-7" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[.1em] text-white/30">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@firm.com"
                required
                autoFocus
                className="w-full rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(200,169,110,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[.1em] text-white/30">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/20 outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(200,169,110,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'}
              />
            </div>

            {error && (
              <p className="text-[12px] text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-1 h-11 rounded-lg text-[13px] font-semibold transition-all disabled:opacity-50 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #c8a96e, #a8863e)', color: '#1a3f28' }}
            >
              {submitting ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>

        <p className="text-[11px] text-white/20">
          Contact your firm administrator for access.
        </p>
      </div>
    </div>
  )
}

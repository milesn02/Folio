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
      className="min-h-[100dvh] flex flex-col items-center justify-center"
      style={{ background: '#132b1c' }}
    >
      {/* Subtle vignette */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 120% 80% at 50% 50%, #1a3f28 0%, #0d2016 100%)'
      }} />

      {/* Noise */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '180px 180px', opacity: 0.035,
      }} />

      <div
        className="relative w-full px-6"
        style={{ maxWidth: '380px', animation: 'enter 0.5s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        {/* Wordmark */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="font-serif text-white leading-none"
              style={{ fontSize: '76px', letterSpacing: '-2px' }}
            >
              Folio
            </span>
            <div className="rounded-full bg-accent flex-shrink-0" style={{ width: '9px', height: '9px', marginBottom: '10px' }} />
          </div>
          <p style={{ fontSize: '10px', letterSpacing: '3px', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' }}>
            Tax Advisory Platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: '14px' }}>

          {/* Email */}
          <div className="flex flex-col" style={{ gap: '7px' }}>
            <label style={{ fontSize: '10.5px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@firm.com"
              required
              autoFocus
              className="w-full text-white outline-none transition-all"
              style={{
                fontSize: '14px',
                height: '48px',
                paddingLeft: '16px',
                paddingRight: '16px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                caretColor: '#c8a96e',
              }}
              onFocus={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.11)'
                e.currentTarget.style.borderColor = 'rgba(200,169,110,0.55)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,169,110,0.08)'
              }}
              onBlur={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col" style={{ gap: '7px' }}>
            <label style={{ fontSize: '10.5px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full text-white outline-none transition-all"
              style={{
                fontSize: '14px',
                height: '48px',
                paddingLeft: '16px',
                paddingRight: '16px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                caretColor: '#c8a96e',
              }}
              onFocus={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.11)'
                e.currentTarget.style.borderColor = 'rgba(200,169,110,0.55)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(200,169,110,0.08)'
              }}
              onBlur={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '12px', color: 'rgba(252,165,165,0.8)', padding: '10px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
              {error}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full font-semibold transition-all cursor-pointer disabled:opacity-50"
            style={{
              marginTop: '6px',
              height: '50px',
              borderRadius: '10px',
              fontSize: '14px',
              background: '#c8a96e',
              color: '#0e2418',
              border: 'none',
              letterSpacing: '0.2px',
            }}
            onMouseEnter={e => !submitting && (e.currentTarget.style.background = '#d4b87d')}
            onMouseLeave={e => (e.currentTarget.style.background = '#c8a96e')}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center mt-8" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.5px' }}>
          Access by invitation only
        </p>
      </div>
    </div>
  )
}

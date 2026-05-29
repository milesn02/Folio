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
      className="min-h-[100dvh] flex flex-col items-center justify-center p-6"
      style={{ background: 'linear-gradient(160deg, #1c4530 0%, #0e2418 100%)' }}
    >
      {/* Noise layer */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '200px 200px', opacity: 0.04,
      }} />

      <div className="relative w-full max-w-[400px]" style={{ animation: 'enter 0.4s cubic-bezier(0.16,1,0.3,1) both' }}>

        {/* Wordmark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5">
            <span className="font-serif text-[52px] text-white tracking-tight leading-none">Folio</span>
            <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mb-2" />
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden" style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
          <div className="p-8">
            <p className="text-white/50 text-[13px] mb-6">Sign in to your workspace</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[.08em] text-white/40">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@firm.com"
                  required
                  autoFocus
                  className="w-full rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-white/20 outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.borderColor = 'rgba(200,169,110,0.5)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[.08em] text-white/40">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg px-4 py-3 text-[14px] text-white placeholder:text-white/25 outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                    e.currentTarget.style.borderColor = 'rgba(200,169,110,0.5)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  }}
                />
              </div>

              {error && (
                <p className="text-[12px] text-red-300/80 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-xl text-[14px] font-semibold mt-2 transition-all duration-150 disabled:opacity-50 cursor-pointer hover:opacity-90 active:scale-[0.99]"
                style={{
                  background: 'linear-gradient(135deg, #c8a96e 0%, #a8863e 100%)',
                  color: '#0e2418',
                  boxShadow: '0 4px 20px rgba(200,169,110,0.3)',
                }}
              >
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>

          {/* Card footer */}
          <div className="px-8 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.1)' }}>
            <p className="text-[11px] text-white/25 text-center">Access by invitation only</p>
          </div>
        </div>
      </div>
    </div>
  )
}

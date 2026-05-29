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
      className="min-h-[100dvh] flex flex-col items-center justify-center p-8 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #1c4530 0%, #0e2418 100%)' }}
    >
      {/* Noise texture for depth */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '700px', height: '500px',
          background: 'radial-gradient(ellipse, rgba(200,169,110,0.055) 0%, transparent 65%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -55%)',
        }}
      />

      <div className="relative w-full max-w-[300px] flex flex-col items-center">

        {/* Wordmark - enters first */}
        <div
          className="flex items-center gap-2.5 mb-3"
          style={{ animation: 'enter 0.5s cubic-bezier(0.16,1,0.3,1) both' }}
        >
          <span className="font-serif text-[58px] text-white tracking-tight leading-none">Folio</span>
          <div className="w-[7px] h-[7px] rounded-full bg-accent flex-shrink-0 mb-1.5" />
        </div>

        {/* Gold rule - enters second */}
        <div
          className="w-full h-px mb-10"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.35), transparent)',
            animation: 'enter 0.5s cubic-bezier(0.16,1,0.3,1) 0.08s both',
          }}
        />

        {/* Form - enters third */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-6"
          style={{ animation: 'enter 0.5s cubic-bezier(0.16,1,0.3,1) 0.16s both' }}
        >
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoFocus
            className="w-full bg-transparent text-[14px] text-white placeholder:text-white/30 outline-none py-2.5 transition-colors duration-200"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}
            onFocus={e => e.currentTarget.style.borderBottomColor = 'rgba(200,169,110,0.6)'}
            onBlur={e => e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.12)'}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full bg-transparent text-[14px] text-white placeholder:text-white/30 outline-none py-2.5 transition-colors duration-200"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}
            onFocus={e => e.currentTarget.style.borderBottomColor = 'rgba(200,169,110,0.6)'}
            onBlur={e => e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.12)'}
          />

          {error && (
            <p className="text-[12px] text-red-300/70 text-center -mt-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-lg text-[13px] font-semibold mt-1 transition-all duration-150 disabled:opacity-50 cursor-pointer hover:-translate-y-px active:translate-y-0 active:scale-[0.99]"
            style={{
              background: 'linear-gradient(135deg, #c8a96e 0%, #a8863e 100%)',
              color: '#0e2418',
            }}
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer - enters last */}
        <p
          className="text-[11px] text-white/18 mt-10 tracking-wider"
          style={{ animation: 'enter 0.5s cubic-bezier(0.16,1,0.3,1) 0.26s both' }}
        >
          Access by invitation only.
        </p>
      </div>
    </div>
  )
}

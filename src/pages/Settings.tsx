import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { ArrowLeft, LogOut, Link2, Check, User, Building2, Users, Calculator, Shield } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/store/uiStore'
import { Field, Avatar } from '@/components/ui'
import { inputCls } from '@/components/ui/Field'
import { AVATAR_COLORS, MASTER_SETTINGS, CUR_YEAR, DISPLAY_YEARS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { MasterSettings } from '@/lib/constants'
import { setActiveTaxSettings } from '@/lib/constants'

type Section = 'profile' | 'firm' | 'team' | 'tax' | 'account'

const NAV_ITEMS: { id: Section; label: string; icon: React.ComponentType<{ className?: string }>; adminOnly?: boolean }[] = [
  { id: 'profile',  label: 'Profile',       icon: User },
  { id: 'firm',     label: 'Firm',          icon: Building2, adminOnly: true },
  { id: 'team',     label: 'Team',          icon: Users,     adminOnly: true },
  { id: 'tax',      label: 'Tax Constants', icon: Calculator, adminOnly: true },
  { id: 'account',  label: 'Account',       icon: Shield },
]

export default function Settings() {
  const { user, profile, firm, loading } = useAuth()
  const { showToast } = useUiStore()
  const navigate = useNavigate()
  const isAdmin = profile?.role === 'owner' || profile?.role === 'admin'

  const [section, setSection] = useState<Section>('profile')
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color ?? AVATAR_COLORS[0])
  const [firmName, setFirmName] = useState(firm?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  const [taxYear, setTaxYear] = useState(CUR_YEAR)
  const [taxEdits, setTaxEdits] = useState<Record<string, Record<string, string>>>({})
  const [taxSaving, setTaxSaving] = useState(false)

  function getTaxVal(key: keyof MasterSettings): string {
    const override = taxEdits[taxYear]?.[key]
    if (override !== undefined) return override
    const stored = (firm?.tax_settings as Record<string, Record<string, number>> | undefined)?.[taxYear]?.[key as string]
    if (stored !== undefined) return String(stored)
    return String(MASTER_SETTINGS[taxYear]?.[key] ?? MASTER_SETTINGS['2026'][key])
  }
  function setTaxVal(key: keyof MasterSettings, val: string) {
    setTaxEdits(prev => ({ ...prev, [taxYear]: { ...(prev[taxYear] ?? {}), [key]: val } }))
  }

  async function saveTaxSettings() {
    if (!firm) return
    setTaxSaving(true)
    const existing = (firm.tax_settings ?? {}) as Record<string, Record<string, number>>
    const yearEdits = taxEdits[taxYear] ?? {}
    const merged: Record<string, number> = {
      ...(existing[taxYear] ?? {}),
      ...Object.fromEntries(Object.entries(yearEdits).map(([k, v]) => [k, parseFloat(v)])),
    }
    const updated = { ...existing, [taxYear]: merged }
    const { error } = await supabase.from('firms').update({ tax_settings: updated }).eq('id', firm.id)
    setTaxSaving(false)
    if (error) { showToast('Failed to save tax settings', 'error'); return }
    setActiveTaxSettings(updated)
    setTaxEdits(prev => ({ ...prev, [taxYear]: {} }))
    showToast('Tax settings saved')
  }

  const generateInvite = useCallback(async () => {
    if (!firm || !user) return
    const { data, error } = await supabase
      .from('invites')
      .insert({ firm_id: firm.id, created_by: user.id })
      .select('token')
      .single()
    if (error || !data) { showToast('Failed to generate invite', 'error'); return }
    const link = `${window.location.origin}/invite/${data.token}`
    setInviteLink(link)
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }, [firm, user, showToast])

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />

  async function saveProfile() {
    if (!user) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName, avatar_color: avatarColor })
      .eq('id', user.id)
    setSaving(false)
    if (error) showToast('Failed to save profile', 'error')
    else showToast('Profile saved')
  }

  async function saveFirm() {
    if (!firm) return
    setSaving(true)
    const { error } = await supabase.from('firms').update({ name: firmName }).eq('id', firm.id)
    setSaving(false)
    if (error) showToast('Failed to save firm', 'error')
    else showToast('Firm settings saved')
  }

  async function signOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const visibleNav = NAV_ITEMS.filter(n => !n.adminOnly || isAdmin)

  return (
    <div className="flex flex-col h-screen bg-surface overflow-hidden">

      {/* Top bar — matches main app TopBar style */}
      <div className="flex items-center h-[52px] border-b border-border/60 bg-white flex-shrink-0 px-5 gap-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-[13px] font-medium text-text-lt hover:text-text transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </button>
        <div className="flex-1 flex items-center justify-center gap-1.5">
          <span className="font-serif text-[18px] text-navy tracking-tight leading-none">Folio</span>
          <div className="w-[5px] h-[5px] rounded-full bg-accent mb-0.5" />
          <span className="text-[13px] text-text-lt font-medium">Settings</span>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-[12px] font-medium text-text-lt hover:text-danger transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>

      {/* Body: nav sidebar + content */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left nav */}
        <nav className="w-[220px] flex-shrink-0 border-r border-border bg-white flex flex-col py-4 gap-0.5 px-2">
          {visibleNav.map(item => {
            const Icon = item.icon
            const active = section === item.id
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={cn(
                  'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium text-left transition-colors',
                  active
                    ? 'bg-navy text-white'
                    : 'text-text-lt hover:text-text hover:bg-surface',
                )}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[640px] px-10 py-8">

            {/* ── Profile ─────────────────────────────── */}
            {section === 'profile' && (
              <div className="flex flex-col gap-7">
                <div>
                  <h2 className="font-serif text-[26px] text-navy tracking-tight leading-tight">Profile</h2>
                  <p className="text-[13px] text-text-lt mt-1">Your name and avatar as team members will see them.</p>
                </div>

                {/* Avatar preview */}
                <div className="flex items-center gap-5 p-5 rounded-xl border border-border bg-white">
                  <Avatar name={displayName || user.email || '?'} size="lg" color={avatarColor} />
                  <div>
                    <p className="text-[15px] font-semibold text-text leading-tight">{displayName || 'No name set'}</p>
                    <p className="text-[13px] text-text-lt mt-0.5">{user.email}</p>
                    <span className="mt-1.5 inline-block text-[11px] font-semibold uppercase tracking-[.06em] text-text-xs bg-surface border border-border px-2 py-0.5 rounded-full capitalize">
                      {profile?.role ?? 'advisor'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-5 p-5 rounded-xl border border-border bg-white">
                  <Field label="Display name">
                    <input
                      className={inputCls}
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Your name"
                    />
                  </Field>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt mb-3">Avatar color</p>
                    <div className="flex gap-2 flex-wrap">
                      {AVATAR_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setAvatarColor(c)}
                          className="w-8 h-8 rounded-full border-2 transition-all duration-150"
                          style={{
                            background: c,
                            borderColor: avatarColor === c ? c : 'transparent',
                            outline: avatarColor === c ? `3px solid ${c}` : 'none',
                            outlineOffset: '2px',
                            transform: avatarColor === c ? 'scale(1.1)' : 'scale(1)',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-1 flex items-center gap-3 border-t border-border">
                    <button
                      onClick={saveProfile}
                      disabled={saving}
                      className="px-4 py-2 rounded-lg bg-navy text-white text-[13px] font-semibold hover:bg-navy-md transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Firm ────────────────────────────────── */}
            {section === 'firm' && firm && isAdmin && (
              <div className="flex flex-col gap-7">
                <div>
                  <h2 className="font-serif text-[26px] text-navy tracking-tight leading-tight">Firm</h2>
                  <p className="text-[13px] text-text-lt mt-1">Your firm name appears on all client-facing PDFs and summaries.</p>
                </div>

                <div className="flex flex-col gap-5 p-5 rounded-xl border border-border bg-white">
                  <Field label="Firm name">
                    <input
                      className={inputCls}
                      value={firmName}
                      onChange={e => setFirmName(e.target.value)}
                      placeholder="Your firm name"
                    />
                  </Field>

                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[.05em] text-text-lt mb-0.5">Plan</p>
                      <p className="text-[14px] font-semibold text-navy capitalize">{firm.plan}</p>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-border">
                    <button
                      onClick={saveFirm}
                      disabled={saving}
                      className="px-4 py-2 rounded-lg bg-navy text-white text-[13px] font-semibold hover:bg-navy-md transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Team ────────────────────────────────── */}
            {section === 'team' && isAdmin && (
              <div className="flex flex-col gap-7">
                <div>
                  <h2 className="font-serif text-[26px] text-navy tracking-tight leading-tight">Team</h2>
                  <p className="text-[13px] text-text-lt mt-1">Invite colleagues to join your firm's workspace.</p>
                </div>

                <div className="p-5 rounded-xl border border-border bg-white flex flex-col gap-4">
                  <div>
                    <p className="text-[14px] font-semibold text-text mb-1">Invite a team member</p>
                    <p className="text-[13px] text-text-lt">Generate a one-time link. The recipient clicks it, creates an account, and joins your firm. Links expire after 7 days.</p>
                  </div>

                  <div>
                    <button
                      onClick={generateInvite}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-white text-[13px] font-semibold text-text hover:bg-surface hover:border-border-dk transition-colors cursor-pointer"
                    >
                      {copied
                        ? <><Check className="w-3.5 h-3.5 text-success" /> Copied to clipboard</>
                        : <><Link2 className="w-3.5 h-3.5" /> Generate invite link</>
                      }
                    </button>
                  </div>

                  {inviteLink && (
                    <div className="bg-surface rounded-lg border border-border px-3 py-2.5 flex items-center gap-2">
                      <span className="text-[11px] font-mono text-text-lt break-all select-text cursor-text flex-1">{inviteLink}</span>
                      <span className="text-[11px] font-semibold text-success flex-shrink-0">Copied</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Tax Constants ────────────────────────── */}
            {section === 'tax' && isAdmin && (
              <div className="flex flex-col gap-7">
                <div>
                  <h2 className="font-serif text-[26px] text-navy tracking-tight leading-tight">Tax Constants</h2>
                  <p className="text-[13px] text-text-lt mt-1">Override IRS limits and rate tables for salary schedule calculations. Defaults are pre-populated from official sources.</p>
                </div>

                <div className="rounded-xl border border-border bg-white overflow-hidden">
                  {/* Year selector */}
                  <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-text-md">Limits &amp; Rates</p>
                    <div className="flex gap-1">
                      {DISPLAY_YEARS.map(y => (
                        <button
                          key={y}
                          onClick={() => setTaxYear(y)}
                          className={cn(
                            'px-2.5 py-1 rounded-md text-[12px] font-semibold border transition-colors',
                            taxYear === y ? 'bg-navy text-white border-navy' : 'bg-white text-text-lt border-border hover:border-navy/30',
                          )}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Table header */}
                  <div className="grid px-5 py-2 bg-surface border-b border-border text-[10.5px] font-semibold uppercase tracking-[.06em] text-text-lt" style={{ gridTemplateColumns: '1fr 140px 80px' }}>
                    <span>Limit / Rate</span>
                    <span className="text-right">Value</span>
                    <span className="text-right">Unit</span>
                  </div>

                  {([
                    ['deferral',               '401(k) employee deferral',        'dollar'],
                    ['catchup50',              'Catch-up contribution (age 50+)',  'dollar'],
                    ['catchup6063',            'Catch-up contribution (age 60–63)','dollar'],
                    ['ficaRate',               'Social Security / FICA rate',      'rate'],
                    ['ficaWageLimit',          'Social Security wage base',        'dollar'],
                    ['medicareRate',           'Medicare rate',                    'rate'],
                    ['medicareAdditionalRate', 'Medicare surtax (income >$200k)',  'rate'],
                    ['medicareThreshold',      'Medicare surtax threshold',        'dollar'],
                    ['sdiRate',                'CA SDI rate',                      'rate'],
                  ] as [keyof MasterSettings, string, 'dollar' | 'rate'][]).map(([key, label, kind], i) => (
                    <div
                      key={key}
                      className={cn(
                        'grid items-center px-5 py-2.5 border-b border-border last:border-b-0',
                        i % 2 === 0 ? 'bg-white' : 'bg-surface/40',
                      )}
                      style={{ gridTemplateColumns: '1fr 140px 80px' }}
                    >
                      <span className="text-[13px] text-text">{label}</span>
                      <div className="flex justify-end">
                        <div className="relative">
                          {kind === 'dollar' && (
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-text-lt pointer-events-none">$</span>
                          )}
                          <input
                            className={cn(
                              'w-28 border border-border rounded-md text-[13px] font-semibold text-navy text-right pr-2.5 py-1.5',
                              'bg-surface focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/70 transition-all',
                              kind === 'dollar' && 'pl-5',
                            )}
                            value={getTaxVal(key)}
                            onChange={e => setTaxVal(key, e.target.value)}
                          />
                        </div>
                      </div>
                      <span className="text-[11px] text-text-xs text-right">
                        {kind === 'dollar' ? 'USD' : 'decimal'}
                      </span>
                    </div>
                  ))}

                  <div className="px-5 py-3.5 bg-surface border-t border-border flex items-center justify-between gap-3">
                    <p className="text-[12px] text-text-lt">Changes apply to all salary calculations for {firm?.name || 'this firm'}.</p>
                    <button
                      onClick={saveTaxSettings}
                      disabled={taxSaving}
                      className="px-4 py-2 rounded-lg bg-navy text-white text-[13px] font-semibold hover:bg-navy-md transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {taxSaving ? 'Saving…' : 'Save constants'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Account ──────────────────────────────── */}
            {section === 'account' && (
              <div className="flex flex-col gap-7">
                <div>
                  <h2 className="font-serif text-[26px] text-navy tracking-tight leading-tight">Account</h2>
                  <p className="text-[13px] text-text-lt mt-1">Manage your login session.</p>
                </div>

                <div className="p-5 rounded-xl border border-border bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-semibold text-text">Sign out</p>
                      <p className="text-[13px] text-text-lt mt-0.5">You'll need your email and password to sign back in.</p>
                    </div>
                    <button
                      onClick={signOut}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-danger/30 bg-danger-bg text-danger text-[13px] font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-danger/20 bg-danger-bg/30 flex flex-col gap-3">
                  <p className="text-[13px] font-semibold text-danger">Danger zone</p>
                  <p className="text-[12px] text-text-lt">To delete your account or firm data, contact your firm administrator or reach out to support.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

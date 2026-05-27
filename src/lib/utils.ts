import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { AVATAR_COLORS } from './constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a number as $1,234 */
export function fmt(v: number | string | undefined | null): string {
  const n = parseFloat(String(v ?? '').replace(/[$,]/g, ''))
  if (isNaN(n)) return String(v ?? '')
  return '$' + Math.round(n).toLocaleString()
}

/** Parse a dollar string to a float */
export function parseDollar(v: string | undefined | null): number {
  return parseFloat(String(v ?? '').replace(/[$,]/g, '')) || 0
}

/** Get client age as of the end of a given tax year */
export function ageInYear(dob: string | undefined | null, taxYear: string): number | null {
  if (!dob) return null
  const d = new Date(dob)
  if (isNaN(d.getTime())) return null
  return parseInt(taxYear) - d.getFullYear()
}

/** Deterministic avatar color from a string (initials / name) */
export function avatarColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

/** Get 1-2 initials from a name */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Relative time string ("2 hours ago") */
export function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1)  return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)   return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30)    return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

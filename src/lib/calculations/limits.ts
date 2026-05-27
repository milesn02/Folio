import { IRA_LIMITS, K401_LIMITS, HSA_LIMITS } from '../constants'
import { ageInYear } from '../utils'

export interface IraLimitResult {
  base: number; catchup: number; total: number; age: number | null
}

export function iraLimit(dob: string | undefined | null, taxYear: string): IraLimitResult {
  const lim = IRA_LIMITS[parseInt(taxYear)] ?? IRA_LIMITS[2025]
  const age = ageInYear(dob, taxYear)
  const catchup = age !== null && age >= 50 ? lim.catchup50 : 0
  return { base: lim.base, catchup, total: lim.base + catchup, age }
}

export interface K401LimitResult {
  base: number; catchup: number; total: number; age: number | null; note: string
}

export function k401Limit(dob: string | undefined | null, taxYear: string): K401LimitResult {
  const lim = K401_LIMITS[parseInt(taxYear)] ?? K401_LIMITS[2025]
  const age = ageInYear(dob, taxYear)
  let catchup = 0; let note = ''
  if (age !== null) {
    if (age >= 60 && age <= 63) { catchup = lim.catchup60; note = 'Enhanced catch-up (age 60–63, SECURE 2.0)' }
    else if (age >= 50)          { catchup = lim.catchup50; note = 'Standard catch-up (age 50+)' }
  }
  return { base: lim.base, catchup, total: lim.base + catchup, age, note }
}

export interface HsaLimitResult {
  base: number; catchup: number; total: number; age: number | null
  self: number; family: number
}

export function hsaLimit(
  dob: string | undefined | null,
  taxYear: string,
  coverage: 'self' | 'family',
): HsaLimitResult {
  const lim = HSA_LIMITS[parseInt(taxYear)] ?? HSA_LIMITS[2025]
  const age = ageInYear(dob, taxYear)
  const base = coverage === 'family' ? lim.family : lim.self
  const catchup = age !== null && age >= 55 ? lim.catchup55 : 0
  return { base, catchup, total: base + catchup, age, self: lim.self, family: lim.family }
}

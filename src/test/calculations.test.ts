import { describe, it, expect } from 'vitest'
import { calcSal } from '@/lib/calculations/salary'
import { calcSavings, calcSavingsRows } from '@/lib/calculations/savings'
import { iraLimit, k401Limit, hsaLimit } from '@/lib/calculations/limits'
import { mkClientData } from '@/lib/factory'
import { SAVS } from '@/lib/constants'

// ── Sample Client ground-truth values (from prototype) ────────
const SAMPLE_DOB = '1970-02-23'
const SAMPLE_YEAR = '2025'

describe('calcSal', () => {
  it('computes net take-home correctly for Sample Client 2025', () => {
    const d = {
      freq: 'Monthly',
      gross: '170000',
      fedWHPer: '4250',   // ~$51k / 12
      stateWHPer: '666.67', // ~$8k / 12
      localWHPer: '0',
      deferral: '31000',
      deferralType: 'Traditional' as const,
      catchup: false,
      catchupAlt: false,
      state: 'CA',
      city: '',
    }
    const result = calcSal(d, '2025')
    expect(result.gross).toBe(170000)
    expect(result.tradDefer).toBe(23500) // capped at 2025 limit
    expect(result.overLimit).toBe(true)   // 31000 > 23500
    expect(result.deferLim).toBe(23500)
    expect(result.periods).toBe(12)
    // Net should be positive
    expect(result.net).toBeGreaterThan(0)
  })

  it('applies enhanced catch-up for age 60-63', () => {
    const base = {
      freq: 'Monthly',
      gross: '200000',
      fedWHPer: '5000',
      stateWHPer: '1000',
      localWHPer: '0',
      deferral: '35000',
      deferralType: 'Traditional' as const,
      catchup: false,
      catchupAlt: true,   // age 60-63
      state: 'CA',
      city: '',
    }
    const r = calcSal(base, '2025')
    // 23500 + 11250 = 34750
    expect(r.deferLim).toBe(34750)
  })

  it('handles Roth deferral — no reduction in federal taxable wages', () => {
    const d = {
      freq: 'Monthly',
      gross: '100000',
      fedWHPer: '2000',
      stateWHPer: '500',
      localWHPer: '0',
      deferral: '10000',
      deferralType: 'Roth' as const,
      catchup: false,
      catchupAlt: false,
      state: 'CA',
      city: '',
    }
    const r = calcSal(d, '2025')
    expect(r.tradDefer).toBe(0)
    expect(r.rothDefer).toBe(10000)
    expect(r.fedTaxable).toBe(100000) // no pre-tax reduction
  })

  it('SS stops correctly when gross exceeds wage base', () => {
    const d = {
      freq: 'Monthly',
      gross: '352200', // 2× ssWage 176100
      fedWHPer: '8000',
      stateWHPer: '2000',
      localWHPer: '0',
      deferral: '0',
      deferralType: 'Traditional' as const,
      catchup: false,
      catchupAlt: false,
      state: 'CA',
      city: '',
    }
    const r = calcSal(d, '2025')
    expect(r.ssStopMonth).toBe(6) // halfway through the year
    expect(r.ssTax).toBeCloseTo(176100 * 0.062, 0)
  })
})

describe('calcSavings', () => {
  it('sums all savings amounts', () => {
    const c = mkClientData('TEST')
    const sAmts: Record<string, string> = {
      sOpt: '2093', aug: '10872', pte: '9037',
      d401: '14043', ps: '4530', db: '88335', disc: '13083',
    }
    SAVS.forEach(r => { c.sav[r.k] = { a: sAmts[r.k] ?? '', y: true, n: false } })
    expect(calcSavings(c)).toBe(141993) // sum of all amounts
  })

  it('returns 0 when no savings entered', () => {
    const c = mkClientData('EMPTY')
    expect(calcSavings(c)).toBe(0)
  })

  it('handles dollar signs and commas in amounts', () => {
    const c = mkClientData('FMT')
    c.sav.sOpt = { a: '$5,000', y: true, n: false }
    c.sav.aug  = { a: '$2,500', y: true, n: false }
    expect(calcSavings(c)).toBe(7500)
  })
})

describe('calcSavingsRows', () => {
  it('sorts rows by descending amount', () => {
    const c = mkClientData('SORT')
    c.sav.sOpt = { a: '1000', y: true, n: false }
    c.sav.aug  = { a: '5000', y: true, n: false }
    c.sav.pte  = { a: '3000', y: true, n: false }
    const rows = calcSavingsRows(c)
    expect(rows[0].amount).toBe(5000)
    expect(rows[1].amount).toBe(3000)
    expect(rows[2].amount).toBe(1000)
  })

  it('correctly computes percentage of total', () => {
    const c = mkClientData('PCT')
    c.sav.sOpt = { a: '7500', y: true, n: false }
    c.sav.aug  = { a: '2500', y: true, n: false }
    const rows = calcSavingsRows(c)
    expect(rows[0].totPct).toBe(75) // 7500/10000
    expect(rows[1].totPct).toBe(25) // 2500/10000
  })
})

describe('iraLimit', () => {
  it('adds catch-up for age 50+', () => {
    const r = iraLimit(SAMPLE_DOB, SAMPLE_YEAR) // born 1970, age 55 in 2025
    expect(r.age).toBe(55)
    expect(r.catchup).toBe(1000)
    expect(r.total).toBe(8000)
  })

  it('no catch-up for age < 50', () => {
    const r = iraLimit('2000-01-01', '2025') // age 25
    expect(r.catchup).toBe(0)
    expect(r.total).toBe(7000)
  })
})

describe('k401Limit', () => {
  it('returns enhanced catch-up for age 60-63', () => {
    const r = k401Limit('1963-01-01', '2025') // age 62
    expect(r.age).toBe(62)
    expect(r.catchup).toBe(11250)
    expect(r.total).toBe(34750) // 23500 + 11250
  })

  it('returns standard catch-up for age 50-59', () => {
    const r = k401Limit('1970-01-01', '2025') // age 55
    expect(r.catchup).toBe(7500)
    expect(r.total).toBe(31000) // 23500 + 7500
  })

  it('returns base limit for age < 50', () => {
    const r = k401Limit('1990-01-01', '2025') // age 35
    expect(r.catchup).toBe(0)
    expect(r.total).toBe(23500)
  })
})

describe('hsaLimit', () => {
  it('adds catch-up for age 55+', () => {
    const r = hsaLimit(SAMPLE_DOB, SAMPLE_YEAR, 'self') // age 55
    expect(r.catchup).toBe(1000)
    expect(r.total).toBe(5300) // 4300 + 1000
  })

  it('uses family limit when coverage is family', () => {
    const r = hsaLimit('1990-01-01', '2025', 'family') // age 35, no catch-up
    expect(r.base).toBe(8550)
    expect(r.catchup).toBe(0)
    expect(r.total).toBe(8550)
  })
})

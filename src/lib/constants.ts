import type { StrategyKey, SavingsKey, EntityType } from './types'

// ── Tabs ──────────────────────────────────────────────────────
export const TABS = [
  'snapshot', 'salary', 'payments', 'entity', 'savings',
] as const

export type TabId = typeof TABS[number]

export const TAB_LABELS: Record<TabId, string> = {
  snapshot: 'Snapshot',
  salary:   'Sal. Schedule',
  payments: 'Ind. Payments',
  entity:   'Entity Payments',
  savings:  'Tax Savings',
}

// ── Strategies ────────────────────────────────────────────────
export const SKS: StrategyKey[] = [
  'retPlan', 'pte', 'augusta', 'family',
  'backdoor', 'health', 'taxAware', 'moneyLink',
]

export const STRATEGY_LABELS: Record<StrategyKey, string> = {
  retPlan:   'Retirement plan',
  pte:       'PTE election',
  augusta:   'Augusta rule',
  family:    'Family payroll',
  backdoor:  'Backdoor Roth',
  health:    'Health savings',
  taxAware:  'Tax-aware inv',
  moneyLink: 'Money Link inv',
}

// ── Savings ───────────────────────────────────────────────────
export const SAVS: { k: SavingsKey; n: string; d: string }[] = [
  { k: 'sOpt', n: 'Salary optimization / S-Corp distributions', d: 'Optimized salary vs. distributions to reduce payroll taxes.' },
  { k: 'aug',  n: 'Augusta rule',                               d: 'Home rented to the business for qualifying meetings; tax-free to you.' },
  { k: 'pte',  n: 'Pass-through elective tax',                  d: 'Bypasses the $10,000 federal SALT deduction limit.' },
  { k: 'd401', n: '401(k) deferrals',                           d: 'Pre-tax deferrals reduce taxable income and build retirement savings.' },
  { k: 'ps',   n: 'Profit sharing 401(k)',                      d: 'Employer profit sharing contribution.' },
  { k: 'db',   n: 'Defined benefit plan (cash balance)',        d: 'Cash balance / defined benefit funding.' },
  { k: 'disc', n: 'Discretionary business expenses',            d: 'Documented discretionary business expenses that reduced taxable income.' },
]

export const SAVS_TO_SKS: Partial<Record<SavingsKey, StrategyKey>> = {
  aug:  'augusta',
  pte:  'pte',
  d401: 'retPlan',
  ps:   'retPlan',
  db:   'retPlan',
}

// ── Entity / State ────────────────────────────────────────────
export const ETYPES: EntityType[] = [
  'S-Corporation', 'C-Corporation', 'LLC', 'Partnership', 'Sole Proprietor',
]

export const STATES = ['CA', 'NY', 'TX', 'FL', 'WA', 'OR', 'NV', 'AZ', 'CO', 'IL', 'Other'] as const

export const STATE_RATES: Record<string, number | null> = {
  CA: 9.3, NY: 6.85, TX: 0, FL: 0, WA: 0,
  OR: 9.9, NV: 0,    AZ: 2.5, CO: 4.4, IL: 4.95, Other: null,
}

// ── Years ─────────────────────────────────────────────────────
const _thisYear = new Date().getFullYear()

export const YEARS: string[] = Array.from(
  { length: _thisYear + 2 - 2020 },
  (_, i) => String(2020 + i),
)

export const DISPLAY_YEARS: string[] = Array.from(
  { length: 5 },
  (_, i) => String(_thisYear - 3 + i),
)

export const CUR_YEAR = String(_thisYear)

// ── Master tax settings (per year — admin only, not user editable) ────
export interface MasterSettings {
  // 401k
  deferral: number
  catchup50: number
  catchup6063: number
  // FICA / Social Security
  ficaRate: number
  ficaWageLimit: number
  // Medicare
  medicareRate: number
  medicareAdditionalRate: number
  medicareThreshold: number
  // CA SDI
  sdiRate: number
  sdiWageLimit: number
}

export const MASTER_SETTINGS: Record<string, MasterSettings> = {
  '2023': {
    deferral: 22500, catchup50: 7500, catchup6063: 7500,
    ficaRate: 0.062, ficaWageLimit: 160200,
    medicareRate: 0.0145, medicareAdditionalRate: 0.009, medicareThreshold: 200000,
    sdiRate: 0.009, sdiWageLimit: 153164,
  },
  '2024': {
    deferral: 23000, catchup50: 7500, catchup6063: 7500,
    ficaRate: 0.062, ficaWageLimit: 168600,
    medicareRate: 0.0145, medicareAdditionalRate: 0.009, medicareThreshold: 200000,
    sdiRate: 0.011, sdiWageLimit: 9999999,
  },
  '2025': {
    deferral: 23500, catchup50: 7500, catchup6063: 11250,
    ficaRate: 0.062, ficaWageLimit: 176100,
    medicareRate: 0.0145, medicareAdditionalRate: 0.009, medicareThreshold: 200000,
    sdiRate: 0.012, sdiWageLimit: 9999999,
  },
  '2026': {
    deferral: 23500, catchup50: 7500, catchup6063: 11250,
    ficaRate: 0.062, ficaWageLimit: 184500,
    medicareRate: 0.0145, medicareAdditionalRate: 0.009, medicareThreshold: 200000,
    sdiRate: 0.013, sdiWageLimit: 9999999,
  },
}

// Mutable active settings — overridden at runtime from firm.tax_settings
export let ACTIVE_SETTINGS: Record<string, MasterSettings> = { ...MASTER_SETTINGS }

export function setActiveTaxSettings(overrides: Record<string, Record<string, number>>) {
  const merged: Record<string, MasterSettings> = { ...MASTER_SETTINGS }
  for (const [year, vals] of Object.entries(overrides)) {
    merged[year] = { ...(MASTER_SETTINGS[year] ?? MASTER_SETTINGS['2026']), ...vals } as MasterSettings
  }
  ACTIVE_SETTINGS = merged
}

// Legacy alias kept for any remaining references
export const SAL_LIMITS: Record<string, { deferral: number; catchup: number; catchupAlt: number; ssWage: number; sdiRate: number }> = {
  '2023': { deferral: 22500, catchup: 7500,  catchupAlt: 7500,  ssWage: 160200, sdiRate: 0.009 },
  '2024': { deferral: 23000, catchup: 7500,  catchupAlt: 7500,  ssWage: 168600, sdiRate: 0.011 },
  '2025': { deferral: 23500, catchup: 7500,  catchupAlt: 11250, ssWage: 176100, sdiRate: 0.012 },
  '2026': { deferral: 23500, catchup: 7500,  catchupAlt: 11250, ssWage: 184500, sdiRate: 0.013 },
}

export const FREQ_PERIODS: Record<string, number> = {
  Monthly: 12,
  'Semi-Monthly': 24,
  'Bi-Weekly': 26,
  Weekly: 52,
}

// ── IRA limits ────────────────────────────────────────────────
export const IRA_LIMITS: Record<number, { base: number; catchup50: number }> = {
  2020: { base: 6000, catchup50: 1000 },
  2021: { base: 6000, catchup50: 1000 },
  2022: { base: 6000, catchup50: 1000 },
  2023: { base: 6500, catchup50: 1000 },
  2024: { base: 7000, catchup50: 1000 },
  2025: { base: 7000, catchup50: 1000 },
  2026: { base: 7000, catchup50: 1000 },
}

// ── 401(k) limits ─────────────────────────────────────────────
export const K401_LIMITS: Record<number, { base: number; catchup50: number; catchup60: number }> = {
  2020: { base: 19500, catchup50: 6500,  catchup60: 6500 },
  2021: { base: 19500, catchup50: 6500,  catchup60: 6500 },
  2022: { base: 20500, catchup50: 6500,  catchup60: 6500 },
  2023: { base: 22500, catchup50: 7500,  catchup60: 7500 },
  2024: { base: 23000, catchup50: 7500,  catchup60: 7500 },
  2025: { base: 23500, catchup50: 7500,  catchup60: 11250 },
  2026: { base: 23500, catchup50: 7500,  catchup60: 11250 },
}

// ── HSA limits ────────────────────────────────────────────────
export const HSA_LIMITS: Record<number, { self: number; family: number; catchup55: number }> = {
  2020: { self: 3550, family: 7100, catchup55: 1000 },
  2021: { self: 3600, family: 7200, catchup55: 1000 },
  2022: { self: 3650, family: 7300, catchup55: 1000 },
  2023: { self: 3850, family: 7750, catchup55: 1000 },
  2024: { self: 4150, family: 8300, catchup55: 1000 },
  2025: { self: 4300, family: 8550, catchup55: 1000 },
  2026: { self: 4400, family: 8750, catchup55: 1000 },
}

// ── Filing statuses ───────────────────────────────────────────
export const FILING_STATUSES = [
  'Single',
  'Married Filing Jointly',
  'Married Filing Separately',
  'Head of Household',
] as const

// ── Avatar colors (assigned deterministically by initials) ────
export const AVATAR_COLORS = [
  '#1a3f28', '#2d6e42', '#5c4033', '#7d6b4f',
  '#4a5568', '#16735c', '#8b6355', '#2c5f6e',
  '#4a7c59', '#6b5040',
]

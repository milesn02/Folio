// ─────────────────────────────────────────────────────────────
// Core domain types for Folio
// ─────────────────────────────────────────────────────────────

export type Role = 'owner' | 'admin' | 'advisor' | 'readonly'
export type Plan = 'starter' | 'pro' | 'enterprise'

export interface Firm {
  id: string
  name: string
  slug: string
  plan: Plan
  created_at: string
}

export interface Profile {
  id: string
  firm_id: string
  display_name: string
  role: Role
  avatar_color: string
  created_at: string
}

// ── Strategy ──────────────────────────────────────────────────
export type StrategyKey =
  | 'retPlan'
  | 'pte'
  | 'augusta'
  | 'family'
  | 'backdoor'
  | 'health'
  | 'taxAware'
  | 'moneyLink'

export interface StrategyEntry {
  y: boolean   // active / yes
  n: boolean   // inactive / no
  d: string    // commitment date
}

export type StrategyMap = Record<StrategyKey, StrategyEntry>

// ── Savings ───────────────────────────────────────────────────
export type SavingsKey = 'sOpt' | 'aug' | 'pte' | 'd401' | 'ps' | 'db' | 'disc'

export interface SavingsEntry {
  a: string    // amount
  y: boolean
  n: boolean
}

export type SavingsMap = Record<SavingsKey, SavingsEntry>

// ── Payroll ───────────────────────────────────────────────────
export interface FamilyMember {
  name: string
  sal: string
  fWH: string
  cWH: string
}

export interface PayrollYear {
  oSal: string
  fWH: string
  cWH: string
  k401: string
  k401t: '401k' | 'Traditional' | 'Roth'
  family: FamilyMember[]
}

// ── Individual Payments ───────────────────────────────────────
export interface PayData {
  // Legacy ≤ 2025 format
  cFed: string; cCA: string
  q1f: string; q1a: boolean; q1v: boolean
  q1c: string; q1ca: boolean; q1cv: boolean
  q2f: string; q2a: boolean; q2v: boolean
  q2c: string; q2ca: boolean; q2cv: boolean
  q3f: string; q3a: boolean; q3v: boolean
  q3c: string; q3ca: boolean; q3cv: boolean
  q4f: string; q4a: boolean; q4v: boolean
  q4c: string; q4ca: boolean; q4cv: boolean
  // 2026+ format
  q1f26: string; q1f26a: boolean; q1f26v: boolean; q1f26acct: string
  q2f26: string; q2f26a: boolean; q2f26v: boolean; q2f26acct: string
  q3f26: string; q3f26a: boolean; q3f26v: boolean; q3f26acct: string
  q4f26: string; q4f26a: boolean; q4f26v: boolean; q4f26acct: string
  q1c26: string; q1c26a: boolean; q1c26v: boolean; q1c26acct: string
  q2c26: string; q2c26a: boolean; q2c26v: boolean; q2c26acct: string
  q3c26: string; q3c26a: boolean; q3c26v: boolean; q3c26acct: string
  q4c26: string; q4c26a: boolean; q4c26v: boolean; q4c26acct: string
}

// ── Entity Payments ───────────────────────────────────────────
export interface EntityPayData {
  xQ1: string; xQ1a: boolean; xQ1v: boolean
  xQ2: string; xQ2a: boolean; xQ2v: boolean
  xQ3: string; xQ3a: boolean; xQ3v: boolean
  xQ4: string; xQ4a: boolean; xQ4v: boolean
  pJ: string;  pJa: boolean; pJv: boolean
  pD: string;  pDa: boolean; pDv: boolean
}

// ── Entity ────────────────────────────────────────────────────
export type EntityType =
  | 'S-Corporation'
  | 'C-Corporation'
  | 'LLC'
  | 'Partnership'
  | 'Sole Proprietor'

export interface Entity {
  name: string
  type: EntityType
  state: string
  payData: EntityPayData
}

// ── Retirement ────────────────────────────────────────────────
export interface RetirementYear {
  oSal: string
  fWH: string
  cWH: string
  k401: string
  k401t: string
  psO: string
  dbO: string
  psE: string
  dbE: string
  pre: string
  preD: string
  ext: string
  s26: string
  k26: string
  cu26: string
}

// ── Augusta ───────────────────────────────────────────────────
export interface AugustaYear {
  rec: string
  paid: string
  date: string
  instruction: string
  savings: string
}

// ── Salary Schedule ───────────────────────────────────────────
export interface SalaryScheduleEntry {
  freq: string
  gross: string
  fedWHPer: string
  stateWHPer: string
  localWHPer: string
  deferral: string
  deferralType: 'Traditional' | 'Roth'
  catchup: boolean
  catchupAlt: boolean
  state: string
  city: string
}

// ── HSA ───────────────────────────────────────────────────────
export interface HsaYear {
  coverage: 'self' | 'family'
  contribAmt: string
  contribDate: string
  custodian: string
  acct: string
  employerContrib: string
  investedAmt: string
  investDate: string
  qualExpenses: string
  notes: string
}

// ── Backdoor Roth ─────────────────────────────────────────────
export interface RothYear {
  contribAmt: string; contribDate: string; contribDone: boolean
  convAmt: string;    convDate: string;    convDone: boolean
  institution: string; acct: string
  spouseContribAmt: string; spouseContribDate: string; spouseContribDone: boolean
  spouseConvAmt: string;    spouseConvDate: string;    spouseConvDone: boolean
  spouseInstitution: string; spouseAcct: string
  notes: string
}

// ── Client (full shape stored in `data` jsonb) ────────────────
export interface ClientData {
  key: string
  name: string
  entities: Entity[]
  adv: string
  mgr: string
  filing: string
  fr: string
  sr: string
  dob?: string
  spouse?: string
  spouseDob?: string
  strat: StrategyMap
  sav: SavingsMap
  payByYear: Record<string, PayData>
  retByYear: Record<string, RetirementYear>
  payrollByYear: Record<string, PayrollYear>
  salSched?: Record<string, Record<string, SalaryScheduleEntry>>
  augustaByYear?: Record<string, AugustaYear>
  hsaByYear?: Record<string, HsaYear>
  rothByYear?: Record<string, RothYear>
  corpNet?: string
  corpAdj?: string
  discExp?: string
  activity?: Record<string, unknown>
  notes?: Note[]
}

// ── Client (DB row) ───────────────────────────────────────────
export interface Client {
  id: string
  firm_id: string
  client_key: string
  data: ClientData
  created_by: string | null
  updated_by: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

// ── Note ──────────────────────────────────────────────────────
export type NoteCategory =
  | 'general'
  | 'strategies'
  | 'payroll'
  | 'retirement'
  | 'augusta'
  | 'roth'
  | 'hsa'

export interface Note {
  id: string
  client_id: string
  firm_id: string
  author_id: string
  category: NoteCategory
  body: string
  pinned: boolean
  created_at: string
  author?: Pick<Profile, 'display_name' | 'avatar_color'>
}

// ── Activity ──────────────────────────────────────────────────
export interface ActivityEntry {
  id: string
  client_id: string
  firm_id: string
  actor_id: string
  tab: string
  action: string
  created_at: string
  actor?: Pick<Profile, 'display_name' | 'avatar_color'>
}

// ── Salary calculation output ─────────────────────────────────
export interface SalCalcResult {
  periods: number
  gross: number
  grossPer: number
  tradDefer: number
  tradDeferPer: number
  rothDefer: number
  rothDeferPer: number
  fedTaxable: number
  fedTaxablePer: number
  fedWHPer: number
  fedWHTot: number
  ssTax: number
  ssTaxPer: number
  medTax: number
  medTaxPer: number
  ficaTot: number
  stateWHPer: number
  stateWHTot: number
  localWHPer: number
  localWHTot: number
  net: number
  netPer: number
  deferLim: number
  deferRaw: number
  overLimit: boolean
  ssStopMonth: number | null
}

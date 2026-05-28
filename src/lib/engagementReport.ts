import type { ClientData } from './types'
import { calcSavings, calcSavingsRows } from './calculations'
import { SKS, STRATEGY_LABELS, CUR_YEAR } from './constants'
import { fmt, parseDollar, quarterDate, formatDate } from './utils'

function fmtStatus(s?: string) {
  if (!s || s === 'considering') return 'Considering'
  if (s === 'committed')    return 'Committed'
  if (s === 'implementing') return 'Implementing'
  if (s === 'complete')     return 'Complete'
  return s
}

function statusColor(s?: string) {
  if (s === 'complete')     return '#16a34a'
  if (s === 'implementing') return '#2563eb'
  if (s === 'committed')    return '#d97706'
  return '#9ca3af'
}

export function exportEngagementReport(c: ClientData, firmName: string) {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const year = CUR_YEAR
  const totalSavings = calcSavings(c)
  const savRows = calcSavingsRows(c)
  const activeStrats = SKS.filter(k => c.strat[k]?.y)
  const entList = (c.entities ?? []).map(e => e.name).filter(Boolean)
  const fr = parseFloat(c.fr) || 0
  const sr = parseFloat(c.sr) || 0

  // Strategy rows
  const strategyRows = activeStrats.map(k => {
    const entry = c.strat[k]
    const savRow = savRows.find(r => r.key === k || (k === 'retPlan' && ['d401','ps','db'].includes(r.key)))
    const amount = savRow?.amount ?? 0
    const status = entry?.status ?? 'considering'
    return `
      <tr>
        <td style="padding:10px 14px;border-top:1px solid #f0f0f0;font-size:13px;color:#374151;font-weight:500">${STRATEGY_LABELS[k]}</td>
        <td style="padding:10px 14px;border-top:1px solid #f0f0f0;text-align:center">
          <span style="font-size:11px;font-weight:600;color:${statusColor(status)};background:${statusColor(status)}18;border:1px solid ${statusColor(status)}40;padding:2px 8px;border-radius:999px">${fmtStatus(status)}</span>
        </td>
        <td style="padding:10px 14px;border-top:1px solid #f0f0f0;text-align:right;font-family:'DM Serif Display',serif;font-size:15px;color:#0f1e35">${amount > 0 ? fmt(amount) : '—'}</td>
      </tr>
    `
  }).join('')

  // Quarterly payments (2026 format)
  const payData = c.payByYear?.[year]
  const qRows = [1, 2, 3, 4].map(q => {
    const fKey = `q${q}f26` as keyof typeof payData
    const cKey = `q${q}c26` as keyof typeof payData
    const fedAmt  = payData ? parseDollar(payData[fKey] as string) : 0
    const stateAmt = payData ? parseDollar(payData[cKey] as string) : 0
    const date = quarterDate(parseInt(year), q as 1|2|3|4)
    return `
      <tr>
        <td style="padding:9px 14px;border-top:1px solid #f0f0f0;font-size:13px;color:#374151">Q${q} — ${formatDate(date)}/${date.getFullYear()}</td>
        <td style="padding:9px 14px;border-top:1px solid #f0f0f0;text-align:right;font-family:'DM Serif Display',serif;font-size:14px;color:#0f1e35">${fedAmt > 0 ? fmt(fedAmt) : '—'}</td>
        <td style="padding:9px 14px;border-top:1px solid #f0f0f0;text-align:right;font-family:'DM Serif Display',serif;font-size:14px;color:#0f1e35">${stateAmt > 0 ? fmt(stateAmt) : '—'}</td>
      </tr>
    `
  }).join('')

  // Next actions (strategies not yet complete)
  const pending = activeStrats.filter(k => {
    const s = c.strat[k]?.status
    return !s || s !== 'complete'
  })
  const nextActions = pending.slice(0, 6).map(k => {
    const status = c.strat[k]?.status ?? 'considering'
    const action = status === 'considering'
      ? `Review and commit to ${STRATEGY_LABELS[k]}`
      : status === 'committed'
      ? `Begin implementing ${STRATEGY_LABELS[k]}`
      : `Complete implementation of ${STRATEGY_LABELS[k]}`
    return `<li style="margin-bottom:7px;font-size:13px;color:#374151;line-height:1.5">${action}</li>`
  }).join('')

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Engagement Report — ${c.name || 'Client'}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;color:#1a1a2e;background:#fff;padding:48px;max-width:900px;margin:0 auto}
  .section{margin-bottom:36px}
  .section-label{font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:.08em;text-transform:uppercase;margin-bottom:12px}
  .card{background:#f7f6f3;border-radius:10px;border:1px solid #e4e1da;overflow:hidden}
  table{width:100%;border-collapse:collapse}
  thead tr{background:#0f1e35}
  thead th{padding:10px 14px;text-align:left;font-size:10.5px;color:rgba(200,169,110,.85);font-weight:600;letter-spacing:.04em}
  thead th.right{text-align:right}
  thead th.center{text-align:center}
  @media print{body{padding:28px}@page{margin:1.5cm;size:letter}}
</style>
</head>
<body>

  <!-- Cover -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:3px solid #0f1e35">
    <div>
      <div style="font-size:11px;font-weight:700;color:#c8a96e;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px">Annual Engagement Report · ${year}</div>
      <div style="font-family:'DM Serif Display',serif;font-size:34px;color:#0f1e35;letter-spacing:-.5px;line-height:1.1;margin-bottom:6px">${c.name || 'Client'}</div>
      <div style="font-size:13px;color:#6b7280">${entList.join(' · ') || '—'}</div>
      ${c.filing ? `<div style="font-size:12px;color:#9ca3af;margin-top:3px">${c.filing}${c.adv ? ` · Advisor: ${c.adv}` : ''}</div>` : ''}
    </div>
    <div style="text-align:right">
      <div style="font-family:'DM Serif Display',serif;font-size:26px;color:#0f1e35;letter-spacing:-.5px">Folio</div>
      <div style="font-size:12px;color:#9ca3af;margin-top:4px">${firmName || ''}</div>
      <div style="font-size:11px;color:#c8a96e;font-weight:600;margin-top:3px;letter-spacing:.02em">CONFIDENTIAL</div>
      <div style="font-size:11px;color:#9ca3af;margin-top:2px">${today}</div>
    </div>
  </div>

  <!-- Executive Summary KPIs -->
  <div class="section">
    <div class="section-label">Executive Summary</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:0">
      ${[
        ['Est. Tax Savings', totalSavings ? fmt(totalSavings) : '—'],
        ['Strategies Active', `${activeStrats.length} / ${SKS.length}`],
        ['Combined Rate', fr || sr ? `${(fr + sr).toFixed(1)}%` : '—'],
        ['Filing Status', c.filing || '—'],
      ].map(([label, value]) => `
        <div style="background:#f7f6f3;border-radius:9px;padding:14px 16px;border:1px solid #e4e1da">
          <div style="font-size:10px;color:#9ca3af;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px">${label}</div>
          <div style="font-size:16px;font-family:'DM Serif Display',serif;color:#0f1e35">${value}</div>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Strategies -->
  <div class="section">
    <div class="section-label">Strategy Status & Savings</div>
    <div class="card">
      <table>
        <thead><tr>
          <th>Strategy</th>
          <th class="center">Status</th>
          <th class="right">Est. Savings</th>
        </tr></thead>
        <tbody>
          ${strategyRows || '<tr><td colspan="3" style="padding:16px 14px;font-size:13px;color:#9ca3af;font-style:italic">No active strategies</td></tr>'}
          <tr style="background:#f7f6f3">
            <td colspan="2" style="padding:12px 14px;font-size:13px;font-weight:700;color:#0f1e35">Total estimated tax savings</td>
            <td style="padding:12px 14px;text-align:right;font-family:'DM Serif Display',serif;font-size:18px;color:#0f1e35">${fmt(totalSavings)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Payment Schedule -->
  ${payData ? `
  <div class="section">
    <div class="section-label">Estimated Tax Payment Schedule — ${year}</div>
    <div class="card">
      <table>
        <thead><tr>
          <th>Quarter</th>
          <th class="right">Federal</th>
          <th class="right">State</th>
        </tr></thead>
        <tbody>${qRows}</tbody>
      </table>
    </div>
  </div>
  ` : ''}

  <!-- Next Actions -->
  ${nextActions ? `
  <div class="section">
    <div class="section-label">Recommended Next Actions</div>
    <div style="background:#f7f6f3;border-radius:10px;border:1px solid #e4e1da;padding:18px 20px">
      <ul style="list-style:disc;padding-left:18px">${nextActions}</ul>
    </div>
  </div>
  ` : ''}

  <!-- Disclaimer -->
  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #e4e1da">
    <p style="font-size:10px;color:#9ca3af;line-height:1.65;margin-bottom:10px">
      This report is prepared for informational and planning purposes only. It does not constitute tax advice and
      should not be relied upon as such. All figures are estimates based on information provided and are subject
      to change. Consult a qualified tax advisor before making any financial decisions.
      ${firmName ? firmName + ' and its advisors assume' : 'The preparer assumes'} no liability for actions
      taken based on this report.
    </p>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:11px;color:#9ca3af">Prepared by ${firmName || 'Folio'} · ${today}</div>
      <div style="font-size:11px;color:#c8a96e;font-weight:600;letter-spacing:.03em">CONFIDENTIAL</div>
    </div>
  </div>

  <script>window.onload=function(){window.print();}<\/script>
</body>
</html>`

  const w = window.open('', '_blank')
  if (w) { w.document.write(html); w.document.close() }
}

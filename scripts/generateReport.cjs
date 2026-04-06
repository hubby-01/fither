const fs = require('fs')
const path = require('path')
const XLSX = require('xlsx')

// ─── Read and parse results.json ─────────────────────────────
const resultsPath = path.join(__dirname, '..', 'tests', 'results.json')
const raw = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'))

const testSuites = raw.testResults || []

// ─── Gather all individual tests ─────────────────────────────
const allTests = []
for (const suite of testSuites) {
  const filename = path.basename(suite.name || '')
  const phaseMatch = filename.match(/phase(\d+)/)
  const phase = phaseMatch ? `Phase ${phaseMatch[1]}` : filename

  for (const tc of suite.assertionResults || []) {
    const suiteName = tc.ancestorTitles?.join(' > ') || ''
    allTests.push({
      phase,
      suite: suiteName,
      name: tc.title || tc.fullName || '',
      status: (tc.status || 'unknown').toUpperCase(),
      duration: tc.duration != null ? Math.round(tc.duration * 10) / 10 : 0,
      error: tc.failureMessages?.length ? tc.failureMessages.join('\n').slice(0, 500) : '',
    })
  }
}

const totalTests = allTests.length
const passed = allTests.filter(t => t.status === 'PASSED').length
const failed = allTests.filter(t => t.status === 'FAILED').length
const skipped = allTests.filter(t => t.status !== 'PASSED' && t.status !== 'FAILED').length
const passRate = totalTests > 0 ? Math.round((passed / totalTests) * 1000) / 10 : 0
const duration = raw.startTime && raw.testResults?.length
  ? Math.round((Date.now() - raw.startTime))
  : 0

// Normalize status display
function displayStatus(s) {
  if (s === 'PASSED') return 'PASS'
  if (s === 'FAILED') return 'FAIL'
  return 'SKIP'
}

// ─── Styling helpers ─────────────────────────────────────────
const HEADER_FILL = { fgColor: { rgb: 'BE123C' } }
const HEADER_FONT = { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }
const FAIL_FILL = { fgColor: { rgb: 'FFE0E0' } }
const ROSE50_FILL = { fgColor: { rgb: 'FFF1F2' } }
const WHITE_FILL = { fgColor: { rgb: 'FFFFFF' } }

function applyHeaderStyle(ws, colCount) {
  for (let c = 0; c < colCount; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c })
    if (!ws[addr]) continue
    ws[addr].s = { fill: HEADER_FILL, font: HEADER_FONT }
  }
}

function setColWidths(ws, widths) {
  ws['!cols'] = widths.map(w => ({ wch: Math.max(w, 18) }))
}

function freezeTopRow(ws) {
  ws['!freeze'] = { xSplit: 0, ySplit: 1 }
}

// ─── Sheet 1: Summary ───────────────────────────────────────
const summaryData = [
  ['Total Tests', 'Passed', 'Failed', 'Skipped', 'Pass Rate %', 'Run Date', 'Duration (ms)'],
  [totalTests, passed, failed, skipped, passRate, new Date().toISOString().split('T')[0], raw.startTime ? Math.round((Date.now() - raw.startTime)) : 'N/A'],
]
const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
applyHeaderStyle(wsSummary, 7)
setColWidths(wsSummary, [18, 18, 18, 18, 18, 22, 20])
freezeTopRow(wsSummary)

// ─── Sheet 2: All Tests ─────────────────────────────────────
const allTestsHeader = ['#', 'Phase', 'Test Suite', 'Test Name', 'Status', 'Duration (ms)', 'Error']
const allTestsRows = allTests.map((t, i) => [
  i + 1, t.phase, t.suite, t.name, displayStatus(t.status), t.duration, t.error,
])
const wsAll = XLSX.utils.aoa_to_sheet([allTestsHeader, ...allTestsRows])
applyHeaderStyle(wsAll, 7)
setColWidths(wsAll, [6, 18, 30, 45, 10, 18, 50])
freezeTopRow(wsAll)

// Style rows
for (let r = 1; r <= allTestsRows.length; r++) {
  const status = allTestsRows[r - 1][4]
  const fill = status === 'FAIL' ? FAIL_FILL : (r % 2 === 0 ? ROSE50_FILL : WHITE_FILL)
  for (let c = 0; c < 7; c++) {
    const addr = XLSX.utils.encode_cell({ r, c })
    if (!wsAll[addr]) wsAll[addr] = { v: '', t: 's' }
    wsAll[addr].s = { fill }
  }
}

// ─── Sheet 3: Failed Tests Only ─────────────────────────────
const failedTests = allTests.filter(t => t.status === 'FAILED')
const failedHeader = ['#', 'Phase', 'Test Suite', 'Test Name', 'Status', 'Duration (ms)', 'Error']
let failedRows
if (failedTests.length === 0) {
  failedRows = [['', '', 'All tests passed ✓', '', '', '', '']]
} else {
  failedRows = failedTests.map((t, i) => [
    i + 1, t.phase, t.suite, t.name, 'FAIL', t.duration, t.error,
  ])
}
const wsFailed = XLSX.utils.aoa_to_sheet([failedHeader, ...failedRows])
applyHeaderStyle(wsFailed, 7)
setColWidths(wsFailed, [6, 18, 30, 45, 10, 18, 50])
freezeTopRow(wsFailed)

for (let r = 1; r <= failedRows.length; r++) {
  for (let c = 0; c < 7; c++) {
    const addr = XLSX.utils.encode_cell({ r, c })
    if (!wsFailed[addr]) wsFailed[addr] = { v: '', t: 's' }
    wsFailed[addr].s = { fill: failedTests.length > 0 ? FAIL_FILL : WHITE_FILL }
  }
}

// ─── Sheet 4: Phase Summary ─────────────────────────────────
const phases = {}
for (const t of allTests) {
  if (!phases[t.phase]) phases[t.phase] = { total: 0, passed: 0, failed: 0 }
  phases[t.phase].total++
  if (t.status === 'PASSED') phases[t.phase].passed++
  if (t.status === 'FAILED') phases[t.phase].failed++
}

// Sort phases numerically
const phaseKeys = Object.keys(phases).sort((a, b) => {
  const na = parseInt(a.replace(/\D/g, '')) || 0
  const nb = parseInt(b.replace(/\D/g, '')) || 0
  return na - nb
})

const phaseSummaryHeader = ['Phase', 'Total', 'Passed', 'Failed', 'Pass Rate %']
const phaseSummaryRows = phaseKeys.map(p => {
  const d = phases[p]
  const rate = d.total > 0 ? Math.round((d.passed / d.total) * 1000) / 10 : 0
  return [p, d.total, d.passed, d.failed, rate]
})

const wsPhase = XLSX.utils.aoa_to_sheet([phaseSummaryHeader, ...phaseSummaryRows])
applyHeaderStyle(wsPhase, 5)
setColWidths(wsPhase, [18, 18, 18, 18, 18])
freezeTopRow(wsPhase)

for (let r = 1; r <= phaseSummaryRows.length; r++) {
  const hasFails = phaseSummaryRows[r - 1][3] > 0
  if (hasFails) {
    for (let c = 0; c < 5; c++) {
      const addr = XLSX.utils.encode_cell({ r, c })
      if (!wsPhase[addr]) wsPhase[addr] = { v: '', t: 's' }
      wsPhase[addr].s = { fill: FAIL_FILL }
    }
  }
}

// ─── Build workbook and write ────────────────────────────────
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')
XLSX.utils.book_append_sheet(wb, wsAll, 'All Tests')
XLSX.utils.book_append_sheet(wb, wsFailed, 'Failed Tests Only')
XLSX.utils.book_append_sheet(wb, wsPhase, 'Phase Summary')

const outPath = path.join(__dirname, '..', 'fither-test-report.xlsx')
XLSX.writeFile(wb, outPath)

console.log(`✓ Report generated: ${outPath}`)
console.log(`  Total: ${totalTests} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped} | Pass Rate: ${passRate}%`)

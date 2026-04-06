import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Guide from '../src/pages/Guide'

function renderGuide() {
  return render(
    <MemoryRouter initialEntries={['/guide']}>
      <Routes>
        <Route path="/guide" element={<Guide />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Guide page', () => {
  it('renders without crashing', () => {
    renderGuide()
    expect(screen.getByText('Guide')).toBeInTheDocument()
  })

  it('weekly split section is present', () => {
    renderGuide()
    expect(screen.getByTestId('weekly-split-section')).toBeInTheDocument()
  })

  it('all 7 days appear in the weekly split', () => {
    renderGuide()
    const rows = screen.getAllByTestId('weekly-split-row')
    expect(rows).toHaveLength(7)
  })

  it("Monday shows 'Full Body A'", () => {
    renderGuide()
    const rows = screen.getAllByTestId('weekly-split-row')
    // Monday is index 1 in WEEKLY_PLAN, but row[1] in table
    const mondayRow = rows[1]
    expect(mondayRow.textContent).toContain('Monday')
    expect(mondayRow.textContent).toContain('Full Body A')
  })

  it("Thursday shows 'Active Recovery'", () => {
    renderGuide()
    const rows = screen.getAllByTestId('weekly-split-row')
    const thursdayRow = rows[4]
    expect(thursdayRow.textContent).toContain('Thursday')
    expect(thursdayRow.textContent).toContain('Active Recovery')
  })

  it("Sunday shows 'Rest'", () => {
    renderGuide()
    const rows = screen.getAllByTestId('weekly-split-row')
    const sundayRow = rows[0]
    expect(sundayRow.textContent).toContain('Sunday')
    expect(sundayRow.textContent).toContain('Rest')
  })

  it('weight guide section is present', () => {
    renderGuide()
    expect(screen.getByTestId('weight-guide-section')).toBeInTheDocument()
  })

  it('Leg Press appears in weight guide', () => {
    renderGuide()
    const rows = screen.getAllByTestId('weight-guide-row')
    const texts = rows.map(r => r.textContent)
    expect(texts.some(t => t.includes('Leg Press'))).toBe(true)
  })

  it('Hip Abductor appears in weight guide', () => {
    renderGuide()
    const rows = screen.getAllByTestId('weight-guide-row')
    const texts = rows.map(r => r.textContent)
    expect(texts.some(t => t.includes('Hip Abductor'))).toBe(true)
  })

  it('at least 15 exercises appear in weight guide table', () => {
    renderGuide()
    const rows = screen.getAllByTestId('weight-guide-row')
    expect(rows.length).toBeGreaterThanOrEqual(15)
  })

  it('progressive overload section is present', () => {
    renderGuide()
    expect(screen.getByTestId('overload-section')).toBeInTheDocument()
    expect(screen.getByText(/Complete all sets at target reps/)).toBeInTheDocument()
    expect(screen.getByText(/Add 2 kg for compound/)).toBeInTheDocument()
  })

  it('exercise tips section is present', () => {
    renderGuide()
    const section = screen.getByTestId('exercise-tips-section')
    expect(section).toBeInTheDocument()
    expect(within(section).getByText('Leg Press')).toBeInTheDocument()
    expect(within(section).getByText('Hip Abductor')).toBeInTheDocument()
    expect(within(section).getByText('Lat Pulldown')).toBeInTheDocument()
    expect(within(section).getByText('Cable Exercises')).toBeInTheDocument()
  })

  it('cardio guide section is present', () => {
    renderGuide()
    expect(screen.getByTestId('cardio-guide-section')).toBeInTheDocument()
    expect(screen.getByText('Treadmill Incline Benefits')).toBeInTheDocument()
    expect(screen.getByText('Why Zumba Works for Fat Loss')).toBeInTheDocument()
  })

  it('"Why this plan works" section is present', () => {
    renderGuide()
    expect(screen.getByTestId('why-section')).toBeInTheDocument()
    expect(screen.getByText('Why This Plan Works')).toBeInTheDocument()
  })

  it('all tables have overflow-x-auto wrapper for mobile scrolling', () => {
    renderGuide()
    const wrappers = screen.getAllByTestId('table-scroll-wrapper')
    expect(wrappers.length).toBeGreaterThanOrEqual(2)
    for (const wrapper of wrappers) {
      expect(wrapper.className).toContain('overflow-x-auto')
    }
  })
})

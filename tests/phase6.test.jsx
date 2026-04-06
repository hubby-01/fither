import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

// Mock recharts — jsdom has no SVG layout engine
vi.mock('recharts', () => {
  const React = require('react')
  return {
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
    LineChart: ({ children, data }) => <div data-testid="line-chart" data-points={data?.length || 0}>{children}</div>,
    BarChart: ({ children, data }) => <div data-testid="bar-chart" data-points={data?.length || 0}>{children}</div>,
    Line: (props) => <div data-testid="chart-line" data-stroke={props.stroke} />,
    Bar: () => <div data-testid="chart-bar" />,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    CartesianGrid: () => null,
  }
})

import ProgressChart from '../src/components/ProgressChart'
import Progress from '../src/pages/Progress'

function renderProgress() {
  return render(
    <MemoryRouter initialEntries={['/progress']}>
      <Routes>
        <Route path="/progress" element={<Progress />} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── SAMPLE DATA ────────────────────────────────────────────

const SESSIONS = [
  {
    id: '2025-04-01T10:00:00.000Z',
    date: '2025-04-01',
    dayType: 'Full Body A',
    type: 'strength',
    exercises: [
      { name: 'Leg Press', sets: [{ reps: 15, weightKg: 25 }, { reps: 15, weightKg: 25 }] },
      { name: 'Lat Pulldown (machine)', sets: [{ reps: 15, weightKg: 15 }] },
    ],
  },
  {
    id: '2025-04-03T10:00:00.000Z',
    date: '2025-04-03',
    dayType: 'Upper Body',
    type: 'strength',
    exercises: [
      { name: 'Leg Press', sets: [{ reps: 15, weightKg: 30 }, { reps: 15, weightKg: 30 }] },
    ],
  },
  {
    id: '2025-04-05T10:00:00.000Z',
    date: '2025-04-05',
    dayType: 'Lower Body',
    type: 'strength',
    exercises: [
      { name: 'Leg Press', sets: [{ reps: 15, weightKg: 32 }] },
      { name: 'Lat Pulldown (machine)', sets: [{ reps: 15, weightKg: 20 }] },
    ],
  },
]

const CARDIO = [
  { id: '2025-04-02T18:00:00.000Z', date: '2025-04-02', type: 'treadmill', durationMinutes: 25, speedKmh: 5.5, inclinePercent: 2 },
  { id: '2025-04-04T18:00:00.000Z', date: '2025-04-04', type: 'zumba', durationMinutes: 45 },
  { id: '2025-04-09T18:00:00.000Z', date: '2025-04-09', type: 'treadmill', durationMinutes: 30, speedKmh: 6.0, inclinePercent: 3 },
]

const BODYWEIGHT = [
  { date: '2025-04-01', weightKg: 68.9 },
  { date: '2025-04-04', weightKg: 68.5 },
  { date: '2025-04-07', weightKg: 68.2 },
]

const PROFILE = {
  name: 'User',
  startDate: '2025-04-01',
  startWeightKg: 68.9,
  heightCm: 157,
  age: 23,
  goalWeightKg: 60,
}

// ─── PROGRESS CHART TESTS ───────────────────────────────────

describe('ProgressChart', () => {
  it('renders without crashing with valid data array', () => {
    const data = [
      { date: '2025-04-01', value: 25 },
      { date: '2025-04-03', value: 30 },
    ]
    render(<ProgressChart data={data} label="Weight" unit="kg" />)
    expect(screen.getByTestId('progress-chart')).toBeInTheDocument()
  })

  it('renders without crashing with empty data array', () => {
    render(<ProgressChart data={[]} label="Weight" unit="kg" />)
    expect(screen.getByTestId('chart-empty')).toBeInTheDocument()
  })

  it('shows a message when fewer than 2 data points', () => {
    render(<ProgressChart data={[{ date: '2025-04-01', value: 25 }]} label="Weight" unit="kg" />)
    expect(screen.getByTestId('chart-empty')).toBeInTheDocument()
    expect(screen.getByTestId('chart-empty').textContent).toContain('Not enough data')
  })

  it('line colour is rose (not blue)', () => {
    const data = [
      { date: '2025-04-01', value: 25 },
      { date: '2025-04-03', value: 30 },
    ]
    render(<ProgressChart data={data} label="Weight" unit="kg" />)
    const line = screen.getByTestId('chart-line')
    // Default color should be rose-500 (#f43f5e)
    expect(line.getAttribute('data-stroke')).toBe('#f43f5e')
  })
})

// ─── PROGRESS PAGE TESTS ────────────────────────────────────

describe('Progress page', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('fat loss summary card renders', () => {
    renderProgress()
    expect(screen.getByTestId('fat-loss-card')).toBeInTheDocument()
  })

  it('shows start weight of 68.9 kg', () => {
    renderProgress()
    expect(screen.getByTestId('start-weight').textContent).toContain('68.9')
  })

  it('shows 0 kg lost when no bodyweight entries', () => {
    renderProgress()
    expect(screen.getByTestId('weight-lost').textContent).toContain('0')
  })

  it('shows correct kg lost when bodyweight entries exist', () => {
    localStorage.setItem('fither_profile', JSON.stringify(PROFILE))
    localStorage.setItem('fither_bodyweight', JSON.stringify(BODYWEIGHT))
    renderProgress()
    // 68.9 - 68.2 = 0.7
    expect(screen.getByTestId('weight-lost').textContent).toContain('0.7')
  })

  it('exercise dropdown populates from logged sessions', () => {
    localStorage.setItem('fither_sessions', JSON.stringify(SESSIONS))
    renderProgress()
    const dropdown = screen.getByTestId('exercise-dropdown')
    expect(dropdown).toBeInTheDocument()
    // Leg Press appears in 3 sessions, Lat Pulldown in 2
    const options = dropdown.querySelectorAll('option')
    const names = Array.from(options).map(o => o.textContent)
    expect(names).toContain('Leg Press')
    expect(names).toContain('Lat Pulldown (machine)')
  })

  it('selecting an exercise renders ProgressChart', () => {
    localStorage.setItem('fither_sessions', JSON.stringify(SESSIONS))
    renderProgress()
    // Default selection is first exercise, chart should render
    expect(screen.getByTestId('progress-chart')).toBeInTheDocument()
  })

  it('dropdown is empty or shows message when fewer than 2 sessions for any exercise', () => {
    // Only 1 session — no exercise has 2+ appearances
    localStorage.setItem('fither_sessions', JSON.stringify([SESSIONS[0]]))
    renderProgress()
    expect(screen.queryByTestId('exercise-dropdown')).not.toBeInTheDocument()
    expect(screen.getByTestId('strength-empty')).toBeInTheDocument()
  })

  it('body weight chart section renders', () => {
    renderProgress()
    expect(screen.getByTestId('bodyweight-section')).toBeInTheDocument()
  })

  it('cardio section renders', () => {
    renderProgress()
    expect(screen.getByTestId('cardio-section')).toBeInTheDocument()
  })

  it('personal records section renders', () => {
    renderProgress()
    expect(screen.getByTestId('pr-section')).toBeInTheDocument()
  })

  it('PRBadge renders for each exercise with a logged session', () => {
    localStorage.setItem('fither_sessions', JSON.stringify(SESSIONS))
    renderProgress()
    const badges = screen.getAllByTestId('pr-badge')
    // Leg Press and Lat Pulldown
    expect(badges.length).toBe(2)
    const texts = badges.map(b => b.textContent)
    expect(texts.some(t => t.includes('Leg Press'))).toBe(true)
    expect(texts.some(t => t.includes('Lat Pulldown'))).toBe(true)
    // Leg Press PR should be 32 kg
    const lpBadge = badges.find(b => b.textContent.includes('Leg Press'))
    expect(lpBadge.textContent).toContain('32')
  })

  it('weekly cardio bar chart renders when cardio entries exist', () => {
    localStorage.setItem('fither_cardio', JSON.stringify(CARDIO))
    renderProgress()
    expect(screen.getByTestId('weekly-cardio-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('all sections render without crashing when all data is empty', () => {
    renderProgress()
    expect(screen.getByTestId('fat-loss-card')).toBeInTheDocument()
    expect(screen.getByTestId('strength-section')).toBeInTheDocument()
    expect(screen.getByTestId('bodyweight-section')).toBeInTheDocument()
    expect(screen.getByTestId('cardio-section')).toBeInTheDocument()
    expect(screen.getByTestId('pr-section')).toBeInTheDocument()
  })
})

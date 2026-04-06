import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import History from '../src/pages/History'

function renderHistory() {
  return render(
    <MemoryRouter initialEntries={['/history']}>
      <Routes>
        <Route path="/history" element={<History />} />
      </Routes>
    </MemoryRouter>
  )
}

const STRENGTH_SESSION = {
  id: '2025-04-07T18:30:00.000Z',
  date: '2025-04-07',
  dayType: 'Full Body A',
  type: 'strength',
  durationMinutes: 45,
  notes: 'Felt strong',
  exercises: [
    {
      name: 'Leg Press',
      sets: [
        { reps: 15, weightKg: 30 },
        { reps: 15, weightKg: 30 },
        { reps: 12, weightKg: 30 },
      ],
    },
    {
      name: 'Lat Pulldown (machine)',
      sets: [
        { reps: 15, weightKg: 20 },
        { reps: 15, weightKg: 20 },
      ],
    },
  ],
}

const STRENGTH_SESSION_2 = {
  id: '2025-04-05T10:00:00.000Z',
  date: '2025-04-05',
  dayType: 'Lower Body',
  type: 'strength',
  durationMinutes: 50,
  notes: '',
  exercises: [
    {
      name: 'Squat (bodyweight or goblet)',
      sets: [{ reps: 20, weightKg: 0 }],
    },
  ],
}

const CARDIO_SESSION = {
  id: '2025-04-06T19:00:00.000Z',
  date: '2025-04-06',
  type: 'treadmill',
  durationMinutes: 30,
  speedKmh: 5.5,
  inclinePercent: 2,
  notes: 'Good pace',
}

const CARDIO_SESSION_2 = {
  id: '2025-04-08T18:00:00.000Z',
  date: '2025-04-08',
  type: 'zumba',
  durationMinutes: 45,
  notes: 'Fun class',
}

describe('History page', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders empty state message when no sessions or cardio', () => {
    renderHistory()
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByText(/No workouts logged yet/)).toBeInTheDocument()
  })

  it('renders strength sessions from localStorage', () => {
    localStorage.setItem('fither_sessions', JSON.stringify([STRENGTH_SESSION]))
    renderHistory()
    expect(screen.getAllByTestId('session-item')).toHaveLength(1)
    expect(screen.getByText(/2 exercises/)).toBeInTheDocument()
  })

  it('renders cardio sessions from localStorage', () => {
    localStorage.setItem('fither_cardio', JSON.stringify([CARDIO_SESSION]))
    renderHistory()
    expect(screen.getAllByTestId('session-item')).toHaveLength(1)
    expect(screen.getByText(/30 min/)).toBeInTheDocument()
  })

  it('both strength and cardio appear in merged list sorted newest first', () => {
    localStorage.setItem('fither_sessions', JSON.stringify([STRENGTH_SESSION]))
    localStorage.setItem('fither_cardio', JSON.stringify([CARDIO_SESSION_2]))
    renderHistory()
    const items = screen.getAllByTestId('session-item')
    expect(items).toHaveLength(2)
    // CARDIO_SESSION_2 is 2025-04-08 (newer), STRENGTH_SESSION is 2025-04-07
    const dateBadges = screen.getAllByTestId('date-badge')
    expect(dateBadges[0].textContent).toContain('Apr')
    expect(dateBadges[0].textContent).toContain('8')
    expect(dateBadges[1].textContent).toContain('Apr')
    expect(dateBadges[1].textContent).toContain('7')
  })

  it('clicking a session expands its detail', () => {
    localStorage.setItem('fither_sessions', JSON.stringify([STRENGTH_SESSION]))
    renderHistory()
    expect(screen.queryByTestId('session-detail')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('session-header'))
    expect(screen.getByTestId('session-detail')).toBeInTheDocument()
  })

  it('clicking again collapses it', () => {
    localStorage.setItem('fither_sessions', JSON.stringify([STRENGTH_SESSION]))
    renderHistory()
    fireEvent.click(screen.getByTestId('session-header'))
    expect(screen.getByTestId('session-detail')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('session-header'))
    expect(screen.queryByTestId('session-detail')).not.toBeInTheDocument()
  })

  it('expanded strength session shows exercise names and set details', () => {
    localStorage.setItem('fither_sessions', JSON.stringify([STRENGTH_SESSION]))
    renderHistory()
    fireEvent.click(screen.getByTestId('session-header'))
    const exerciseNames = screen.getAllByTestId('detail-exercise-name')
    expect(exerciseNames).toHaveLength(2)
    expect(exerciseNames[0].textContent).toBe('Leg Press')
    expect(exerciseNames[1].textContent).toBe('Lat Pulldown (machine)')
    const sets = screen.getAllByTestId('detail-set')
    expect(sets).toHaveLength(5) // 3 + 2
    expect(sets[0].textContent).toContain('15 reps')
    expect(sets[0].textContent).toContain('30 kg')
  })

  it('expanded cardio session shows type, duration, and calorie estimate', () => {
    localStorage.setItem('fither_cardio', JSON.stringify([CARDIO_SESSION]))
    renderHistory()
    fireEvent.click(screen.getByTestId('session-header'))
    const detail = screen.getByTestId('cardio-detail')
    expect(detail.textContent).toContain('treadmill')
    expect(detail.textContent).toContain('30 min')
    const calorieEl = screen.getByTestId('cardio-calories')
    expect(calorieEl).toBeInTheDocument()
    const calNum = parseInt(calorieEl.textContent.match(/\d+/)[0])
    expect(calNum).toBeGreaterThan(0)
  })

  it('delete button appears in expanded view', () => {
    localStorage.setItem('fither_sessions', JSON.stringify([STRENGTH_SESSION]))
    renderHistory()
    expect(screen.queryByTestId('delete-btn')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('session-header'))
    expect(screen.getByTestId('delete-btn')).toBeInTheDocument()
  })

  it('delete calls deleteSession and removes from list', () => {
    localStorage.setItem('fither_sessions', JSON.stringify([STRENGTH_SESSION, STRENGTH_SESSION_2]))
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderHistory()
    expect(screen.getAllByTestId('session-item')).toHaveLength(2)

    // Expand first item and delete
    fireEvent.click(screen.getAllByTestId('session-header')[0])
    fireEvent.click(screen.getByTestId('delete-btn'))

    expect(window.confirm).toHaveBeenCalledWith('Delete this entry?')
    expect(screen.getAllByTestId('session-item')).toHaveLength(1)
    // Verify localStorage updated
    const remaining = JSON.parse(localStorage.getItem('fither_sessions'))
    expect(remaining).toHaveLength(1)
  })

  it('delete calls deleteCardio and removes cardio from list', () => {
    localStorage.setItem('fither_cardio', JSON.stringify([CARDIO_SESSION]))
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderHistory()
    expect(screen.getAllByTestId('session-item')).toHaveLength(1)

    fireEvent.click(screen.getByTestId('session-header'))
    fireEvent.click(screen.getByTestId('delete-btn'))

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    const remaining = JSON.parse(localStorage.getItem('fither_cardio'))
    expect(remaining).toHaveLength(0)
  })

  it("filter 'Strength' hides cardio entries", () => {
    localStorage.setItem('fither_sessions', JSON.stringify([STRENGTH_SESSION]))
    localStorage.setItem('fither_cardio', JSON.stringify([CARDIO_SESSION]))
    renderHistory()
    expect(screen.getAllByTestId('session-item')).toHaveLength(2)

    fireEvent.click(screen.getByTestId('filter-strength'))
    expect(screen.getAllByTestId('session-item')).toHaveLength(1)
    expect(screen.getByText(/2 exercises/)).toBeInTheDocument()
  })

  it("filter 'Cardio' hides strength entries", () => {
    localStorage.setItem('fither_sessions', JSON.stringify([STRENGTH_SESSION]))
    localStorage.setItem('fither_cardio', JSON.stringify([CARDIO_SESSION]))
    renderHistory()

    fireEvent.click(screen.getByTestId('filter-cardio'))
    expect(screen.getAllByTestId('session-item')).toHaveLength(1)
    expect(screen.getByText(/30 min/)).toBeInTheDocument()
  })

  it("filter 'All' shows everything", () => {
    localStorage.setItem('fither_sessions', JSON.stringify([STRENGTH_SESSION]))
    localStorage.setItem('fither_cardio', JSON.stringify([CARDIO_SESSION]))
    renderHistory()

    // Switch to strength first
    fireEvent.click(screen.getByTestId('filter-strength'))
    expect(screen.getAllByTestId('session-item')).toHaveLength(1)

    // Back to all
    fireEvent.click(screen.getByTestId('filter-all'))
    expect(screen.getAllByTestId('session-item')).toHaveLength(2)
  })

  it('date badges render in correct format', () => {
    localStorage.setItem('fither_sessions', JSON.stringify([STRENGTH_SESSION]))
    renderHistory()
    const badge = screen.getByTestId('date-badge')
    // formatDate returns e.g. "Mon, Apr 7"
    expect(badge.textContent).toContain('Apr')
    expect(badge.textContent).toContain('7')
  })

  it('day type badges render with correct label', () => {
    localStorage.setItem('fither_sessions', JSON.stringify([STRENGTH_SESSION]))
    localStorage.setItem('fither_cardio', JSON.stringify([CARDIO_SESSION]))
    renderHistory()
    const badges = screen.getAllByTestId('day-type-badge')
    // Sorted newest first: STRENGTH (Apr 7) then CARDIO (Apr 6)
    expect(badges[0].textContent).toBe('Full Body A')
    expect(badges[1].textContent).toBe('Treadmill')
  })
})

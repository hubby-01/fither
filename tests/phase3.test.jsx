import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from '../src/pages/Dashboard'
import DayPlanCard from '../src/components/DayPlanCard'
import WorkoutCard from '../src/components/WorkoutCard'
import { WEEKLY_PLAN } from '../src/data/workoutPlan'
import { getDayIndex, todayStr } from '../src/utils/dateUtils'

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

// ─── DASHBOARD COMPONENT TESTS ──────────────────────────────
describe('Dashboard', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('renders without crashing', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByTestId('greeting')).toBeInTheDocument()
  })

  it('greeting contains one of Good morning, Good afternoon, Good evening', () => {
    renderWithRouter(<Dashboard />)
    const text = screen.getByTestId('greeting').textContent
    expect(
      text.includes('Good morning') ||
      text.includes('Good afternoon') ||
      text.includes('Good evening')
    ).toBe(true)
  })

  it("today's date is displayed on screen", () => {
    renderWithRouter(<Dashboard />)
    const dateEl = screen.getByTestId('today-date')
    expect(dateEl).toBeInTheDocument()
    expect(dateEl.textContent.length).toBeGreaterThan(0)
  })

  it('DayPlanCard renders with correct dayType for today', () => {
    renderWithRouter(<Dashboard />)
    const todayPlan = WEEKLY_PLAN[getDayIndex()]
    const badge = screen.getByTestId('day-badge')
    expect(badge.textContent).toBe(todayPlan.dayType)
  })

  it('stats row renders four stat items', () => {
    renderWithRouter(<Dashboard />)
    const items = screen.getAllByTestId('stat-item')
    expect(items).toHaveLength(4)
  })

  it('streak shows 0 with no logged sessions', () => {
    renderWithRouter(<Dashboard />)
    const items = screen.getAllByTestId('stat-item')
    // First stat is streak
    expect(items[0].textContent).toContain('0')
    expect(items[0].textContent).toContain('Streak')
  })

  it('"Log Today" button is present and links to /log', () => {
    renderWithRouter(<Dashboard />)
    const btn = screen.getByTestId('log-today-btn')
    expect(btn).toBeInTheDocument()
    expect(btn.textContent).toContain('Log Today')
    expect(btn.getAttribute('href')).toBe('/log')
  })

  it('body weight section renders', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByTestId('bodyweight-section')).toBeInTheDocument()
  })

  it('log weight button is present', () => {
    renderWithRouter(<Dashboard />)
    expect(screen.getByTestId('log-weight-btn')).toBeInTheDocument()
  })

  it('entering a weight value and clicking log saves to localStorage', () => {
    renderWithRouter(<Dashboard />)
    const input = screen.getByTestId('weight-input')
    const btn = screen.getByTestId('log-weight-btn')

    fireEvent.change(input, { target: { value: '68.5' } })
    fireEvent.click(btn)

    const stored = JSON.parse(localStorage.getItem('fither_bodyweight'))
    expect(stored).toBeTruthy()
    expect(stored.length).toBeGreaterThanOrEqual(1)
    expect(stored[0].weightKg).toBe(68.5)
  })

  it('after logging weight, the value appears in localStorage under fither_bodyweight', () => {
    renderWithRouter(<Dashboard />)
    const input = screen.getByTestId('weight-input')
    const btn = screen.getByTestId('log-weight-btn')

    fireEvent.change(input, { target: { value: '67.2' } })
    fireEvent.click(btn)

    const stored = JSON.parse(localStorage.getItem('fither_bodyweight'))
    expect(stored).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ weightKg: 67.2, date: todayStr() }),
      ])
    )
  })

  it('motivational tip is displayed', () => {
    renderWithRouter(<Dashboard />)
    const tip = screen.getByTestId('motivational-tip')
    expect(tip).toBeInTheDocument()
    expect(tip.textContent.length).toBeGreaterThan(5)
  })

  it('if today already has a logged session, button shows "Already logged" text', () => {
    const today = todayStr()
    localStorage.setItem('fither_sessions', JSON.stringify([
      { id: 'test1', date: today, dayType: 'Full Body A', exercises: [] },
    ]))
    renderWithRouter(<Dashboard />)
    const alreadyLogged = screen.getByTestId('already-logged')
    expect(alreadyLogged.textContent).toContain('Already logged')
  })
})

// ─── DAYPLANCARD COMPONENT TESTS ────────────────────────────
describe('DayPlanCard', () => {
  it('rest day renders restNote text', () => {
    const restPlan = WEEKLY_PLAN.find(p => p.type === 'rest')
    renderWithRouter(<DayPlanCard plan={restPlan} />)
    expect(screen.getByText(restPlan.restNote)).toBeInTheDocument()
  })

  it('Active Recovery day renders teal-themed card', () => {
    const arPlan = WEEKLY_PLAN.find(p => p.dayType === 'Active Recovery')
    renderWithRouter(<DayPlanCard plan={arPlan} />)
    const badge = screen.getByTestId('day-badge')
    expect(badge.className).toContain('teal')
  })

  it('strength day renders exercise list', () => {
    const strengthPlan = WEEKLY_PLAN.find(p => p.type === 'strength')
    renderWithRouter(<DayPlanCard plan={strengthPlan} />)
    const list = screen.getByTestId('exercise-list')
    expect(list.children.length).toBe(strengthPlan.exercises.length)
  })

  it('Cardio day renders orange-themed card', () => {
    const cardioPlan = WEEKLY_PLAN.find(p => p.dayType === 'Cardio + Core')
    renderWithRouter(<DayPlanCard plan={cardioPlan} />)
    const badge = screen.getByTestId('day-badge')
    expect(badge.className).toContain('orange')
  })

  it('every exercise in the plan card shows sets and reps', () => {
    const strengthPlan = WEEKLY_PLAN.find(p => p.type === 'strength')
    renderWithRouter(<DayPlanCard plan={strengthPlan} />)
    for (const ex of strengthPlan.exercises) {
      expect(screen.getByText(ex.name)).toBeInTheDocument()
    }
    // Verify that all sets x reps combos are present (multiple exercises may share the same combo)
    const list = screen.getByTestId('exercise-list')
    const items = list.querySelectorAll('li')
    expect(items.length).toBe(strengthPlan.exercises.length)
    for (let i = 0; i < strengthPlan.exercises.length; i++) {
      const ex = strengthPlan.exercises[i]
      const expected = `${ex.sets} x ${ex.reps}${ex.unit ? ` ${ex.unit}` : ''}`
      expect(items[i].textContent).toContain(expected)
    }
  })
})

// ─── WORKOUTCARD COMPONENT TESTS ────────────────────────────
describe('WorkoutCard', () => {
  it('strength WorkoutCard renders date and dayType', () => {
    const session = {
      id: 'test1',
      date: '2025-04-07',
      dayType: 'Full Body A',
      exercises: [
        { name: 'Leg Press', sets: [{ reps: 15, weightKg: 30 }] },
      ],
    }
    renderWithRouter(<WorkoutCard session={session} type="strength" />)
    const card = screen.getByTestId('workout-card')
    expect(card.textContent).toContain('Full Body A')
    expect(card.textContent).toContain('Apr')
  })

  it('cardio WorkoutCard renders type and duration', () => {
    const session = {
      id: 'test2',
      date: '2025-04-07',
      type: 'treadmill',
      durationMinutes: 25,
    }
    renderWithRouter(<WorkoutCard session={session} type="cardio" />)
    const card = screen.getByTestId('workout-card')
    expect(card.textContent).toContain('Treadmill')
    expect(card.textContent).toContain('25 minutes')
  })

  it('cards render without crashing with minimal valid props', () => {
    renderWithRouter(<WorkoutCard session={{ date: '2025-04-07' }} type="strength" />)
    expect(screen.getByTestId('workout-card')).toBeInTheDocument()

    renderWithRouter(<WorkoutCard session={{ date: '2025-04-07', durationMinutes: 10 }} type="cardio" />)
    expect(screen.getAllByTestId('workout-card').length).toBeGreaterThanOrEqual(1)
  })
})

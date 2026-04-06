import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import SetRow from '../src/components/SetRow'
import ExerciseLogger from '../src/components/ExerciseLogger'
import CardioLogger from '../src/components/CardioLogger'
import LogWorkout from '../src/pages/LogWorkout'
import { WEEKLY_PLAN } from '../src/data/workoutPlan'
import * as dateUtils from '../src/utils/dateUtils'

function renderWithRouter(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="*" element={ui} />
      </Routes>
    </MemoryRouter>
  )
}

// ─── SETROW TESTS ───────────────────────────────────────────
describe('SetRow', () => {
  const defaults = { setIndex: 0, reps: 15, weightKg: 30, done: false }

  it('renders reps and weight inputs', () => {
    render(<SetRow {...defaults} onChange={() => {}} onRemove={() => {}} />)
    expect(screen.getByTestId('reps-input')).toHaveValue(15)
    expect(screen.getByTestId('weight-input')).toHaveValue(30)
  })

  it('onChange fires when reps input changes', () => {
    const onChange = vi.fn()
    render(<SetRow {...defaults} onChange={onChange} onRemove={() => {}} />)
    fireEvent.change(screen.getByTestId('reps-input'), { target: { value: '12' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ reps: 12 }))
  })

  it('onChange fires when weight input changes', () => {
    const onChange = vi.fn()
    render(<SetRow {...defaults} onChange={onChange} onRemove={() => {}} />)
    fireEvent.change(screen.getByTestId('weight-input'), { target: { value: '35' } })
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ weightKg: 35 }))
  })

  it('checkbox toggles done state', () => {
    const onChange = vi.fn()
    render(<SetRow {...defaults} onChange={onChange} onRemove={() => {}} />)
    fireEvent.click(screen.getByTestId('done-checkbox'))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ done: true }))
  })

  it('remove button calls onRemove', () => {
    const onRemove = vi.fn()
    render(<SetRow {...defaults} onChange={() => {}} onRemove={onRemove} canRemove={true} />)
    fireEvent.click(screen.getByTestId('remove-set-btn'))
    expect(onRemove).toHaveBeenCalled()
  })

  it('remove button is hidden when it is the only set', () => {
    render(<SetRow {...defaults} onChange={() => {}} onRemove={() => {}} canRemove={false} />)
    expect(screen.queryByTestId('remove-set-btn')).not.toBeInTheDocument()
  })
})

// ─── EXERCISELOGGER TESTS ───────────────────────────────────
describe('ExerciseLogger', () => {
  const baseSets = [
    { reps: 15, weightKg: 0, done: false },
    { reps: 15, weightKg: 0, done: false },
    { reps: 15, weightKg: 0, done: false },
  ]

  it('renders exercise name as heading', () => {
    render(<ExerciseLogger name="Leg Press" targetReps={15} sets={baseSets} onChange={() => {}} overloadSuggestion={null} />)
    expect(screen.getByTestId('exercise-name').textContent).toBe('Leg Press')
  })

  it('renders one SetRow per set in props', () => {
    render(<ExerciseLogger name="Leg Press" targetReps={15} sets={baseSets} onChange={() => {}} overloadSuggestion={null} />)
    expect(screen.getAllByTestId('set-row')).toHaveLength(3)
  })

  it('add set button appends a new set', () => {
    const onChange = vi.fn()
    render(<ExerciseLogger name="Leg Press" targetReps={15} sets={baseSets} onChange={onChange} overloadSuggestion={null} />)
    fireEvent.click(screen.getByTestId('add-set-btn'))
    expect(onChange).toHaveBeenCalledWith(expect.any(Array))
    expect(onChange.mock.calls[0][0]).toHaveLength(4)
  })

  it('remove set on last remaining set does nothing', () => {
    const singleSet = [{ reps: 15, weightKg: 0, done: false }]
    render(<ExerciseLogger name="Leg Press" targetReps={15} sets={singleSet} onChange={() => {}} overloadSuggestion={null} />)
    // With only 1 set, remove button should not be present (canRemove=false)
    expect(screen.queryByTestId('remove-set-btn')).not.toBeInTheDocument()
  })

  it('shows weight guide range when no history provided', () => {
    render(<ExerciseLogger name="Leg Press" targetReps={15} sets={baseSets} onChange={() => {}} overloadSuggestion={null} />)
    expect(screen.getByTestId('weight-guide-hint')).toBeInTheDocument()
    expect(screen.getByTestId('weight-guide-hint').textContent).toContain('20')
    expect(screen.getByTestId('weight-guide-hint').textContent).toContain('30')
  })

  it('shows green overload hint when suggestion is increase', () => {
    const suggestion = { suggestion: 'increase', suggestedWeightKg: 32, lastWeightKg: 30, lastDate: '2025-04-07', allSetsDone: true }
    render(<ExerciseLogger name="Leg Press" targetReps={15} sets={baseSets} onChange={() => {}} overloadSuggestion={suggestion} />)
    expect(screen.getByTestId('overload-hint-increase')).toBeInTheDocument()
    expect(screen.getByTestId('overload-hint-increase').textContent).toContain('32')
  })

  it('shows gray maintain hint when suggestion is maintain', () => {
    const suggestion = { suggestion: 'maintain', suggestedWeightKg: 30, lastWeightKg: 30, lastDate: '2025-04-07', allSetsDone: false }
    render(<ExerciseLogger name="Leg Press" targetReps={15} sets={baseSets} onChange={() => {}} overloadSuggestion={suggestion} />)
    expect(screen.getByTestId('overload-hint-maintain')).toBeInTheDocument()
    expect(screen.getByTestId('overload-hint-maintain').textContent).toContain('30')
  })

  it('shows nothing when suggestion is null', () => {
    // Exercise not in WEIGHT_GUIDE to avoid guide hint
    render(<ExerciseLogger name="Unknown Exercise" targetReps={15} sets={baseSets} onChange={() => {}} overloadSuggestion={null} />)
    expect(screen.queryByTestId('overload-hint-increase')).not.toBeInTheDocument()
    expect(screen.queryByTestId('overload-hint-maintain')).not.toBeInTheDocument()
    expect(screen.queryByTestId('weight-guide-hint')).not.toBeInTheDocument()
  })
})

// ─── CARDIO LOGGER TESTS ───────────────────────────────────
describe('CardioLogger', () => {
  const defaultValue = { type: 'treadmill', durationMinutes: 0, speedKmh: 0, inclinePercent: 0, notes: '' }

  it('renders type selector with 4 options', () => {
    render(<CardioLogger value={defaultValue} onChange={() => {}} />)
    const selector = screen.getByTestId('type-selector')
    expect(selector.children).toHaveLength(4)
  })

  it('selecting Treadmill shows speed and incline fields', () => {
    render(<CardioLogger value={{ ...defaultValue, type: 'treadmill' }} onChange={() => {}} />)
    expect(screen.getByTestId('speed-input')).toBeInTheDocument()
    expect(screen.getByTestId('incline-input')).toBeInTheDocument()
  })

  it('selecting Zumba hides speed and incline fields', () => {
    render(<CardioLogger value={{ ...defaultValue, type: 'zumba' }} onChange={() => {}} />)
    expect(screen.queryByTestId('speed-input')).not.toBeInTheDocument()
    expect(screen.queryByTestId('incline-input')).not.toBeInTheDocument()
  })

  it('selecting Yoga hides speed and incline fields', () => {
    render(<CardioLogger value={{ ...defaultValue, type: 'yoga' }} onChange={() => {}} />)
    expect(screen.queryByTestId('speed-input')).not.toBeInTheDocument()
    expect(screen.queryByTestId('incline-input')).not.toBeInTheDocument()
  })

  it('calorie estimate updates when duration changes', () => {
    const onChange = vi.fn()
    const { rerender } = render(<CardioLogger value={{ ...defaultValue, durationMinutes: 30 }} onChange={onChange} />)
    expect(screen.getByTestId('calorie-estimate')).toBeInTheDocument()
    const cal1 = screen.getByTestId('calorie-estimate').textContent

    rerender(<CardioLogger value={{ ...defaultValue, durationMinutes: 60 }} onChange={onChange} />)
    const cal2 = screen.getByTestId('calorie-estimate').textContent
    expect(cal2).not.toBe(cal1)
  })

  it('calorie estimate is positive and non-zero for valid input', () => {
    render(<CardioLogger value={{ ...defaultValue, durationMinutes: 30 }} onChange={() => {}} />)
    const text = screen.getByTestId('calorie-estimate').textContent
    const num = parseInt(text.match(/\d+/)[0])
    expect(num).toBeGreaterThan(0)
  })

  it('calorie estimate for Zumba is higher than Yoga for same duration and weight', () => {
    const { unmount } = render(<CardioLogger value={{ ...defaultValue, type: 'zumba', durationMinutes: 45 }} onChange={() => {}} bodyweightKg={68.9} />)
    const zumbaText = screen.getByTestId('calorie-estimate').textContent
    const zumbaCal = parseInt(zumbaText.match(/\d+/)[0])
    unmount()

    render(<CardioLogger value={{ ...defaultValue, type: 'yoga', durationMinutes: 45 }} onChange={() => {}} bodyweightKg={68.9} />)
    const yogaText = screen.getByTestId('calorie-estimate').textContent
    const yogaCal = parseInt(yogaText.match(/\d+/)[0])

    expect(zumbaCal).toBeGreaterThan(yogaCal)
  })
})

// ─── LOG WORKOUT PAGE TESTS ─────────────────────────────────
describe('LogWorkout page', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders Strength and Cardio tabs', () => {
    renderWithRouter(<LogWorkout />, { route: '/log' })
    expect(screen.getByTestId('tab-strength')).toBeInTheDocument()
    expect(screen.getByTestId('tab-cardio')).toBeInTheDocument()
  })

  it('strength tab is default on non-Thursday days', () => {
    // Mock getDayIndex to return Monday (1)
    vi.spyOn(dateUtils, 'getDayIndex').mockReturnValue(1)
    renderWithRouter(<LogWorkout />, { route: '/log' })
    expect(screen.getByTestId('strength-panel')).toBeInTheDocument()
    expect(screen.queryByTestId('cardio-panel')).not.toBeInTheDocument()
  })

  it('cardio tab is default on Thursday (day index 4)', () => {
    vi.spyOn(dateUtils, 'getDayIndex').mockReturnValue(4)
    renderWithRouter(<LogWorkout />, { route: '/log' })
    expect(screen.getByTestId('cardio-panel')).toBeInTheDocument()
    expect(screen.queryByTestId('strength-panel')).not.toBeInTheDocument()
  })

  it('exercises pre-populate from today\'s plan', () => {
    vi.spyOn(dateUtils, 'getDayIndex').mockReturnValue(1) // Monday
    renderWithRouter(<LogWorkout />, { route: '/log' })
    const mondayPlan = WEEKLY_PLAN[1]
    for (const ex of mondayPlan.exercises) {
      expect(screen.getByText(ex.name)).toBeInTheDocument()
    }
  })

  it('save button shows validation error with empty exercises', () => {
    vi.spyOn(dateUtils, 'getDayIndex').mockReturnValue(4) // Thursday — active recovery, no exercises
    renderWithRouter(<LogWorkout />, { route: '/log' })
    // Switch to strength tab (which has no exercises for Thursday)
    fireEvent.click(screen.getByTestId('tab-strength'))
    fireEvent.click(screen.getByTestId('save-strength-btn'))
    expect(screen.getByTestId('validation-error')).toBeInTheDocument()
  })

  it('valid strength session saves to localStorage on submit', () => {
    vi.spyOn(dateUtils, 'getDayIndex').mockReturnValue(1) // Monday
    render(
      <MemoryRouter initialEntries={['/log']}>
        <Routes>
          <Route path="/log" element={<LogWorkout />} />
          <Route path="/history" element={<div data-testid="history">History</div>} />
        </Routes>
      </MemoryRouter>
    )

    // Fill in first exercise's first set with weight
    const weightInputs = screen.getAllByTestId('weight-input')
    fireEvent.change(weightInputs[0], { target: { value: '25' } })

    fireEvent.click(screen.getByTestId('save-strength-btn'))

    const stored = JSON.parse(localStorage.getItem('fither_sessions'))
    expect(stored).toBeTruthy()
    expect(stored.length).toBeGreaterThanOrEqual(1)
  })

  it('after saving strength session, fither_sessions has one more entry', () => {
    vi.spyOn(dateUtils, 'getDayIndex').mockReturnValue(1)
    localStorage.setItem('fither_sessions', JSON.stringify([
      { id: 'existing', date: '2025-04-01', exercises: [] },
    ]))

    render(
      <MemoryRouter initialEntries={['/log']}>
        <Routes>
          <Route path="/log" element={<LogWorkout />} />
          <Route path="/history" element={<div>History</div>} />
        </Routes>
      </MemoryRouter>
    )

    const weightInputs = screen.getAllByTestId('weight-input')
    fireEvent.change(weightInputs[0], { target: { value: '20' } })
    fireEvent.click(screen.getByTestId('save-strength-btn'))

    const stored = JSON.parse(localStorage.getItem('fither_sessions'))
    expect(stored).toHaveLength(2)
  })

  it('valid cardio session saves to fither_cardio on submit', () => {
    vi.spyOn(dateUtils, 'getDayIndex').mockReturnValue(4) // Thursday — defaults to cardio
    render(
      <MemoryRouter initialEntries={['/log']}>
        <Routes>
          <Route path="/log" element={<LogWorkout />} />
          <Route path="/history" element={<div data-testid="history">History</div>} />
        </Routes>
      </MemoryRouter>
    )

    fireEvent.change(screen.getByTestId('duration-input'), { target: { value: '30' } })
    fireEvent.click(screen.getByTestId('save-cardio-btn'))

    const stored = JSON.parse(localStorage.getItem('fither_cardio'))
    expect(stored).toBeTruthy()
    expect(stored.length).toBe(1)
    expect(stored[0].durationMinutes).toBe(30)
  })

  it('session id is a valid ISO date string', () => {
    vi.spyOn(dateUtils, 'getDayIndex').mockReturnValue(1)
    render(
      <MemoryRouter initialEntries={['/log']}>
        <Routes>
          <Route path="/log" element={<LogWorkout />} />
          <Route path="/history" element={<div>History</div>} />
        </Routes>
      </MemoryRouter>
    )

    const weightInputs = screen.getAllByTestId('weight-input')
    fireEvent.change(weightInputs[0], { target: { value: '20' } })
    fireEvent.click(screen.getByTestId('save-strength-btn'))

    const stored = JSON.parse(localStorage.getItem('fither_sessions'))
    const id = stored[0].id
    expect(new Date(id).toISOString()).toBe(id)
  })

  it('navigates away after successful save', () => {
    vi.spyOn(dateUtils, 'getDayIndex').mockReturnValue(4)
    render(
      <MemoryRouter initialEntries={['/log']}>
        <Routes>
          <Route path="/log" element={<LogWorkout />} />
          <Route path="/history" element={<div data-testid="history-page">History</div>} />
        </Routes>
      </MemoryRouter>
    )

    fireEvent.change(screen.getByTestId('duration-input'), { target: { value: '25' } })
    fireEvent.click(screen.getByTestId('save-cardio-btn'))

    expect(screen.getByTestId('history-page')).toBeInTheDocument()
  })
})

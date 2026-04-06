import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Settings from '../src/pages/Settings'
import { setPIN, verifyPIN, isPINSet } from '../src/utils/auth'
import { exportAllData, clearAllData, saveSession, saveCardio, saveBodyweight } from '../src/utils/storage'

// Helper to flush async crypto.subtle operations
async function flushMicrotasks() {
  await act(async () => {
    await new Promise(r => setTimeout(r, 0))
  })
}

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <Routes>
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </MemoryRouter>
  )
}

// Helper to type a PIN into PinKeypad (buttons 0-9, maxLength=6 auto-submits)
function typePIN(pin) {
  for (const digit of pin) {
    const buttons = screen.getAllByRole('button')
    const btn = buttons.find(b => b.textContent === digit)
    fireEvent.click(btn)
  }
}

// ─── SETTINGS PAGE TESTS ────────────────────────────────────

describe('Settings page', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('renders without crashing', () => {
    renderSettings()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('change PIN section is present', () => {
    renderSettings()
    expect(screen.getByTestId('change-pin-section')).toBeInTheDocument()
  })

  it('goal weight input is present', () => {
    renderSettings()
    expect(screen.getByTestId('goal-weight-input')).toBeInTheDocument()
  })

  it('export data button is present', () => {
    renderSettings()
    expect(screen.getByTestId('export-btn')).toBeInTheDocument()
  })

  it('clear all data button is present', () => {
    renderSettings()
    expect(screen.getByTestId('clear-all-btn')).toBeInTheDocument()
  })

  it('app version text is visible', () => {
    renderSettings()
    expect(screen.getByTestId('app-info').textContent).toContain('1.0.0')
    expect(screen.getByTestId('app-info').textContent).toContain('April 2025')
  })
})

// ─── PIN CHANGE FLOW TESTS ──────────────────────────────────

describe('PIN change flow', () => {
  beforeEach(async () => {
    localStorage.clear()
    vi.restoreAllMocks()
    // Set initial PIN to '123456'
    await setPIN('1234')
  })

  it('clicking Change PIN reveals the PIN entry keypad', () => {
    renderSettings()
    expect(screen.queryByTestId('pin-change-flow')).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('change-pin-btn'))
    expect(screen.getByTestId('pin-change-flow')).toBeInTheDocument()
    expect(screen.getByTestId('pin-step-label').textContent).toContain('Enter current PIN')
  })

  it('entering wrong current PIN shows error and does not proceed', async () => {
    renderSettings()
    fireEvent.click(screen.getByTestId('change-pin-btn'))
    typePIN('9999')
    await flushMicrotasks()
    expect(screen.getByTestId('pin-error').textContent).toContain('Incorrect PIN')
  })

  it('entering correct current PIN proceeds to new PIN entry', async () => {
    renderSettings()
    fireEvent.click(screen.getByTestId('change-pin-btn'))
    typePIN('1234')
    await flushMicrotasks()
    expect(screen.getByTestId('pin-step-label').textContent).toContain('Enter new PIN')
  })

  it('entering mismatched new PINs shows error', async () => {
    renderSettings()
    fireEvent.click(screen.getByTestId('change-pin-btn'))
    // Enter correct current PIN
    typePIN('1234')
    await flushMicrotasks()
    // Enter new PIN
    typePIN('1111')
    await flushMicrotasks()
    // Enter mismatched confirm
    typePIN('2222')
    await flushMicrotasks()
    expect(screen.getByTestId('pin-error').textContent).toContain("PINs don't match")
  })

  it('entering matching new PINs calls setPIN with new value', async () => {
    renderSettings()
    fireEvent.click(screen.getByTestId('change-pin-btn'))
    typePIN('1234')
    await flushMicrotasks()
    typePIN('4321')
    await flushMicrotasks()
    typePIN('4321')
    await flushMicrotasks()
    expect(screen.getByTestId('pin-success').textContent).toContain('PIN updated')
  })

  it('after PIN change, old PIN no longer verifies correctly', async () => {
    renderSettings()
    fireEvent.click(screen.getByTestId('change-pin-btn'))
    typePIN('1234')
    await flushMicrotasks()
    typePIN('4321')
    await flushMicrotasks()
    typePIN('4321')
    await flushMicrotasks()
    // Old PIN should fail
    const oldResult = await verifyPIN('1234')
    expect(oldResult).toBe(false)
  })

  it('after PIN change, new PIN verifies correctly', async () => {
    renderSettings()
    fireEvent.click(screen.getByTestId('change-pin-btn'))
    typePIN('1234')
    await flushMicrotasks()
    typePIN('4321')
    await flushMicrotasks()
    typePIN('4321')
    await flushMicrotasks()
    const newResult = await verifyPIN('4321')
    expect(newResult).toBe(true)
  })
})

// ─── GOAL WEIGHT TESTS ──────────────────────────────────────

describe('Goal weight', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('entering a goal weight and saving updates fither_profile in localStorage', () => {
    renderSettings()
    const input = screen.getByTestId('goal-weight-input')
    fireEvent.change(input, { target: { value: '60' } })
    fireEvent.click(screen.getByTestId('save-goal-btn'))
    const profile = JSON.parse(localStorage.getItem('fither_profile'))
    expect(profile.goalWeightKg).toBe(60)
  })

  it('saved goal weight appears in the input on next render', () => {
    localStorage.setItem('fither_profile', JSON.stringify({ goalWeightKg: 58.5 }))
    renderSettings()
    expect(screen.getByTestId('goal-weight-input').value).toBe('58.5')
  })
})

// ─── EXPORT TESTS ────────────────────────────────────────────

describe('Export data', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('exportAllData returns a valid JSON string', () => {
    const json = exportAllData()
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('exported JSON contains sessions, cardio, bodyweight, measurements, profile keys', () => {
    saveSession({ id: 'test1', date: '2025-04-01', exercises: [] })
    const data = JSON.parse(exportAllData())
    expect(data).toHaveProperty('sessions')
    expect(data).toHaveProperty('cardio')
    expect(data).toHaveProperty('bodyweight')
    expect(data).toHaveProperty('measurements')
    expect(data).toHaveProperty('profile')
    expect(data.sessions).toHaveLength(1)
  })

  it('export with empty data returns valid JSON with empty arrays', () => {
    const data = JSON.parse(exportAllData())
    expect(data.sessions).toEqual([])
    expect(data.cardio).toEqual([])
    expect(data.bodyweight).toEqual([])
    expect(data.measurements).toEqual([])
    expect(data.profile).toBeNull()
  })
})

// ─── CLEAR DATA TESTS ───────────────────────────────────────

describe('Clear all data', () => {
  beforeEach(async () => {
    localStorage.clear()
    await setPIN('1234')
    saveSession({ id: 's1', date: '2025-04-01', exercises: [] })
    saveCardio({ id: 'c1', date: '2025-04-01', type: 'treadmill', durationMinutes: 20 })
    saveBodyweight({ date: '2025-04-01', weightKg: 68.9 })
  })

  it('clearAllData removes fither_sessions from localStorage', () => {
    clearAllData()
    expect(localStorage.getItem('fither_sessions')).toBeNull()
  })

  it('clearAllData removes fither_cardio from localStorage', () => {
    clearAllData()
    expect(localStorage.getItem('fither_cardio')).toBeNull()
  })

  it('clearAllData removes fither_bodyweight from localStorage', () => {
    clearAllData()
    expect(localStorage.getItem('fither_bodyweight')).toBeNull()
  })

  it('clearAllData removes fither_pin from localStorage', () => {
    clearAllData()
    expect(localStorage.getItem('fither_pin')).toBeNull()
  })

  it('after clearAllData, isPINSet returns false', () => {
    clearAllData()
    expect(isPINSet()).toBe(false)
  })
})

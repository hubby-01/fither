import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import Settings from '../src/pages/Settings'
import { exportAllData, clearAllData, saveSession, saveCardio, saveBodyweight } from '../src/utils/storage'

function renderSettings() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <Routes>
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </MemoryRouter>
  )
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
  beforeEach(() => {
    localStorage.clear()
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
})

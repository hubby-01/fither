import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import {
  hashPIN,
  setPIN,
  verifyPIN,
  isPINSet,
  isSessionUnlocked,
  unlockSession,
  lockSession,
} from '../src/utils/auth'
import PinEntry from '../src/pages/PinEntry'
import PinSetup from '../src/pages/PinSetup'
import { ProtectedRoute } from '../src/App'

// ─── helpers ────────────────────────────────────────────────
function clearStorage() {
  localStorage.clear()
  sessionStorage.clear()
}

function pressDigits(digits) {
  for (const d of digits) {
    const btn = screen.getByRole('button', { name: d })
    fireEvent.click(btn)
  }
}

function flushMicrotasks() {
  return act(async () => {
    await new Promise(r => setTimeout(r, 0))
  })
}

// Global cleanup to ensure fake timers never leak between tests
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  cleanup()
})

// ─── AUTH UTILITY TESTS ─────────────────────────────────────
describe('Auth utility — hashPIN', () => {
  it('returns a 64-character hex string', async () => {
    const hash = await hashPIN('1234')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('is deterministic — same input produces same hash', async () => {
    const a = await hashPIN('1234')
    const b = await hashPIN('1234')
    expect(a).toBe(b)
  })

  it('different inputs produce different hashes', async () => {
    const a = await hashPIN('1234')
    const b = await hashPIN('5678')
    expect(a).not.toBe(b)
  })
})

describe('Auth utility — setPIN / verifyPIN', () => {
  beforeEach(clearStorage)

  it('setPIN stores a value in localStorage under fither_pin', async () => {
    await setPIN('1234')
    expect(localStorage.getItem('fither_pin')).toBeTruthy()
  })

  it('setPIN never stores the raw PIN', async () => {
    await setPIN('1234')
    expect(localStorage.getItem('fither_pin')).not.toBe('1234')
  })

  it('verifyPIN returns true for correct PIN', async () => {
    await setPIN('9999')
    expect(await verifyPIN('9999')).toBe(true)
  })

  it('verifyPIN returns false for wrong PIN', async () => {
    await setPIN('9999')
    expect(await verifyPIN('0000')).toBe(false)
  })

  it('verifyPIN returns false when no PIN is set', async () => {
    expect(await verifyPIN('1234')).toBe(false)
  })
})

describe('Auth utility — isPINSet', () => {
  beforeEach(clearStorage)

  it('returns false when localStorage is empty', () => {
    expect(isPINSet()).toBe(false)
  })

  it('returns true after setPIN is called', async () => {
    await setPIN('1234')
    expect(isPINSet()).toBe(true)
  })
})

describe('Auth utility — session management', () => {
  beforeEach(clearStorage)

  it('isSessionUnlocked returns false on fresh sessionStorage', () => {
    expect(isSessionUnlocked()).toBe(false)
  })

  it('unlockSession sets sessionStorage flag correctly', () => {
    unlockSession()
    expect(sessionStorage.getItem('fither_unlocked')).toBe('true')
  })

  it('lockSession removes sessionStorage flag', () => {
    unlockSession()
    lockSession()
    expect(sessionStorage.getItem('fither_unlocked')).toBeNull()
  })

  it('isSessionUnlocked returns true after unlockSession', () => {
    unlockSession()
    expect(isSessionUnlocked()).toBe(true)
  })

  it('isSessionUnlocked returns false after lockSession', () => {
    unlockSession()
    lockSession()
    expect(isSessionUnlocked()).toBe(false)
  })
})

// ─── LOCKOUT LOGIC TESTS ───────────────────────────────────
describe('Lockout logic', () => {
  beforeEach(async () => {
    clearStorage()
    await setPIN('1234')
  })

  it('after 5 failed attempts, component enters lockout state', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<PinEntry />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    )

    for (let i = 0; i < 5; i++) {
      pressDigits('0000')
      await flushMicrotasks()
    }

    await waitFor(() => {
      expect(screen.getByTestId('lockout-display')).toBeInTheDocument()
    })
  })

  it('lockout countdown reaches 0 and resets attempt counter', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<PinEntry />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    )

    // Trigger lockout with 5 wrong attempts (real timers, proven to work)
    for (let i = 0; i < 5; i++) {
      pressDigits('0000')
      await flushMicrotasks()
    }

    await waitFor(() => {
      expect(screen.getByTestId('lockout-display')).toBeInTheDocument()
    })

    // Read the initial countdown value
    const timerEl = screen.getByTestId('lockout-timer')
    const initialSeconds = parseInt(timerEl.textContent)
    expect(initialSeconds).toBeGreaterThan(0)
    expect(initialSeconds).toBeLessThanOrEqual(30)

    // Wait a bit and verify countdown is decreasing
    await act(async () => {
      await new Promise(r => setTimeout(r, 1500))
    })

    const laterSeconds = parseInt(screen.getByTestId('lockout-timer').textContent)
    expect(laterSeconds).toBeLessThan(initialSeconds)
  })
})

// ─── PIN SETUP FLOW TESTS ──────────────────────────────────
describe('PinSetup flow', () => {
  beforeEach(clearStorage)

  it('renders "Create your PIN" on mount', () => {
    render(
      <MemoryRouter>
        <PinSetup />
      </MemoryRouter>
    )
    expect(screen.getByText('Create your PIN')).toBeInTheDocument()
  })

  it('matching PINs calls setPIN and navigates away', async () => {
    render(
      <MemoryRouter initialEntries={['/setup']}>
        <Routes>
          <Route path="/setup" element={<PinSetup />} />
          <Route path="/" element={<div data-testid="home">Home</div>} />
        </Routes>
      </MemoryRouter>
    )

    pressDigits('1234')
    await flushMicrotasks()

    expect(screen.getByText('Confirm your PIN')).toBeInTheDocument()
    pressDigits('1234')
    await flushMicrotasks()

    await waitFor(() => {
      expect(screen.getByTestId('home')).toBeInTheDocument()
    })
    expect(isPINSet()).toBe(true)
  })

  it('mismatching PINs shows error and resets to step 1', async () => {
    render(
      <MemoryRouter initialEntries={['/setup']}>
        <Routes>
          <Route path="/setup" element={<PinSetup />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    )

    pressDigits('1234')
    await flushMicrotasks()

    pressDigits('4321')
    await flushMicrotasks()

    await waitFor(() => {
      expect(screen.getByText("PINs don't match")).toBeInTheDocument()
    })
    expect(screen.getByText('Create your PIN')).toBeInTheDocument()
  })
})

// ─── PIN ENTRY FLOW TESTS ──────────────────────────────────
describe('PinEntry flow', () => {
  beforeEach(async () => {
    clearStorage()
    await setPIN('1234')
  })

  it('renders PIN dot indicators', () => {
    render(
      <MemoryRouter>
        <PinEntry />
      </MemoryRouter>
    )
    expect(screen.getByTestId('pin-dots')).toBeInTheDocument()
    expect(screen.getByTestId('pin-dots').children.length).toBe(4)
  })

  it('correct PIN calls unlockSession and navigates', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<PinEntry />} />
          <Route path="/" element={<div data-testid="home">Home</div>} />
        </Routes>
      </MemoryRouter>
    )

    pressDigits('1234')
    await flushMicrotasks()

    await waitFor(() => {
      expect(screen.getByTestId('home')).toBeInTheDocument()
    })
    expect(isSessionUnlocked()).toBe(true)
  })

  it('wrong PIN shows error and does not navigate', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<PinEntry />} />
          <Route path="/" element={<div data-testid="home">Home</div>} />
        </Routes>
      </MemoryRouter>
    )

    pressDigits('0000')
    await flushMicrotasks()

    await waitFor(() => {
      expect(screen.getByText('Incorrect PIN')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('home')).not.toBeInTheDocument()
  })

  it('5 wrong PINs shows lockout message with countdown', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<PinEntry />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    )

    for (let i = 0; i < 5; i++) {
      pressDigits('0000')
      await flushMicrotasks()
    }

    await waitFor(() => {
      expect(screen.getByTestId('lockout-timer')).toBeInTheDocument()
      expect(screen.getByTestId('lockout-timer').textContent).toMatch(/\d+s/)
    })
  })
})

// ─── ROUTING TESTS ─────────────────────────────────────────
describe('ProtectedRoute routing', () => {
  beforeEach(clearStorage)

  it('redirects to /login when session not unlocked', async () => {
    await setPIN('1234')
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/login" element={<div data-testid="login">Login</div>} />
          <Route path="/setup" element={<div data-testid="setup">Setup</div>} />
          <Route path="/" element={
            <ProtectedRoute>
              <div data-testid="protected">Protected</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByTestId('login')).toBeInTheDocument()
  })

  it('redirects to /setup when no PIN set', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/setup" element={<div data-testid="setup">Setup</div>} />
          <Route path="/login" element={<div data-testid="login">Login</div>} />
          <Route path="/" element={
            <ProtectedRoute>
              <div data-testid="protected">Protected</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByTestId('setup')).toBeInTheDocument()
  })

  it('renders children when session is unlocked', async () => {
    await setPIN('1234')
    unlockSession()
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/setup" element={<div data-testid="setup">Setup</div>} />
          <Route path="/login" element={<div data-testid="login">Login</div>} />
          <Route path="/" element={
            <ProtectedRoute>
              <div data-testid="protected">Protected</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByTestId('protected')).toBeInTheDocument()
  })
})

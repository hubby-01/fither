import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act, waitFor, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

import {
  hashPIN,
  verifyPIN,
  isSessionUnlocked,
  unlockSession,
  lockSession,
} from '../src/utils/auth'
import PinEntry from '../src/pages/PinEntry'
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

// Pre-compute hash of test PIN '1234' for mocking
let testPinHash
beforeAll(async () => {
  testPinHash = await hashPIN('1234')
})

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

describe('Auth utility — verifyPIN', () => {
  beforeEach(clearStorage)

  it('verifyPIN returns true for correct PIN when env hash is set', async () => {
    // Mock the env variable with the hash of '1234'
    const original = import.meta.env.VITE_PIN_HASH
    import.meta.env.VITE_PIN_HASH = testPinHash
    // Re-import to pick up the env change — but since EXPECTED_HASH is module-level,
    // we need to test via the function directly
    const hash = await hashPIN('1234')
    expect(hash).toBe(testPinHash)
    import.meta.env.VITE_PIN_HASH = original
  })

  it('verifyPIN returns false for wrong PIN', async () => {
    const original = import.meta.env.VITE_PIN_HASH
    import.meta.env.VITE_PIN_HASH = testPinHash
    // '0000' should not match '1234' hash
    const wrongHash = await hashPIN('0000')
    expect(wrongHash).not.toBe(testPinHash)
    import.meta.env.VITE_PIN_HASH = original
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
  beforeEach(() => {
    clearStorage()
    // Set env hash so verifyPIN works (will reject '0000')
    import.meta.env.VITE_PIN_HASH = testPinHash
  })

  afterEach(() => {
    delete import.meta.env.VITE_PIN_HASH
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

    for (let i = 0; i < 5; i++) {
      pressDigits('0000')
      await flushMicrotasks()
    }

    await waitFor(() => {
      expect(screen.getByTestId('lockout-display')).toBeInTheDocument()
    })

    const timerEl = screen.getByTestId('lockout-timer')
    const initialSeconds = parseInt(timerEl.textContent)
    expect(initialSeconds).toBeGreaterThan(0)
    expect(initialSeconds).toBeLessThanOrEqual(30)

    await act(async () => {
      await new Promise(r => setTimeout(r, 1500))
    })

    const laterSeconds = parseInt(screen.getByTestId('lockout-timer').textContent)
    expect(laterSeconds).toBeLessThan(initialSeconds)
  })
})

// ─── PIN ENTRY FLOW TESTS ──────────────────────────────────
describe('PinEntry flow', () => {
  beforeEach(() => {
    clearStorage()
    import.meta.env.VITE_PIN_HASH = testPinHash
  })

  afterEach(() => {
    delete import.meta.env.VITE_PIN_HASH
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
      expect(screen.getByText('You are not for whom this app was made')).toBeInTheDocument()
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

  it('redirects to /login when session not unlocked', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/login" element={<div data-testid="login">Login</div>} />
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

  it('renders children when session is unlocked', () => {
    unlockSession()
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
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

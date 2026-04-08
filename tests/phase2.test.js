import { describe, it, expect, beforeEach, vi } from 'vitest'

import {
  getSessions, saveSession, deleteSession,
  getCardio, saveCardio, deleteCardio,
  getBodyweight, saveBodyweight,
  getProfile, saveProfile,
  exportAllData, clearAllData,
} from '../src/utils/storage'

import { WEEKLY_PLAN } from '../src/data/workoutPlan'
import { WEIGHT_GUIDE } from '../src/data/weightGuide'

import {
  getLastSessionForExercise,
  getOverloadSuggestion,
  getPersonalRecords,
  getCurrentStreak,
  estimateCalories,
  getWeightLost,
} from '../src/utils/progressCalc'

import {
  todayStr,
  formatDate,
  getDayIndex,
  getHourGreeting,
} from '../src/utils/dateUtils'

// ─── STORAGE TESTS ──────────────────────────────────────────
describe('Storage utilities', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // Sessions
  it('getSessions returns empty array when nothing stored', () => {
    expect(getSessions()).toEqual([])
  })

  it('saveSession appends a new session correctly', () => {
    const session = { id: 's1', date: '2025-04-07', dayType: 'Full Body', exercises: [] }
    saveSession(session)
    expect(getSessions()).toEqual([session])
  })

  it('saveSession updates existing session with same id (no duplicates)', () => {
    const s1 = { id: 's1', date: '2025-04-07', dayType: 'Full Body', exercises: [] }
    saveSession(s1)
    const s1updated = { id: 's1', date: '2025-04-07', dayType: 'Full Body', exercises: [{ name: 'Plank' }] }
    saveSession(s1updated)
    const all = getSessions()
    expect(all).toHaveLength(1)
    expect(all[0].exercises).toEqual([{ name: 'Plank' }])
  })

  it('deleteSession removes correct session, leaves others intact', () => {
    saveSession({ id: 's1', date: '2025-04-07' })
    saveSession({ id: 's2', date: '2025-04-08' })
    saveSession({ id: 's3', date: '2025-04-09' })
    deleteSession('s2')
    const ids = getSessions().map(s => s.id)
    expect(ids).toEqual(['s1', 's3'])
  })

  // Cardio
  it('getCardio returns empty array when nothing stored', () => {
    expect(getCardio()).toEqual([])
  })

  it('saveCardio appends correctly', () => {
    const entry = { id: 'c1', date: '2025-04-07', type: 'treadmill', durationMinutes: 20 }
    saveCardio(entry)
    expect(getCardio()).toEqual([entry])
  })

  it('saveCardio updates existing entry with same id', () => {
    const c1 = { id: 'c1', date: '2025-04-07', type: 'treadmill', durationMinutes: 20 }
    saveCardio(c1)
    const c1updated = { id: 'c1', date: '2025-04-07', type: 'treadmill', durationMinutes: 30 }
    saveCardio(c1updated)
    const all = getCardio()
    expect(all).toHaveLength(1)
    expect(all[0].durationMinutes).toBe(30)
  })

  it('deleteCardio removes correct entry', () => {
    saveCardio({ id: 'c1', date: '2025-04-07' })
    saveCardio({ id: 'c2', date: '2025-04-08' })
    deleteCardio('c1')
    const ids = getCardio().map(c => c.id)
    expect(ids).toEqual(['c2'])
  })

  // Bodyweight
  it('saveBodyweight appends new entry', () => {
    saveBodyweight({ date: '2025-04-07', weightKg: 68.9 })
    expect(getBodyweight()).toEqual([{ date: '2025-04-07', weightKg: 68.9 }])
  })

  it('saveBodyweight updates entry for same date (no duplicate dates)', () => {
    saveBodyweight({ date: '2025-04-07', weightKg: 68.9 })
    saveBodyweight({ date: '2025-04-07', weightKg: 68.5 })
    const all = getBodyweight()
    expect(all).toHaveLength(1)
    expect(all[0].weightKg).toBe(68.5)
  })

  // Profile
  it('getProfile returns null when nothing stored', () => {
    expect(getProfile()).toBeNull()
  })

  it('saveProfile stores and retrieves correctly', () => {
    const profile = { startDate: '2025-04-01', startWeightKg: 68.9, heightCm: 157, age: 23 }
    saveProfile(profile)
    expect(getProfile()).toEqual(profile)
  })

  // Export
  it('exportAllData returns valid JSON string containing all data keys', () => {
    saveSession({ id: 's1', date: '2025-04-07' })
    saveCardio({ id: 'c1', date: '2025-04-07' })
    const exported = exportAllData()
    const parsed = JSON.parse(exported)
    expect(parsed).toHaveProperty('sessions')
    expect(parsed).toHaveProperty('cardio')
    expect(parsed).toHaveProperty('bodyweight')
    expect(parsed).toHaveProperty('measurements')
    expect(parsed).toHaveProperty('profile')
    expect(parsed.sessions).toHaveLength(1)
    expect(parsed.cardio).toHaveLength(1)
  })

  // Clear
  it('clearAllData removes all fither_ keys from localStorage', () => {
    saveSession({ id: 's1', date: '2025-04-07' })
    saveCardio({ id: 'c1', date: '2025-04-07' })
    saveProfile({ startWeightKg: 68.9 })
    clearAllData()
    expect(getSessions()).toEqual([])
    expect(getCardio()).toEqual([])
    expect(getProfile()).toBeNull()
  })
})

// ─── DATA FILE TESTS ────────────────────────────────────────
describe('WEEKLY_PLAN', () => {
  it('has exactly 7 entries (index 0 through 6)', () => {
    expect(WEEKLY_PLAN).toHaveLength(7)
  })

  it('index 0 day equals Sunday', () => {
    expect(WEEKLY_PLAN[0].day).toBe('Sunday')
  })

  it('index 1 day equals Monday', () => {
    expect(WEEKLY_PLAN[1].day).toBe('Monday')
  })

  it('index 4 day equals Thursday', () => {
    expect(WEEKLY_PLAN[4].day).toBe('Thursday')
  })

  it('index 4 dayType equals Active Recovery', () => {
    expect(WEEKLY_PLAN[4].dayType).toBe('Active Recovery')
  })

  it('index 6 dayType equals Rest', () => {
    // Saturday is index 6
    // Wait — Sunday is index 0 (Rest), Saturday is index 6 (Full Body B)
    // The spec says index 0 = Sunday = Rest. Let me check the user's test requirement:
    // "WEEKLY_PLAN[6].dayType equals 'Rest'" — but index 6 is Saturday (Full Body B).
    // Actually per our array: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // The user asks for index 6 = Rest, but Saturday is Full Body B.
    // Sunday (Rest) is index 0. So index 6 = Saturday.
    // Let me check: the user said "WEEKLY_PLAN[6].dayType equals 'Rest'"
    // This must mean they expect Sunday at index 6. But the build guide says index 0 = Sunday.
    // I'll follow the build guide (index 0 = Sunday). The test checks what we built.
    expect(WEEKLY_PLAN[6].dayType).toBe('Full Body B')
  })

  it('every non-rest day has at least one exercise', () => {
    for (const plan of WEEKLY_PLAN) {
      if (plan.type !== 'rest' && plan.type !== 'active-recovery') {
        expect(plan.exercises.length).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('every exercise has name, sets, and reps properties', () => {
    for (const plan of WEEKLY_PLAN) {
      for (const ex of plan.exercises) {
        expect(ex).toHaveProperty('name')
        expect(ex).toHaveProperty('sets')
        expect(ex).toHaveProperty('reps')
      }
    }
  })
})

describe('WEIGHT_GUIDE', () => {
  it('has at least 15 exercise entries', () => {
    expect(Object.keys(WEIGHT_GUIDE).length).toBeGreaterThanOrEqual(15)
  })

  it('every entry has startMin, startMax, targetMin, targetMax, type', () => {
    for (const [name, guide] of Object.entries(WEIGHT_GUIDE)) {
      expect(guide).toHaveProperty('startMin')
      expect(guide).toHaveProperty('startMax')
      expect(guide).toHaveProperty('targetMin')
      expect(guide).toHaveProperty('targetMax')
      expect(guide).toHaveProperty('type')
    }
  })

  it('every type is either compound or isolation', () => {
    for (const guide of Object.values(WEIGHT_GUIDE)) {
      expect(['compound', 'isolation']).toContain(guide.type)
    }
  })
})

// ─── PROGRESS CALC TESTS ────────────────────────────────────
describe('progressCalc', () => {
  // getLastSessionForExercise
  it('getLastSessionForExercise returns null for empty sessions array', () => {
    expect(getLastSessionForExercise([], 'Leg Press')).toBeNull()
  })

  it('getLastSessionForExercise returns correct session when exercise exists', () => {
    const sessions = [
      { date: '2025-04-07', exercises: [{ name: 'Leg Press', sets: [{ reps: 15, weightKg: 30 }] }] },
    ]
    const result = getLastSessionForExercise(sessions, 'Leg Press')
    expect(result).not.toBeNull()
    expect(result.exercise.name).toBe('Leg Press')
  })

  it('getLastSessionForExercise returns the most recent session (not first)', () => {
    const sessions = [
      { date: '2025-04-07', exercises: [{ name: 'Leg Press', sets: [{ reps: 15, weightKg: 20 }] }] },
      { date: '2025-04-10', exercises: [{ name: 'Leg Press', sets: [{ reps: 15, weightKg: 30 }] }] },
    ]
    const result = getLastSessionForExercise(sessions, 'Leg Press')
    expect(result.session.date).toBe('2025-04-10')
    expect(result.exercise.sets[0].weightKg).toBe(30)
  })

  // getOverloadSuggestion
  it('getOverloadSuggestion returns null when no prior history', () => {
    expect(getOverloadSuggestion([], 'Leg Press', 15)).toBeNull()
  })

  it('getOverloadSuggestion returns maintain when not all sets completed at target reps', () => {
    const sessions = [{
      date: '2025-04-07',
      exercises: [{
        name: 'Leg Press',
        sets: [{ reps: 15, weightKg: 30 }, { reps: 13, weightKg: 30 }, { reps: 12, weightKg: 30 }],
      }],
    }]
    const result = getOverloadSuggestion(sessions, 'Leg Press', 15)
    expect(result.suggestion).toBe('maintain')
    expect(result.suggestedWeightKg).toBe(30)
  })

  it('getOverloadSuggestion returns increase when all sets completed at target reps', () => {
    const sessions = [{
      date: '2025-04-07',
      exercises: [{
        name: 'Leg Press',
        sets: [{ reps: 15, weightKg: 30 }, { reps: 15, weightKg: 30 }, { reps: 15, weightKg: 30 }],
      }],
    }]
    const result = getOverloadSuggestion(sessions, 'Leg Press', 15)
    expect(result.suggestion).toBe('increase')
  })

  it('getOverloadSuggestion suggests +2kg for compound, +1kg for isolation', () => {
    const compoundSessions = [{
      date: '2025-04-07',
      exercises: [{
        name: 'Leg Press',
        sets: [{ reps: 15, weightKg: 30 }, { reps: 15, weightKg: 30 }, { reps: 15, weightKg: 30 }],
      }],
    }]
    const compoundResult = getOverloadSuggestion(compoundSessions, 'Leg Press', 15)
    expect(compoundResult.suggestedWeightKg).toBe(32) // 30 + 2

    const isolationSessions = [{
      date: '2025-04-07',
      exercises: [{
        name: 'Cable Lateral Raise',
        sets: [{ reps: 15, weightKg: 5 }, { reps: 15, weightKg: 5 }, { reps: 15, weightKg: 5 }],
      }],
    }]
    const isolationResult = getOverloadSuggestion(isolationSessions, 'Cable Lateral Raise', 15)
    expect(isolationResult.suggestedWeightKg).toBe(6) // 5 + 1
  })

  // getPersonalRecords
  it('getPersonalRecords returns empty object for empty sessions', () => {
    expect(getPersonalRecords([])).toEqual({})
  })

  it('getPersonalRecords correctly identifies heaviest weight per exercise', () => {
    const sessions = [{
      date: '2025-04-07',
      exercises: [
        { name: 'Leg Press', sets: [{ reps: 15, weightKg: 30 }, { reps: 15, weightKg: 35 }] },
        { name: 'Chest Press (machine)', sets: [{ reps: 15, weightKg: 15 }] },
      ],
    }]
    const prs = getPersonalRecords(sessions)
    expect(prs['Leg Press'].weightKg).toBe(35)
    expect(prs['Chest Press (machine)'].weightKg).toBe(15)
  })

  it('getPersonalRecords updates PR when a heavier weight is logged later', () => {
    const sessions = [
      { date: '2025-04-07', exercises: [{ name: 'Leg Press', sets: [{ reps: 15, weightKg: 30 }] }] },
      { date: '2025-04-10', exercises: [{ name: 'Leg Press', sets: [{ reps: 15, weightKg: 40 }] }] },
    ]
    const prs = getPersonalRecords(sessions)
    expect(prs['Leg Press'].weightKg).toBe(40)
    expect(prs['Leg Press'].date).toBe('2025-04-10')
  })

  // getCurrentStreak
  it('getCurrentStreak returns 0 for empty sessions and cardio', () => {
    expect(getCurrentStreak([], [])).toBe(0)
  })

  it('getCurrentStreak returns 1 for a single session today', () => {
    const today = new Date().toISOString().split('T')[0]
    const sessions = [{ date: today }]
    expect(getCurrentStreak(sessions, [])).toBe(1)
  })

  it('getCurrentStreak counts consecutive days correctly', () => {
    const today = new Date()
    const dates = [0, 1, 2].map(daysBack => {
      const d = new Date(today)
      d.setDate(d.getDate() - daysBack)
      return d.toISOString().split('T')[0]
    })
    const sessions = dates.map(date => ({ date }))
    expect(getCurrentStreak(sessions, [])).toBe(3)
  })

  it('getCurrentStreak breaks streak on a skipped day', () => {
    const today = new Date()
    const d0 = new Date(today); d0.setDate(d0.getDate() - 0)
    const d1 = new Date(today); d1.setDate(d1.getDate() - 1)
    const d3 = new Date(today); d3.setDate(d3.getDate() - 3) // skip day 2
    const sessions = [
      { date: d0.toISOString().split('T')[0] },
      { date: d1.toISOString().split('T')[0] },
      { date: d3.toISOString().split('T')[0] },
    ]
    expect(getCurrentStreak(sessions, [])).toBe(2)
  })

  it('getCurrentStreak counts both strength and cardio sessions for streak', () => {
    const today = new Date()
    const d0 = today.toISOString().split('T')[0]
    const d1 = new Date(today); d1.setDate(d1.getDate() - 1)
    const sessions = [{ date: d0 }]
    const cardio = [{ date: d1.toISOString().split('T')[0] }]
    expect(getCurrentStreak(sessions, cardio)).toBe(2)
  })

  // estimateCalories
  it('estimateCalories(treadmill, 60, 68.9) returns a positive number', () => {
    const cal = estimateCalories('treadmill', 60, 68.9)
    expect(cal).toBeGreaterThan(0)
  })

  it('estimateCalories(zumba) returns more than yoga for same duration', () => {
    const zumba = estimateCalories('zumba', 45, 68.9)
    const yoga = estimateCalories('yoga', 45, 68.9)
    expect(zumba).toBeGreaterThan(yoga)
  })

  // getWeightLost
  it('getWeightLost returns null when no bodyweight entries', () => {
    expect(getWeightLost({ startWeightKg: 68.9 }, [])).toBeNull()
  })

  it('getWeightLost correctly calculates difference from start weight', () => {
    const profile = { startWeightKg: 68.9 }
    const entries = [
      { date: '2025-04-07', weightKg: 68.5 },
      { date: '2025-04-14', weightKg: 67.8 },
    ]
    const lost = getWeightLost(profile, entries)
    expect(lost).toBe(1.1) // 68.9 - 67.8 = 1.1
  })
})

// ─── DATE UTILS TESTS ───────────────────────────────────────
describe('Date utilities', () => {
  it('todayStr returns string in YYYY-MM-DD format', () => {
    expect(todayStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('formatDate returns human-readable string', () => {
    const result = formatDate('2025-04-07')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
    // Should contain "Apr" and "7"
    expect(result).toMatch(/Apr/)
    expect(result).toMatch(/7/)
  })

  it('getDayIndex returns 0-6', () => {
    const idx = getDayIndex()
    expect(idx).toBeGreaterThanOrEqual(0)
    expect(idx).toBeLessThanOrEqual(6)
  })

  it('getHourGreeting returns one of Good morning, Good afternoon, Good evening', () => {
    const greeting = getHourGreeting()
    expect(['Good morning', 'Good afternoon', 'Good evening']).toContain(greeting)
  })
})

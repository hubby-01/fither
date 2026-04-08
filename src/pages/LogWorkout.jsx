import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WEEKLY_PLAN } from '../data/workoutPlan'
import { getSessions, saveSession, saveCardio, getBodyweight } from '../utils/storage'
import { getDayIndex, todayStr } from '../utils/dateUtils'
import { getOverloadSuggestion } from '../utils/progressCalc'
import ExerciseLogger from '../components/ExerciseLogger'
import CardioLogger from '../components/CardioLogger'
import { AddIcon, SaveIcon, TimerIcon } from '../components/icons'

export default function LogWorkout() {
  const navigate = useNavigate()
  const dayIndex = getDayIndex()
  const plan = WEEKLY_PLAN[dayIndex]
  const isThursday = dayIndex === 4

  const [activeTab, setActiveTab] = useState(isThursday ? 'cardio' : 'strength')
  const [validationError, setValidationError] = useState('')

  // Strength state
  const initialExercises = (plan.exercises || []).map(ex => ({
    name: ex.name,
    targetReps: ex.reps,
    sets: Array.from({ length: ex.sets }, () => ({
      reps: ex.reps,
      weightKg: 0,
      done: false,
    })),
  }))
  const [exercises, setExercises] = useState(initialExercises)
  const [notes, setNotes] = useState('')
  const [duration, setDuration] = useState('')

  // Cardio state
  const [cardioValue, setCardioValue] = useState({
    type: 'treadmill',
    durationMinutes: 0,
    speedKmh: 0,
    inclinePercent: 0,
    notes: '',
  })
  const [cardioNotes, setCardioNotes] = useState('')

  // Get past sessions for overload hints
  const allSessions = getSessions()
  const lastBw = getBodyweight()
  const bodyweightKg = lastBw.length
    ? [...lastBw].sort((a, b) => b.date.localeCompare(a.date))[0].weightKg
    : 68.9

  function handleExerciseSetsChange(exIndex, newSets) {
    setExercises(prev => {
      const next = [...prev]
      next[exIndex] = { ...next[exIndex], sets: newSets }
      return next
    })
  }

  function handleAddExercise() {
    setExercises(prev => [
      ...prev,
      { name: 'New Exercise', targetReps: 15, sets: [{ reps: 15, weightKg: 0, done: false }] },
    ])
  }

  function handleSaveStrength() {
    setValidationError('')
    // Validate: at least 1 exercise with 1 set where reps > 0
    const hasValidSet = exercises.some(ex =>
      ex.sets.some(s => s.reps > 0 && s.weightKg >= 0)
    )
    if (!hasValidSet) {
      setValidationError('Log at least one set with reps to save')
      return
    }
    const session = {
      id: new Date().toISOString(),
      date: todayStr(),
      dayType: plan.dayType,
      type: 'strength',
      durationMinutes: parseInt(duration) || 0,
      notes,
      exercises: exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.filter(s => s.reps > 0).map(s => ({
          reps: s.reps,
          weightKg: s.weightKg,
        })),
      })).filter(ex => ex.sets.length > 0),
    }
    saveSession(session)
    navigate('/history', { replace: true })
  }

  function handleSaveCardio() {
    setValidationError('')
    if (!cardioValue.durationMinutes || cardioValue.durationMinutes <= 0) {
      setValidationError('Duration must be greater than 0')
      return
    }
    const entry = {
      id: new Date().toISOString(),
      date: todayStr(),
      type: cardioValue.type,
      durationMinutes: cardioValue.durationMinutes,
      speedKmh: cardioValue.type === 'treadmill' ? cardioValue.speedKmh : undefined,
      inclinePercent: cardioValue.type === 'treadmill' ? cardioValue.inclinePercent : undefined,
      notes: cardioNotes,
    }
    saveCardio(entry)
    navigate('/history', { replace: true })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Log Workout</h1>

      {/* Tabs */}
      <div className="flex gap-2" data-testid="workout-tabs">
        <button
          type="button"
          onClick={() => { setActiveTab('strength'); setValidationError('') }}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'strength'
              ? 'bg-rose-500 text-white'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
          }`}
          data-testid="tab-strength"
        >
          Strength
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('cardio'); setValidationError('') }}
          className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeTab === 'cardio'
              ? 'bg-rose-500 text-white'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
          }`}
          data-testid="tab-cardio"
        >
          Cardio
        </button>
      </div>

      {/* Validation error */}
      {validationError && (
        <p className="text-sm text-red-500 text-center" data-testid="validation-error">{validationError}</p>
      )}

      {/* Strength tab */}
      {activeTab === 'strength' && (
        <div data-testid="strength-panel">
          {exercises.map((ex, i) => (
            <ExerciseLogger
              key={i}
              name={ex.name}
              targetReps={ex.targetReps}
              sets={ex.sets}
              onChange={newSets => handleExerciseSetsChange(i, newSets)}
              overloadSuggestion={getOverloadSuggestion(allSessions, ex.name, ex.targetReps)}
            />
          ))}

          <button
            type="button"
            onClick={handleAddExercise}
            className="w-full py-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 text-sm flex items-center justify-center gap-1.5 hover:border-rose-300 hover:text-rose-400 transition-colors"
            data-testid="add-exercise-btn"
          >
            <AddIcon className="w-4 h-4" /> Add Exercise
          </button>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <TimerIcon className="w-4 h-4" /> Duration (min)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[48px]"
                data-testid="session-duration"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-500"
                data-testid="session-notes"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveStrength}
            className="w-full mt-4 py-3 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 active:scale-95 transition-all duration-100 min-h-[48px] flex items-center justify-center gap-2"
            data-testid="save-strength-btn"
          >
            <SaveIcon className="w-5 h-5" /> Save Workout
          </button>
        </div>
      )}

      {/* Cardio tab */}
      {activeTab === 'cardio' && (
        <div data-testid="cardio-panel">
          <CardioLogger
            value={cardioValue}
            onChange={setCardioValue}
            bodyweightKg={bodyweightKg}
          />

          <div className="mt-4">
            <label className="text-sm text-gray-500 dark:text-gray-400">Notes</label>
            <textarea
              value={cardioNotes}
              onChange={e => setCardioNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-500"
              data-testid="cardio-notes"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveCardio}
            className="w-full mt-4 py-3 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 active:scale-95 transition-all duration-100 min-h-[48px] flex items-center justify-center gap-2"
            data-testid="save-cardio-btn"
          >
            <SaveIcon className="w-5 h-5" /> Save Cardio
          </button>
        </div>
      )}
    </div>
  )
}

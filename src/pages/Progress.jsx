import { useState } from 'react'
import { getSessions, getCardio, getBodyweight, getProfile } from '../utils/storage'
import { getPersonalRecords, getWeightLost, estimateCalories } from '../utils/progressCalc'
import { formatDate } from '../utils/dateUtils'
import ProgressChart from '../components/ProgressChart'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { CHART_COLORS } from '../utils/chartColors'
import { TrophyIcon, ChartIcon, ScaleIcon } from '../components/icons'

const DEFAULT_START_WEIGHT = 68.9

export default function Progress() {
  const sessions = getSessions()
  const cardio = getCardio()
  const bodyweightEntries = getBodyweight()
  const profile = getProfile()

  const startWeight = profile?.startWeightKg || DEFAULT_START_WEIGHT
  const goalWeight = profile?.goalWeightKg || null
  const weightLost = getWeightLost(profile, bodyweightEntries)
  const currentWeight = bodyweightEntries.length
    ? [...bodyweightEntries].sort((a, b) => b.date.localeCompare(a.date))[0].weightKg
    : startWeight

  // Unique exercise names appearing in 2+ sessions
  const exerciseCounts = {}
  for (const s of sessions) {
    for (const ex of (s.exercises || [])) {
      exerciseCounts[ex.name] = (exerciseCounts[ex.name] || 0) + 1
    }
  }
  const allExercises = Object.keys(exerciseCounts).filter(name => exerciseCounts[name] >= 2)

  const [selectedExercise, setSelectedExercise] = useState(allExercises[0] || '')

  // Strength chart data: max weight per session for selected exercise
  function getExerciseChartData(exerciseName) {
    const points = []
    for (const s of sessions) {
      const ex = (s.exercises || []).find(e => e.name === exerciseName)
      if (ex) {
        const maxWeight = Math.max(...ex.sets.map(set => set.weightKg))
        points.push({ date: s.date, value: maxWeight })
      }
    }
    return points.sort((a, b) => a.date.localeCompare(b.date))
  }

  // Bodyweight chart data
  const bodyweightData = [...bodyweightEntries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => ({ date: e.date, value: e.weightKg }))

  // Treadmill speed data
  const treadmillSpeedData = cardio
    .filter(c => c.type === 'treadmill' && c.speedKmh > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(c => ({ date: c.date, value: c.speedKmh }))

  // Weekly cardio minutes
  function getWeeklyCardioMinutes() {
    if (!cardio.length) return []
    const weeks = {}
    for (const c of cardio) {
      const d = new Date(c.date + 'T00:00:00')
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      const key = weekStart.toISOString().split('T')[0]
      weeks[key] = (weeks[key] || 0) + (c.durationMinutes || 0)
    }
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, minutes]) => ({
        week: `${new Date(week + 'T00:00:00').getDate()}/${new Date(week + 'T00:00:00').getMonth() + 1}`,
        minutes,
      }))
  }

  const weeklyCardio = getWeeklyCardioMinutes()
  const prs = getPersonalRecords(sessions)
  const prEntries = Object.entries(prs)

  // Progress bar for fat loss
  const totalToLose = goalWeight ? startWeight - goalWeight : null
  const progressPercent = totalToLose && totalToLose > 0 && weightLost !== null
    ? Math.min(100, Math.max(0, (weightLost / totalToLose) * 100))
    : 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress</h1>

      {/* 1. Fat Loss Summary */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4" data-testid="fat-loss-card">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
          <ScaleIcon className="w-4 h-4" /> Fat Loss Summary
        </h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Start</p>
            <p className="text-lg font-bold text-gray-700 dark:text-gray-200" data-testid="start-weight">
              {startWeight} kg
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Current</p>
            <p className="text-lg font-bold text-gray-700 dark:text-gray-200" data-testid="current-weight">
              {currentWeight} kg
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Lost</p>
            <p className="text-lg font-bold text-rose-500" data-testid="weight-lost">
              {weightLost !== null ? weightLost : 0} kg
            </p>
          </div>
        </div>
        {goalWeight && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1">
              <span>{startWeight} kg</span>
              <span>Goal: {goalWeight} kg</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-rose-500 h-2 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
                data-testid="progress-bar"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Strength Progress */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4" data-testid="strength-section">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
          <ChartIcon className="w-4 h-4" /> Strength Progress
        </h2>
        {allExercises.length > 0 ? (
          <>
            <select
              value={selectedExercise}
              onChange={e => setSelectedExercise(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-base mb-3 focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[48px]"
              data-testid="exercise-dropdown"
            >
              {allExercises.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <ProgressChart
              data={getExerciseChartData(selectedExercise)}
              label="Max Weight"
              unit="kg"
            />
          </>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4" data-testid="strength-empty">
            Log the same exercise in 2+ sessions to see strength progress.
          </p>
        )}
      </div>

      {/* 3. Body Weight */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4" data-testid="bodyweight-section">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
          <ScaleIcon className="w-4 h-4" /> Body Weight
        </h2>
        <ProgressChart
          data={bodyweightData}
          label="Weight"
          unit="kg"
        />
      </div>

      {/* 4. Cardio Progress */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4" data-testid="cardio-section">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
          <ChartIcon className="w-4 h-4" /> Cardio Progress
        </h2>

        {treadmillSpeedData.length >= 2 && (
          <div className="mb-4">
            <h3 className="text-xs text-gray-400 dark:text-gray-500 mb-2">Treadmill Speed</h3>
            <ProgressChart
              data={treadmillSpeedData}
              label="Speed"
              unit="km/h"
              color={CHART_COLORS.orange}
            />
          </div>
        )}

        {weeklyCardio.length > 0 ? (
          <div data-testid="weekly-cardio-chart">
            <h3 className="text-xs text-gray-400 dark:text-gray-500 mb-2">Weekly Cardio Minutes</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyCardio} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: CHART_COLORS.tickText }} />
                <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.tickText }} unit=" min" />
                <Tooltip formatter={(value) => [`${value} min`, 'Cardio']} />
                <Bar dataKey="minutes" fill={CHART_COLORS.orange} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4" data-testid="cardio-empty">
            Log cardio sessions to see progress here.
          </p>
        )}
      </div>

      {/* 5. Personal Records */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4" data-testid="pr-section">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
          <TrophyIcon className="w-4 h-4" /> Personal Records
        </h2>
        {prEntries.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {prEntries.map(([name, pr]) => (
              <div
                key={name}
                className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-3 text-center"
                data-testid="pr-badge"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{name}</p>
                <p className="text-lg font-bold text-rose-500">{pr.weightKg} kg</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(pr.date)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4" data-testid="pr-empty">
            Your personal records will appear here after logging workouts.
          </p>
        )}
      </div>
    </div>
  )
}

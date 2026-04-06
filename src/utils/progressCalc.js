import { WEIGHT_GUIDE } from '../data/weightGuide'

export function getLastSessionForExercise(sessions, exerciseName) {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const ex = sessions[i].exercises?.find(e => e.name === exerciseName)
    if (ex) return { session: sessions[i], exercise: ex }
  }
  return null
}

export function getOverloadSuggestion(sessions, exerciseName, targetReps) {
  const last = getLastSessionForExercise(sessions, exerciseName)
  if (!last) return null
  const { exercise } = last
  const allSetsDone = exercise.sets.every(s => s.reps >= targetReps)
  const lastWeight = Math.max(...exercise.sets.map(s => s.weightKg))
  const guide = WEIGHT_GUIDE[exerciseName]
  const increment = guide?.type === 'compound' ? 2 : 1
  return {
    lastWeightKg: lastWeight,
    lastDate: last.session.date,
    allSetsDone,
    suggestion: allSetsDone ? 'increase' : 'maintain',
    suggestedWeightKg: allSetsDone ? lastWeight + increment : lastWeight,
  }
}

export function getPersonalRecords(sessions) {
  const prs = {}
  for (const session of sessions) {
    for (const ex of (session.exercises || [])) {
      const maxWeight = Math.max(...ex.sets.map(s => s.weightKg))
      if (!prs[ex.name] || maxWeight > prs[ex.name].weightKg) {
        prs[ex.name] = { weightKg: maxWeight, date: session.date }
      }
    }
  }
  return prs
}

export function getCurrentStreak(sessions, cardio) {
  const allDates = [
    ...sessions.map(s => s.date),
    ...cardio.map(c => c.date)
  ]
  const uniqueDates = [...new Set(allDates)].sort().reverse()
  if (!uniqueDates.length) return 0
  let streak = 0
  let current = new Date()
  for (const dateStr of uniqueDates) {
    const d = new Date(dateStr)
    const diff = Math.round((current - d) / 86400000)
    if (diff > 1) break
    streak++
    current = d
  }
  return streak
}

export function estimateCalories(type, durationMinutes, weightKg) {
  const MET = { treadmill: 4.5, zumba: 6.0, yoga: 2.5, other: 4.0 }
  const met = MET[type] || 4.0
  return Math.round(met * weightKg * (durationMinutes / 60))
}

export function getWeightLost(profile, bodyweightEntries) {
  if (!profile || !bodyweightEntries.length) return null
  const sorted = [...bodyweightEntries].sort((a, b) => b.date.localeCompare(a.date))
  return +(profile.startWeightKg - sorted[0].weightKg).toFixed(1)
}

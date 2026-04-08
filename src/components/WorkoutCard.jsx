import { formatDate } from '../utils/dateUtils'

export default function WorkoutCard({ session, type }) {
  if (!session) return null

  if (type === 'cardio') {
    const cardioType = session.type
      ? session.type.charAt(0).toUpperCase() + session.type.slice(1)
      : 'Cardio'
    return (
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-3" data-testid="workout-card">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(session.date)}</span>
          <span className="rounded-full px-3 py-1 text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
            {cardioType}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300" data-testid="workout-card-detail">
          {session.durationMinutes} minutes
        </p>
      </div>
    )
  }

  // Strength
  const exerciseCount = session.exercises?.length || 0
  const totalSets = session.exercises?.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0) || 0

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-3" data-testid="workout-card">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(session.date)}</span>
        <span className="rounded-full px-3 py-1 text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300">
          {session.dayType || 'Strength'}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300" data-testid="workout-card-detail">
        {exerciseCount} exercises · {totalSets} total sets
      </p>
    </div>
  )
}

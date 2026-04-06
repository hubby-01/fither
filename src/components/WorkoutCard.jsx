import { formatDate } from '../utils/dateUtils'

export default function WorkoutCard({ session, type }) {
  if (!session) return null

  if (type === 'cardio') {
    const cardioType = session.type
      ? session.type.charAt(0).toUpperCase() + session.type.slice(1)
      : 'Cardio'
    return (
      <div className="rounded-lg border border-rose-100 dark:border-rose-900 bg-white dark:bg-gray-800 p-3" data-testid="workout-card">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-400 dark:text-gray-300">{formatDate(session.date)}</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
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
    <div className="rounded-lg border border-rose-100 dark:border-rose-900 bg-white dark:bg-gray-800 p-3" data-testid="workout-card">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs text-gray-400 dark:text-gray-300">{formatDate(session.date)}</span>
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300">
          {session.dayType || 'Strength'}
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300" data-testid="workout-card-detail">
        {exerciseCount} exercises · {totalSets} total sets
      </p>
    </div>
  )
}

import { useState } from 'react'
import { getSessions, getCardio, deleteSession, deleteCardio, getBodyweight } from '../utils/storage'
import { formatDate } from '../utils/dateUtils'
import { estimateCalories } from '../utils/progressCalc'
import { ChevronDownIcon, DeleteIcon } from '../components/icons'

const FILTER_OPTIONS = ['All', 'Strength', 'Cardio']

const DAY_TYPE_COLORS = {
  'Full Body A': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  'Full Body B': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  'Cardio + Core': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'Upper Body': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'Lower Body': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'Active Recovery': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  'Rest': 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
}

const DEFAULT_WEIGHT_KG = 68.9

export default function History() {
  const [sessions, setSessions] = useState(getSessions())
  const [cardio, setCardio] = useState(getCardio())
  const [filter, setFilter] = useState('All')
  const [expandedId, setExpandedId] = useState(null)

  // Get bodyweight for calorie estimate in expanded cardio view
  const bwEntries = getBodyweight()
  const bodyweightKg = bwEntries.length
    ? [...bwEntries].sort((a, b) => b.date.localeCompare(a.date))[0].weightKg
    : DEFAULT_WEIGHT_KG

  // Merge and sort all activities newest first
  const all = [
    ...sessions.map(s => ({ ...s, _kind: 'strength' })),
    ...cardio.map(c => ({ ...c, _kind: 'cardio' })),
  ].sort((a, b) => b.date.localeCompare(a.date))

  // Apply filter
  const filtered = all.filter(item => {
    if (filter === 'All') return true
    if (filter === 'Strength') return item._kind === 'strength'
    if (filter === 'Cardio') return item._kind === 'cardio'
    return true
  })

  function toggleExpand(id) {
    setExpandedId(prev => prev === id ? null : id)
  }

  function handleDelete(item) {
    if (!window.confirm('Delete this entry?')) return
    if (item._kind === 'strength') {
      deleteSession(item.id)
      setSessions(getSessions())
    } else {
      deleteCardio(item.id)
      setCardio(getCardio())
    }
    setExpandedId(null)
  }

  function getDayTypeLabel(item) {
    if (item._kind === 'strength') return item.dayType || 'Strength'
    // For cardio, capitalize type
    return item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'Cardio'
  }

  function getDayTypeBadgeClass(item) {
    if (item._kind === 'strength' && item.dayType && DAY_TYPE_COLORS[item.dayType]) {
      return DAY_TYPE_COLORS[item.dayType]
    }
    if (item._kind === 'cardio') {
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    }
    return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
  }

  if (all.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">History</h1>
        <div className="text-center py-12" data-testid="empty-state">
          <p className="text-gray-400 dark:text-gray-500 text-lg">No workouts logged yet.</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Start by logging today's session.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">History</h1>

      {/* Filter bar */}
      <div className="flex gap-2" data-testid="filter-bar">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => setFilter(opt)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === opt
                ? 'bg-rose-500 text-white'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
            data-testid={`filter-${opt.toLowerCase()}`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Session list */}
      <div className="space-y-2" data-testid="session-list">
        {filtered.map(item => {
          const isExpanded = expandedId === item.id
          return (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
              data-testid="session-item"
            >
              {/* Collapsed header — clickable */}
              <button
                type="button"
                onClick={() => toggleExpand(item.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-left"
                data-testid="session-header"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400" data-testid="date-badge">
                    {formatDate(item.date)}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getDayTypeBadgeClass(item)}`}
                    data-testid="day-type-badge"
                  >
                    {getDayTypeLabel(item)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {item._kind === 'strength'
                      ? `${(item.exercises || []).length} exercises`
                      : `${item.durationMinutes} min`
                    }
                  </span>
                  <ChevronDownIcon className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 mt-3 pt-3" data-testid="session-detail">
                  {item._kind === 'strength' ? (
                    <div className="space-y-3">
                      {(item.exercises || []).map((ex, i) => (
                        <div key={i}>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200" data-testid="detail-exercise-name">
                            {ex.name}
                          </p>
                          <ul className="ml-3 mt-1 space-y-0.5">
                            {(ex.sets || []).map((set, j) => (
                              <li key={j} className="text-xs text-gray-500 dark:text-gray-400" data-testid="detail-set">
                                Set {j + 1}: {set.reps} reps × {set.weightKg} kg
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {item.durationMinutes > 0 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500">Duration: {item.durationMinutes} min</p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic">{item.notes}</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2" data-testid="cardio-detail">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium capitalize">{item.type}</span> — {item.durationMinutes} min
                      </p>
                      {item.type === 'treadmill' && item.speedKmh > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Speed: {item.speedKmh} km/h | Incline: {item.inclinePercent || 0}%
                        </p>
                      )}
                      <p className="text-xs text-rose-500 font-medium" data-testid="cardio-calories">
                        ≈ {estimateCalories(item.type, item.durationMinutes, bodyweightKg)} kcal
                      </p>
                      {item.notes && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic">{item.notes}</p>
                      )}
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="mt-3 flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    data-testid="delete-btn"
                  >
                    <DeleteIcon className="w-4 h-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

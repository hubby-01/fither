const BADGE_COLORS = {
  'Full Body A':      'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
  'Full Body B':      'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300',
  'Cardio + Core':    'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  'Upper Body':       'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  'Lower Body':       'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  'Active Recovery':  'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
  'Rest':             'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
}

const CARD_BORDERS = {
  'Full Body A':      'border-rose-200 dark:border-rose-800',
  'Full Body B':      'border-rose-200 dark:border-rose-800',
  'Cardio + Core':    'border-orange-200 dark:border-orange-800',
  'Upper Body':       'border-purple-200 dark:border-purple-800',
  'Lower Body':       'border-amber-200 dark:border-amber-800',
  'Active Recovery':  'border-teal-200 dark:border-teal-800',
  'Rest':             'border-gray-200 dark:border-gray-700',
}

export default function DayPlanCard({ plan }) {
  if (!plan) return null

  const badgeColor = BADGE_COLORS[plan.dayType] || BADGE_COLORS['Rest']
  const borderColor = CARD_BORDERS[plan.dayType] || CARD_BORDERS['Rest']

  // Rest day
  if (plan.type === 'rest') {
    return (
      <div className={`rounded-xl border ${borderColor} bg-white dark:bg-gray-800 p-4`} data-testid="day-plan-card">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`} data-testid="day-badge">
          {plan.dayType}
        </span>
        <p className="mt-3 text-gray-500 dark:text-gray-300">{plan.restNote}</p>
      </div>
    )
  }

  // Active Recovery
  if (plan.type === 'active-recovery') {
    return (
      <div className={`rounded-xl border ${borderColor} bg-white dark:bg-gray-800 p-4`} data-testid="day-plan-card">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`} data-testid="day-badge">
          {plan.dayType}
        </span>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 font-medium">Pick one:</p>
        <ul className="mt-2 space-y-1">
          {plan.recoveryOptions?.map((opt, i) => (
            <li key={i} className="text-sm text-gray-600 dark:text-gray-300">
              {opt.label} — {opt.durationMinutes} min
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // Strength / Cardio days
  return (
    <div className={`rounded-xl border ${borderColor} bg-white dark:bg-gray-800 p-4`} data-testid="day-plan-card">
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`} data-testid="day-badge">
        {plan.dayType}
      </span>
      <ul className="mt-3 space-y-1" data-testid="exercise-list">
        {plan.exercises.map((ex, i) => (
          <li key={i} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
            <span>{ex.name}</span>
            <span className="text-gray-400 dark:text-gray-300">
              {ex.sets} x {ex.reps}{ex.unit ? ` ${ex.unit}` : ''}
            </span>
          </li>
        ))}
      </ul>
      {plan.cardio && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-300">
          {plan.cardio.label}: {plan.cardio.durationMinutes} min
          {plan.cardio.speedKmh ? ` @ ${plan.cardio.speedKmh} km/h` : ''}
        </div>
      )}
    </div>
  )
}

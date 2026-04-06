import { estimateCalories } from '../utils/progressCalc'

const CARDIO_TYPES = ['treadmill', 'zumba', 'yoga', 'other']
const DEFAULT_WEIGHT_KG = 68.9

export default function CardioLogger({ value, onChange, bodyweightKg }) {
  const weight = bodyweightKg || DEFAULT_WEIGHT_KG
  const calories = value.durationMinutes > 0
    ? estimateCalories(value.type, value.durationMinutes, weight)
    : 0

  function update(patch) {
    onChange({ ...value, ...patch })
  }

  return (
    <div className="space-y-4" data-testid="cardio-logger">
      {/* Type selector */}
      <div className="flex gap-2" data-testid="type-selector">
        {CARDIO_TYPES.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => update({ type: t })}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              value.type === t
                ? 'bg-rose-500 text-white'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
            }`}
            data-testid={`type-btn-${t}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Duration — always shown */}
      <div>
        <label className="text-sm text-gray-500 dark:text-gray-300">Duration (min)</label>
        <input
          type="number"
          inputMode="numeric"
          value={value.durationMinutes || ''}
          onChange={e => update({ durationMinutes: parseInt(e.target.value) || 0 })}
          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 text-sm"
          data-testid="duration-input"
        />
      </div>

      {/* Treadmill-specific fields */}
      {value.type === 'treadmill' && (
        <>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-300">Speed (km/h)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={value.speedKmh || ''}
              onChange={e => update({ speedKmh: parseFloat(e.target.value) || 0 })}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 text-sm"
              data-testid="speed-input"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-300">Incline (%)</label>
            <input
              type="number"
              inputMode="numeric"
              value={value.inclinePercent || ''}
              onChange={e => update({ inclinePercent: parseInt(e.target.value) || 0 })}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 text-sm"
              data-testid="incline-input"
            />
          </div>
        </>
      )}

      {/* Other — activity name */}
      {value.type === 'other' && (
        <div>
          <label className="text-sm text-gray-500 dark:text-gray-300">Activity name</label>
          <input
            type="text"
            value={value.activityName || ''}
            onChange={e => update({ activityName: e.target.value })}
            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 text-sm"
            data-testid="activity-name-input"
          />
        </div>
      )}

      {/* Calorie estimate */}
      {calories > 0 && (
        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-lg p-3 text-center" data-testid="calorie-estimate">
          <span className="text-lg font-bold text-rose-500">≈ {calories} kcal</span>
          <p className="text-xs text-gray-400 dark:text-gray-300 mt-1">Estimate only</p>
        </div>
      )}
    </div>
  )
}

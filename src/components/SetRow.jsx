import { CheckIcon, RemoveIcon } from './icons'

export default function SetRow({ setIndex, reps, weightKg, done, onChange, onRemove, canRemove = true }) {
  return (
    <div className={`flex items-center gap-2 py-1 ${done ? 'opacity-60' : ''}`} data-testid="set-row">
      <span className="text-xs text-gray-400 dark:text-gray-500 w-6">{setIndex + 1}</span>
      <input
        type="number"
        inputMode="numeric"
        placeholder="Reps"
        value={reps || ''}
        onChange={e => onChange({ reps: parseInt(e.target.value) || 0, weightKg, done })}
        className="w-16 px-2 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-sm text-center focus:outline-none focus:ring-2 focus:ring-rose-500"
        data-testid="reps-input"
      />
      <span className="text-xs text-gray-400 dark:text-gray-500">x</span>
      <input
        type="number"
        inputMode="decimal"
        step="0.5"
        placeholder="kg"
        value={weightKg || ''}
        onChange={e => onChange({ reps, weightKg: parseFloat(e.target.value) || 0, done })}
        className="w-20 px-2 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-sm text-center focus:outline-none focus:ring-2 focus:ring-rose-500"
        data-testid="weight-input"
      />
      <span className="text-xs text-gray-400 dark:text-gray-500">kg</span>
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={done}
          onChange={e => onChange({ reps, weightKg, done: e.target.checked })}
          className="sr-only"
          data-testid="done-checkbox"
        />
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          done ? 'bg-rose-500 border-rose-500 text-white' : 'border-gray-300 dark:border-gray-600'
        }`}>
          {done && <CheckIcon className="w-3 h-3" />}
        </div>
      </label>
      {canRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="p-2 rounded-lg text-gray-300 hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
          data-testid="remove-set-btn"
          aria-label="Remove set"
        >
          <RemoveIcon className="w-4 h-4" />
        </button>
      ) : (
        <div className="w-8 ml-1" />
      )}
    </div>
  )
}

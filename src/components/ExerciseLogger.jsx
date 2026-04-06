import SetRow from './SetRow'
import { WEIGHT_GUIDE } from '../data/weightGuide'

export default function ExerciseLogger({ name, targetReps, sets, onChange, overloadSuggestion }) {
  const guide = WEIGHT_GUIDE[name]

  function handleSetChange(index, updated) {
    const next = [...sets]
    next[index] = updated
    onChange(next)
  }

  function handleRemoveSet(index) {
    if (sets.length <= 1) return
    onChange(sets.filter((_, i) => i !== index))
  }

  function handleAddSet() {
    const last = sets[sets.length - 1] || { reps: targetReps || 0, weightKg: 0, done: false }
    onChange([...sets, { reps: last.reps, weightKg: last.weightKg, done: false }])
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3" data-testid="exercise-logger">
      <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-1" data-testid="exercise-name">
        {name}
      </h3>

      {/* Overload hint */}
      {overloadSuggestion && overloadSuggestion.suggestion === 'increase' && (
        <p className="text-xs text-green-600 dark:text-green-400 mb-2" data-testid="overload-hint-increase">
          ↑ Try {overloadSuggestion.suggestedWeightKg} kg — you hit all reps last time!
        </p>
      )}
      {overloadSuggestion && overloadSuggestion.suggestion === 'maintain' && (
        <p className="text-xs text-gray-400 dark:text-gray-300 mb-2" data-testid="overload-hint-maintain">
          Keep at {overloadSuggestion.lastWeightKg} kg — work on completing all reps
        </p>
      )}

      {/* Weight guide if no history */}
      {!overloadSuggestion && guide && (
        <p className="text-xs text-rose-400 mb-2" data-testid="weight-guide-hint">
          Start range: {guide.startMin}–{guide.startMax} kg
        </p>
      )}

      {/* Sets */}
      <div className="space-y-1">
        {sets.map((set, i) => (
          <SetRow
            key={i}
            setIndex={i}
            reps={set.reps}
            weightKg={set.weightKg}
            done={set.done}
            onChange={updated => handleSetChange(i, updated)}
            onRemove={() => handleRemoveSet(i)}
            canRemove={sets.length > 1}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddSet}
        className="mt-2 text-xs text-rose-500 hover:text-rose-600 font-medium"
        data-testid="add-set-btn"
      >
        + Add Set
      </button>
    </div>
  )
}

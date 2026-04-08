import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, saveProfile, exportAllData, clearAllData } from '../utils/storage'
import { lockSession } from '../utils/auth'
import { ScaleIcon, SaveIcon, DeleteIcon, InfoIcon, LogoutIcon } from '../components/icons'

export default function Settings() {
  const navigate = useNavigate()

  // Goal weight state
  const profile = getProfile()
  const [goalWeight, setGoalWeight] = useState(profile?.goalWeightKg || '')
  const [goalSaved, setGoalSaved] = useState(false)

  // ─── Goal Weight ───────────────────────────────────────────
  function handleSaveGoal() {
    const val = parseFloat(goalWeight)
    if (!val || val <= 0) return
    saveProfile({ ...(getProfile() || {}), goalWeightKg: val })
    setGoalSaved(true)
    setTimeout(() => setGoalSaved(false), 2000)
  }

  // ─── Export ────────────────────────────────────────────────
  function handleExport() {
    const blob = new Blob([exportAllData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fither-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Clear All ─────────────────────────────────────────────
  function handleClearAll() {
    if (!window.confirm('This will delete all your workout data. Are you sure?')) return
    const typed = window.prompt('Type DELETE to confirm')
    if (typed !== 'DELETE') return
    clearAllData()
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {/* Goal Weight */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4" data-testid="goal-weight-section">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
          <ScaleIcon className="w-4 h-4" /> Goal Weight
        </h2>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={goalWeight}
            onChange={e => setGoalWeight(e.target.value)}
            placeholder="e.g. 60"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[48px]"
            data-testid="goal-weight-input"
          />
          <button
            type="button"
            onClick={handleSaveGoal}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 active:scale-95 transition-all duration-100 min-h-[48px]"
            data-testid="save-goal-btn"
          >
            Save
          </button>
        </div>
        {goalSaved && (
          <p className="text-xs text-green-500 mt-1" data-testid="goal-saved-msg">Goal saved</p>
        )}
      </section>

      {/* Export Data */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4" data-testid="export-section">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
          <SaveIcon className="w-4 h-4" /> Export Data
        </h2>
        <button
          type="button"
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all duration-100 min-h-[48px]"
          data-testid="export-btn"
        >
          Export my data
        </button>
      </section>

      {/* Clear All Data */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4" data-testid="clear-section">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Danger Zone</h2>
        <button
          type="button"
          onClick={handleClearAll}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 active:scale-95 transition-all duration-100 min-h-[48px]"
          data-testid="clear-all-btn"
        >
          <DeleteIcon className="w-4 h-4" /> Clear all data
        </button>
      </section>

      {/* Lock Session */}
      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4" data-testid="logout-section">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
          <LogoutIcon className="w-4 h-4" /> Session
        </h2>
        <button
          type="button"
          onClick={() => { lockSession(); navigate('/login', { replace: true }) }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 transition-all duration-100 min-h-[48px]"
          data-testid="logout-btn"
        >
          <LogoutIcon className="w-4 h-4" /> Lock app
        </button>
      </section>

      {/* App Info */}
      <section className="text-center text-xs text-gray-400 dark:text-gray-500 py-4 flex flex-col items-center gap-1" data-testid="app-info">
        <InfoIcon className="w-4 h-4" />
        <p>FitHer v1.0.0</p>
        <p>Build: April 2025</p>
      </section>
    </div>
  )
}

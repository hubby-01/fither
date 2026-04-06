import { useState } from 'react'
import { verifyPIN, setPIN } from '../utils/auth'
import { getProfile, saveProfile, exportAllData, clearAllData } from '../utils/storage'
import PinKeypad from '../components/PinKeypad'

export default function Settings() {
  // PIN change state
  const [pinStep, setPinStep] = useState(null) // null | 'current' | 'new' | 'confirm'
  const [pinError, setPinError] = useState('')
  const [pinSuccess, setPinSuccess] = useState('')
  const [newPin, setNewPin] = useState('')
  const [keypadError, setKeypadError] = useState(false)

  // Goal weight state
  const profile = getProfile()
  const [goalWeight, setGoalWeight] = useState(profile?.goalWeightKg || '')
  const [goalSaved, setGoalSaved] = useState(false)

  // ─── PIN Change Flow ───────────────────────────────────────
  function startPinChange() {
    setPinStep('current')
    setPinError('')
    setPinSuccess('')
    setKeypadError(false)
  }

  async function handleCurrentPin(pin) {
    const ok = await verifyPIN(pin)
    if (!ok) {
      setPinError('Incorrect PIN')
      setKeypadError(true)
      setTimeout(() => {
        setKeypadError(false)
        setPinStep('current')
      }, 600)
      return
    }
    setPinError('')
    setPinStep('new')
  }

  function handleNewPin(pin) {
    setNewPin(pin)
    setPinError('')
    setPinStep('confirm')
  }

  async function handleConfirmPin(pin) {
    if (pin !== newPin) {
      setPinError("PINs don't match")
      setKeypadError(true)
      setTimeout(() => {
        setKeypadError(false)
        setPinStep('new')
        setNewPin('')
      }, 600)
      return
    }
    await setPIN(pin)
    setPinStep(null)
    setPinError('')
    setPinSuccess('PIN updated')
    setNewPin('')
  }

  function handlePinComplete(pin) {
    if (pinStep === 'current') handleCurrentPin(pin)
    else if (pinStep === 'new') handleNewPin(pin)
    else if (pinStep === 'confirm') handleConfirmPin(pin)
  }

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
    if (!window.confirm('This will delete everything including your PIN. Are you sure?')) return
    const typed = window.prompt('Type DELETE to confirm')
    if (typed !== 'DELETE') return
    clearAllData()
    window.location.reload()
  }

  const pinStepLabels = {
    current: 'Enter current PIN',
    new: 'Enter new PIN',
    confirm: 'Confirm new PIN',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>

      {/* Change PIN */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-4" data-testid="change-pin-section">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-3">Change PIN</h2>

        {!pinStep && !pinSuccess && (
          <button
            type="button"
            onClick={startPinChange}
            className="px-4 py-2 rounded-lg bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors min-h-[44px]"
            data-testid="change-pin-btn"
          >
            Change PIN
          </button>
        )}

        {pinStep && (
          <div data-testid="pin-change-flow">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 text-center" data-testid="pin-step-label">
              {pinStepLabels[pinStep]}
            </p>
            <PinKeypad onComplete={handlePinComplete} error={keypadError} />
          </div>
        )}

        {pinError && (
          <p className="text-sm text-red-500 mt-2 text-center" data-testid="pin-error">{pinError}</p>
        )}

        {pinSuccess && (
          <p className="text-sm text-green-500 mt-2" data-testid="pin-success">{pinSuccess}</p>
        )}
      </section>

      {/* Goal Weight */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-4" data-testid="goal-weight-section">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-3">Goal Weight</h2>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={goalWeight}
            onChange={e => setGoalWeight(e.target.value)}
            placeholder="e.g. 60"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 text-sm"
            data-testid="goal-weight-input"
          />
          <button
            type="button"
            onClick={handleSaveGoal}
            className="px-4 py-2 rounded-lg bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors min-h-[44px]"
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
      <section className="bg-white dark:bg-gray-800 rounded-xl p-4" data-testid="export-section">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-3">Export Data</h2>
        <button
          type="button"
          onClick={handleExport}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors min-h-[44px]"
          data-testid="export-btn"
        >
          Export my data
        </button>
      </section>

      {/* Clear All Data */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-4" data-testid="clear-section">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-300 mb-3">Danger Zone</h2>
        <button
          type="button"
          onClick={handleClearAll}
          className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors min-h-[44px]"
          data-testid="clear-all-btn"
        >
          Clear all data
        </button>
      </section>

      {/* App Info */}
      <section className="text-center text-xs text-gray-400 dark:text-gray-300 py-4" data-testid="app-info">
        <p>FitHer v1.0.0</p>
        <p>Build: April 2025</p>
      </section>
    </div>
  )
}

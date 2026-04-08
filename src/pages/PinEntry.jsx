import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PinKeypad from '../components/PinKeypad'
import { verifyPIN, unlockSession } from '../utils/auth'
import { LockIcon } from '../components/icons'

export default function PinEntry() {
  const navigate = useNavigate()
  const [error, setError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [lockoutSeconds, setLockoutSeconds] = useState(0)

  const isLockedOut = lockoutSeconds > 0

  useEffect(() => {
    if (lockoutSeconds <= 0) return
    const interval = setInterval(() => {
      setLockoutSeconds(prev => {
        if (prev <= 1) {
          setAttempts(0)
          setErrorMsg('')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [lockoutSeconds])

  async function handleComplete(pin) {
    if (isLockedOut) return
    const valid = await verifyPIN(pin)
    if (valid) {
      unlockSession()
      navigate('/', { replace: true })
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      setError(true)
      setTimeout(() => setError(false), 500)
      if (newAttempts >= 5) {
        setLockoutSeconds(30)
        setErrorMsg('Too many attempts. Try again in 30s')
      } else {
        setErrorMsg('You are not for whom this app was made')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-500 to-rose-600 flex flex-col items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <LockIcon className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
          Enter your PIN
        </h1>
        {errorMsg && (
          <p className="text-red-500 text-sm text-center mb-4" data-testid="error-message">
            {errorMsg}
          </p>
        )}
        {isLockedOut ? (
          <div className="text-center" data-testid="lockout-display">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Too many attempts</p>
            <p className="text-rose-600 dark:text-rose-400 text-3xl font-bold" data-testid="lockout-timer">
              {lockoutSeconds}s
            </p>
          </div>
        ) : (
          <PinKeypad onComplete={handleComplete} error={error} />
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PinKeypad from '../components/PinKeypad'
import { setPIN, unlockSession } from '../utils/auth'

export default function PinSetup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [firstPin, setFirstPin] = useState('')
  const [error, setError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleStep1(pin) {
    setFirstPin(pin)
    setError(false)
    setErrorMsg('')
    setStep(2)
  }

  async function handleStep2(pin) {
    if (pin === firstPin) {
      await setPIN(pin)
      unlockSession()
      navigate('/', { replace: true })
    } else {
      setError(true)
      setErrorMsg("PINs don't match")
      setStep(1)
      setFirstPin('')
    }
  }

  return (
    <div className="min-h-screen bg-rose-500 flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-rose-700 text-center mb-2">
          {step === 1 ? 'Create your PIN' : 'Confirm your PIN'}
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Step {step} of 2
        </p>
        {errorMsg && (
          <p className="text-red-500 text-sm text-center mb-4" data-testid="error-message">
            {errorMsg}
          </p>
        )}
        <PinKeypad
          onComplete={step === 1 ? handleStep1 : handleStep2}
          error={error}
        />
      </div>
    </div>
  )
}

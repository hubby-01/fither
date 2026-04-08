import { useState, useEffect } from 'react'
import { BackspaceIcon } from './icons'

const SHAKE_CSS = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}
`

export default function PinKeypad({ onComplete, maxLength = 4, minLength = 4, error = false }) {
  const [digits, setDigits] = useState('')
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    if (error) {
      setShaking(true)
      setDigits('')
      const timer = setTimeout(() => setShaking(false), 500)
      return () => clearTimeout(timer)
    }
  }, [error])

  function handleDigit(d) {
    const next = digits + d
    setDigits(next)
    if (next.length >= maxLength) {
      onComplete(next)
      setDigits('')
    }
  }

  function handleBackspace() {
    setDigits(prev => prev.slice(0, -1))
  }

  const dots = Array.from({ length: maxLength }, (_, i) => (
    <div
      key={i}
      className={`w-4 h-4 rounded-full mx-1.5 transition-colors ${
        i < digits.length ? 'bg-rose-500' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    />
  ))

  const buttons = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
    ['', 0, 'back'],
  ]

  return (
    <div className="flex flex-col items-center">
      <style>{SHAKE_CSS}</style>
      <div
        className="flex justify-center mb-8"
        style={shaking ? { animation: 'shake 0.4s ease-in-out' } : {}}
        data-testid="pin-dots"
      >
        {dots}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {buttons.flat().map((btn, i) => {
          if (btn === '') return <div key={i} />
          if (btn === 'back') {
            return (
              <button
                key={i}
                type="button"
                onClick={handleBackspace}
                className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white flex items-center justify-center active:scale-95 active:bg-gray-100 dark:active:bg-gray-700 transition-all duration-100 shadow-sm"
                aria-label="Backspace"
              >
                <BackspaceIcon className="w-6 h-6" />
              </button>
            )
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleDigit(String(btn))}
              className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-2xl font-semibold text-gray-900 dark:text-white flex items-center justify-center active:scale-95 active:bg-gray-100 dark:active:bg-gray-700 transition-all duration-100 shadow-sm"
            >
              {btn}
            </button>
          )
        })}
      </div>
    </div>
  )
}

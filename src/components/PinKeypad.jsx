import { useState, useEffect } from 'react'

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
      className={`w-4 h-4 rounded-full border-2 mx-1.5 transition-colors ${
        i < digits.length ? 'bg-rose-500 border-rose-500' : 'border-rose-300 bg-transparent'
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
                className="w-16 h-16 rounded-full bg-rose-50 text-rose-700 text-xl font-semibold flex items-center justify-center hover:bg-rose-100 active:bg-rose-200 transition-colors"
                aria-label="Backspace"
              >
                ←
              </button>
            )
          }
          return (
            <button
              key={i}
              type="button"
              onClick={() => handleDigit(String(btn))}
              className="w-16 h-16 rounded-full bg-rose-50 text-rose-700 text-xl font-semibold flex items-center justify-center hover:bg-rose-100 active:bg-rose-200 transition-colors"
            >
              {btn}
            </button>
          )
        })}
      </div>
    </div>
  )
}

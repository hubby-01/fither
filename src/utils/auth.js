const SALT = 'fither_salt_2025'

export async function hashPIN(pin) {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + SALT)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function setPIN(pin) {
  const hash = await hashPIN(pin)
  localStorage.setItem('fither_pin', hash)
}

export async function verifyPIN(pin) {
  const stored = localStorage.getItem('fither_pin')
  if (!stored) return false
  const hash = await hashPIN(pin)
  return hash === stored
}

export function isPINSet() {
  return !!localStorage.getItem('fither_pin')
}

export function isSessionUnlocked() {
  return sessionStorage.getItem('fither_unlocked') === 'true'
}

export function unlockSession() {
  sessionStorage.setItem('fither_unlocked', 'true')
}

export function lockSession() {
  sessionStorage.removeItem('fither_unlocked')
}

const SALT = 'fither_salt_2025'

export async function hashPIN(pin) {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + SALT)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPIN(pin) {
  // Read at call time so tests can set the env var after import
  const expectedHash = import.meta.env.VITE_PIN_HASH
  if (!expectedHash) return false
  const hash = await hashPIN(pin)
  return hash === expectedHash
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

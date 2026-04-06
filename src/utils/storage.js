const KEYS = {
  sessions:     'fither_sessions',
  cardio:       'fither_cardio',
  bodyweight:   'fither_bodyweight',
  measurements: 'fither_measurements',
  profile:      'fither_profile',
}

export const getSessions     = () => JSON.parse(localStorage.getItem(KEYS.sessions)     || '[]')
export const getCardio       = () => JSON.parse(localStorage.getItem(KEYS.cardio)       || '[]')
export const getBodyweight   = () => JSON.parse(localStorage.getItem(KEYS.bodyweight)   || '[]')
export const getMeasurements = () => JSON.parse(localStorage.getItem(KEYS.measurements) || '[]')
export const getProfile      = () => JSON.parse(localStorage.getItem(KEYS.profile)      || 'null')

export function saveSession(session) {
  const all = getSessions()
  const idx = all.findIndex(s => s.id === session.id)
  if (idx >= 0) all[idx] = session; else all.push(session)
  localStorage.setItem(KEYS.sessions, JSON.stringify(all))
}

export function saveCardio(entry) {
  const all = getCardio()
  const idx = all.findIndex(s => s.id === entry.id)
  if (idx >= 0) all[idx] = entry; else all.push(entry)
  localStorage.setItem(KEYS.cardio, JSON.stringify(all))
}

export function deleteSession(id) {
  localStorage.setItem(KEYS.sessions, JSON.stringify(getSessions().filter(s => s.id !== id)))
}

export function deleteCardio(id) {
  localStorage.setItem(KEYS.cardio, JSON.stringify(getCardio().filter(s => s.id !== id)))
}

export function saveBodyweight(entry) {
  const all = getBodyweight()
  const idx = all.findIndex(e => e.date === entry.date)
  if (idx >= 0) all[idx] = entry; else all.push(entry)
  localStorage.setItem(KEYS.bodyweight, JSON.stringify(all))
}

export function saveProfile(profile) {
  localStorage.setItem(KEYS.profile, JSON.stringify(profile))
}

export function exportAllData() {
  return JSON.stringify({
    sessions:     getSessions(),
    cardio:       getCardio(),
    bodyweight:   getBodyweight(),
    measurements: getMeasurements(),
    profile:      getProfile(),
  }, null, 2)
}

export function clearAllData() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k))
  localStorage.removeItem('fither_pin')
}

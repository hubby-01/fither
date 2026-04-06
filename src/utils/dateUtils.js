export function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function getDayIndex() {
  return new Date().getDay()
}

export function getHourGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function daysAgo(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((now - d) / 86400000)
}

export function weeksActive(startDateStr) {
  if (!startDateStr) return 0
  const start = new Date(startDateStr + 'T00:00:00')
  const now = new Date()
  return Math.max(1, Math.ceil((now - start) / (7 * 86400000)))
}

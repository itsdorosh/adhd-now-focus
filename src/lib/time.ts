const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/

/** Parses "HH:MM" or "HH:MM:SS" into minutes since midnight (0-1439.99). Returns null if invalid. */
export function parseTimeToMinutes(value: string): number | null {
  const match = TIME_RE.exec(value.trim())
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = match[3] ? Number(match[3]) : 0
  return hours * 60 + minutes + seconds / 60
}

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60 + date.getMilliseconds() / 60000
}

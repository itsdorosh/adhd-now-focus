import { useCallback, useState } from 'react'
import { parseScheduleText, ScheduleParseError } from '../lib/parsers'
import type { Slot } from '../lib/types'

const STORAGE_KEY = 'adhd-now-focus:schedule'

interface StoredSchedule {
  filename: string
  text: string
}

interface ScheduleState {
  slots: Slot[] | null
  filename: string | null
  error: string | null
}

function loadInitialState(): ScheduleState {
  const empty: ScheduleState = { slots: null, filename: null, error: null }
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return empty
  try {
    const { filename, text } = JSON.parse(stored) as StoredSchedule
    const slots = parseScheduleText(text, filename)
    return { slots, filename, error: null }
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return empty
  }
}

export function useSchedule() {
  const [state, setState] = useState<ScheduleState>(loadInitialState)

  const load = useCallback(async (file: File) => {
    const text = await file.text()
    try {
      const slots = parseScheduleText(text, file.name)
      setState({ slots, filename: file.name, error: null })
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ filename: file.name, text } satisfies StoredSchedule))
    } catch (err) {
      const message = err instanceof ScheduleParseError ? err.message : 'Could not read that file.'
      setState((prev) => ({ ...prev, error: message }))
    }
  }, [])

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState({ slots: null, filename: null, error: null })
  }, [])

  return { ...state, load, clear }
}

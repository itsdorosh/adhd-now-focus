import Papa from 'papaparse'
import { load as loadYaml } from 'js-yaml'
import { parseTimeToMinutes } from './time'
import type { Slot, ScheduleFormat } from './types'

export class ScheduleParseError extends Error {}

function detectFormat(filename: string): ScheduleFormat {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'csv') return 'csv'
  if (ext === 'json') return 'json'
  if (ext === 'yaml' || ext === 'yml') return 'yaml'
  throw new ScheduleParseError(`Unrecognized file extension ".${ext ?? ''}". Use .csv, .json, .yaml, or .yml.`)
}

function rawToEntries(raw: unknown, format: ScheduleFormat): unknown[] {
  if (Array.isArray(raw)) return raw
  throw new ScheduleParseError(`Expected the ${format.toUpperCase()} file to contain a list of slots.`)
}

function parseCsv(text: string): unknown[] {
  const result = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true })
  if (result.errors.length > 0) {
    throw new ScheduleParseError(`CSV error: ${result.errors[0].message}`)
  }
  return result.data
}

function normalizeEntries(entries: unknown[]): Slot[] {
  if (entries.length === 0) {
    throw new ScheduleParseError('The schedule file has no slots in it.')
  }

  return entries.map((entry, index) => {
    if (typeof entry !== 'object' || entry === null) {
      throw new ScheduleParseError(`Slot #${index + 1} is not an object.`)
    }
    const { name, start, end, color } = entry as Record<string, unknown>

    if (typeof name !== 'string' || name.trim() === '') {
      throw new ScheduleParseError(`Slot #${index + 1} is missing a "name".`)
    }
    if (typeof start !== 'string' || parseTimeToMinutes(start) === null) {
      throw new ScheduleParseError(`Slot "${name}" has an invalid "start" time. Use HH:MM, e.g. "13:00".`)
    }
    if (typeof end !== 'string' || parseTimeToMinutes(end) === null) {
      throw new ScheduleParseError(`Slot "${name}" has an invalid "end" time. Use HH:MM, e.g. "17:00".`)
    }
    if (color !== undefined && typeof color !== 'string') {
      throw new ScheduleParseError(`Slot "${name}" has an invalid "color". Use a CSS color string, e.g. "#5E81AC".`)
    }

    const slot: Slot = { name: name.trim(), start: start.trim(), end: end.trim() }
    if (color) slot.color = color.trim()
    return slot
  })
}

export function parseScheduleText(text: string, filename: string): Slot[] {
  const format = detectFormat(filename)

  let raw: unknown
  try {
    if (format === 'csv') {
      raw = parseCsv(text)
    } else if (format === 'json') {
      raw = JSON.parse(text)
    } else {
      raw = loadYaml(text)
    }
  } catch (err) {
    if (err instanceof ScheduleParseError) throw err
    const message = err instanceof Error ? err.message : String(err)
    throw new ScheduleParseError(`Could not parse ${format.toUpperCase()}: ${message}`)
  }

  const entries = rawToEntries(raw, format)
  return normalizeEntries(entries)
}

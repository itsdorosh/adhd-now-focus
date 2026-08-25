import { parseTimeToMinutes, minutesSinceMidnight } from './time'
import type { Slot, CurrentSlotInfo } from './types'

const DAY = 1440

function slotProgress(slot: Slot, nowMin: number): { active: boolean; percent: number } {
  const startMin = parseTimeToMinutes(slot.start)
  const endMin = parseTimeToMinutes(slot.end)
  if (startMin === null || endMin === null) return { active: false, percent: 0 }

  if (endMin > startMin) {
    if (nowMin < startMin || nowMin >= endMin) return { active: false, percent: 0 }
    return { active: true, percent: ((nowMin - startMin) / (endMin - startMin)) * 100 }
  }

  // Overnight slot, e.g. 23:00 -> 07:00.
  const duration = DAY - startMin + endMin
  if (nowMin >= startMin) {
    return { active: true, percent: (((nowMin - startMin) / duration) * 100) }
  }
  if (nowMin < endMin) {
    return { active: true, percent: (((DAY - startMin + nowMin) / duration) * 100) }
  }
  return { active: false, percent: 0 }
}

function minutesUntilStart(slot: Slot, nowMin: number): number {
  const startMin = parseTimeToMinutes(slot.start)
  if (startMin === null) return Infinity
  return (startMin - nowMin + DAY) % DAY
}

/** Finds the slot that is active right now, its fill percent, and the next upcoming slot. */
export function getCurrentSlotInfo(slots: Slot[], now: Date): CurrentSlotInfo {
  const nowMin = minutesSinceMidnight(now)

  let active: { slot: Slot; percent: number } | null = null
  for (const slot of slots) {
    const progress = slotProgress(slot, nowMin)
    if (progress.active) {
      active = { slot, percent: progress.percent }
      break
    }
  }

  let nextSlot: Slot | null = null
  let nextDistance = Infinity
  for (const slot of slots) {
    const distance = minutesUntilStart(slot, nowMin)
    if (distance > 0 && distance < nextDistance) {
      nextDistance = distance
      nextSlot = slot
    }
  }

  return {
    slot: active?.slot ?? null,
    percent: active ? Math.min(100, Math.max(0, active.percent)) : 0,
    nextSlot,
  }
}

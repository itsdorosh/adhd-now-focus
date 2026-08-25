export interface Slot {
  name: string
  start: string
  end: string
  color?: string
}

export type ScheduleFormat = 'csv' | 'json' | 'yaml'

export interface CurrentSlotInfo {
  slot: Slot | null
  percent: number
  nextSlot: Slot | null
}

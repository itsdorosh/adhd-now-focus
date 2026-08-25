import { useMemo, type CSSProperties } from 'react'
import { getCurrentSlotInfo } from '../lib/schedule'
import { colorForSlot, contrastTextColor } from '../lib/color'
import type { Slot } from '../lib/types'

interface StageProps {
  slots: Slot[]
  now: Date
}

export function Stage({ slots, now }: StageProps) {
  const info = useMemo(() => getCurrentSlotInfo(slots, now), [slots, now])
  const { slot: active, percent, nextSlot } = info

  const fillColor = active ? colorForSlot(active.name, active.color) : 'transparent'
  const fillTextColor = active ? contrastTextColor(fillColor) : '#ffffff'

  const caption = active ? (
    <>
      <h1 className="stage__title">{active.name}</h1>
      <p className="stage__subtitle">
        {active.start} &ndash; {active.end}
      </p>
    </>
  ) : (
    <>
      <h1 className="stage__title">No activity right now</h1>
      {nextSlot && (
        <p className="stage__subtitle">
          Next: {nextSlot.name} at {nextSlot.start}
        </p>
      )}
    </>
  )

  const fillStyle: CSSProperties = {
    width: `${percent}%`,
    backgroundColor: fillColor,
  }

  const clipStyle: CSSProperties = {
    clipPath: `inset(0 ${100 - percent}% 0 0)`,
    color: fillTextColor,
  }

  return (
    <div className="stage">
      <div className="stage__fill" style={fillStyle} />
      <div className="stage__caption">
        <div className="stage__caption-layer">{caption}</div>
        <div className="stage__caption-layer stage__caption-layer--fill" style={clipStyle}>
          {caption}
        </div>
      </div>
    </div>
  )
}

/** Deterministic, pleasant hue derived from a string (used when a slot has no explicit color). */
function hashStringToHue(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 360
}

export function colorForSlot(name: string, explicitColor?: string): string {
  if (explicitColor) return explicitColor
  const hue = hashStringToHue(name)
  return `hsl(${hue}, 80%, 52%)`
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((channel) => {
    const c = channel / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

const rgbCache = new Map<string, [number, number, number]>()

function toRgb(color: string): [number, number, number] {
  const cached = rgbCache.get(color)
  if (cached) return cached
  const probe = document.createElement('div')
  probe.style.color = color
  document.body.appendChild(probe)
  const computed = getComputedStyle(probe).color
  document.body.removeChild(probe)
  const match = /(\d+),\s*(\d+),\s*(\d+)/.exec(computed)
  const rgb: [number, number, number] = match ? [Number(match[1]), Number(match[2]), Number(match[3])] : [0, 0, 0]
  rgbCache.set(color, rgb)
  return rgb
}

/** Returns '#000000' or '#ffffff', whichever contrasts better against the given background color. */
export function contrastTextColor(backgroundColor: string): string {
  const [r, g, b] = toRgb(backgroundColor)
  const luminance = relativeLuminance(r, g, b)
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

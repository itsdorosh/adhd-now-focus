import { useRef } from 'react'

interface CornerMenuProps {
  filename: string | null
  isFullscreen: boolean
  onFile: (file: File) => void
  onClear: () => void
  onToggleFullscreen: () => void
}

export function CornerMenu({ filename, isFullscreen, onFile, onClear, onToggleFullscreen }: CornerMenuProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="corner-menu">
      {filename && <span className="corner-menu__filename">{filename}</span>}
      <button type="button" onClick={onToggleFullscreen}>
        {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      </button>
      <button type="button" onClick={() => inputRef.current?.click()}>
        Change file
      </button>
      <button type="button" onClick={onClear}>
        Clear
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.json,.yaml,.yml"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFile(file)
          event.target.value = ''
        }}
        hidden
      />
    </div>
  )
}

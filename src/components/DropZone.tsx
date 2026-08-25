import { useRef, type DragEvent } from 'react'

interface DropZoneProps {
  error: string | null
  isDraggingOver: boolean
  onFile: (file: File) => void
  onDragStateChange: (isDraggingOver: boolean) => void
}

export function DropZone({ error, isDraggingOver, onFile, onDragStateChange }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    onDragStateChange(false)
    const file = event.dataTransfer.files[0]
    if (file) onFile(file)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    onDragStateChange(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    onDragStateChange(false)
  }

  return (
    <div
      className={`drop-zone${isDraggingOver ? ' drop-zone--active' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="drop-zone__panel">
        <h1>Now &amp; Next</h1>
        <p>Drop a schedule file to get started, or choose one from your computer.</p>
        <button type="button" onClick={() => inputRef.current?.click()}>
          Choose file
        </button>
        <p className="drop-zone__hint">Accepts .csv, .json, .yaml, or .yml</p>
        {error && <p className="drop-zone__error">{error}</p>}
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
    </div>
  )
}

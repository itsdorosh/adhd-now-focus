import { useState, type DragEvent } from 'react'
import { useSchedule } from './hooks/useSchedule'
import { useNow } from './hooks/useNow'
import { useFullscreen } from './hooks/useFullscreen'
import { useWakeLock } from './hooks/useWakeLock'
import { DropZone } from './components/DropZone'
import { Stage } from './components/Stage'
import { CornerMenu } from './components/CornerMenu'
import './App.css'

function App() {
  const { slots, filename, error, load, clear } = useSchedule()
  const now = useNow()
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()
  useWakeLock(isFullscreen)

  if (!slots) {
    return <DropZone error={error} isDraggingOver={isDraggingOver} onFile={load} onDragStateChange={setIsDraggingOver} />
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingOver(false)
    const file = event.dataTransfer.files[0]
    if (file) void load(file)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingOver(true)
  }

  return (
    <div
      className="app"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDraggingOver(false)}
    >
      <Stage slots={slots} now={now} />
      <CornerMenu
        filename={filename}
        isFullscreen={isFullscreen}
        onFile={load}
        onClear={clear}
        onToggleFullscreen={toggleFullscreen}
      />
      {isDraggingOver && (
        <div className="app__drop-hint">
          <p>Drop to load a new schedule</p>
        </div>
      )}
    </div>
  )
}

export default App

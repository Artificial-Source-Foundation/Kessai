import type { MouseEvent } from 'react'
import { Minus, Square, X } from 'lucide-react'
import { getCurrentWindow } from '@tauri-apps/api/window'

function runWindowAction(
  action: (appWindow: ReturnType<typeof getCurrentWindow>) => Promise<void>
) {
  action(getCurrentWindow()).catch(() => {
    // Window controls are only available inside Tauri.
  })
}

function handleTitlebarMouseDown(event: MouseEvent<HTMLDivElement>) {
  if (event.detail === 2) {
    runWindowAction((appWindow) => appWindow.toggleMaximize())
    return
  }

  runWindowAction((appWindow) => appWindow.startDragging())
}

export function WindowTitlebar() {
  return (
    <header className="border-border/80 bg-background/95 relative z-50 flex h-9 shrink-0 items-center border-b">
      <div
        className="h-full min-w-0 flex-1"
        data-tauri-drag-region="true"
        aria-hidden="true"
        onMouseDown={handleTitlebarMouseDown}
      />

      <div className="flex h-full shrink-0 justify-end">
        <button
          type="button"
          aria-label="Minimize window"
          className="text-muted-foreground hover:bg-accent-muted hover:text-foreground flex h-full w-11 items-center justify-center transition-colors"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={() => runWindowAction((appWindow) => appWindow.minimize())}
        >
          <Minus size={14} strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Maximize window"
          className="text-muted-foreground hover:bg-accent-muted hover:text-foreground flex h-full w-11 items-center justify-center transition-colors"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={() => runWindowAction((appWindow) => appWindow.toggleMaximize())}
        >
          <Square size={12} strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="Close window"
          className="text-muted-foreground hover:bg-destructive hover:text-destructive-foreground flex h-full w-11 items-center justify-center transition-colors"
          onMouseDown={(event) => event.stopPropagation()}
          onClick={() => runWindowAction((appWindow) => appWindow.close())}
        >
          <X size={15} strokeWidth={2} />
        </button>
      </div>
    </header>
  )
}

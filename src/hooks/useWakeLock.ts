import { useEffect } from 'react'

// The Wake Lock is auto-released whenever the tab is hidden, so we re-request
// it on visibilitychange rather than assuming a single request lasts forever.
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return

    let sentinel: WakeLockSentinel | null = null
    let cancelled = false

    const acquire = async () => {
      try {
        sentinel = await navigator.wakeLock.request('screen')
      } catch {
        // permission denied, unsupported, or page hidden — nothing to do
      }
    }

    void acquire()

    const handleVisibility = () => {
      if (!cancelled && document.visibilityState === 'visible' && sentinel === null) {
        void acquire()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisibility)
      void sentinel?.release()
      sentinel = null
    }
  }, [active])
}

import { useEffect, useRef, useCallback } from 'react'

const TIMEOUT_MS = 24 * 60 * 60 * 1000  // 1 day
const WARNING_MS = 2 * 60 * 1000         // warn 2 minutes before logout

const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const

/**
 * Tracks user inactivity. After (TIMEOUT_MS - WARNING_MS) of idle time, calls onWarn().
 * After a further WARNING_MS of idle time, calls onTimeout().
 * Returns a reset() function to extend the session (e.g. when user clicks "Stay logged in").
 */
export function useSessionTimeout(
  isActive: boolean,
  onWarn: () => void,
  onTimeout: () => void,
): { reset: () => void } {
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Use refs for callbacks to avoid re-registering event listeners on every render
  const onWarnRef = useRef(onWarn)
  const onTimeoutRef = useRef(onTimeout)
  onWarnRef.current = onWarn
  onTimeoutRef.current = onTimeout

  const clearTimers = useCallback(() => {
    if (warnTimer.current) clearTimeout(warnTimer.current)
    if (logoutTimer.current) clearTimeout(logoutTimer.current)
  }, [])

  const startTimers = useCallback(() => {
    clearTimers()
    warnTimer.current = setTimeout(() => {
      onWarnRef.current()
      logoutTimer.current = setTimeout(() => {
        onTimeoutRef.current()
      }, WARNING_MS)
    }, TIMEOUT_MS - WARNING_MS)
  }, [clearTimers])

  const reset = useCallback(() => {
    startTimers()
  }, [startTimers])

  useEffect(() => {
    if (!isActive) {
      clearTimers()
      return
    }

    startTimers()

    function handleActivity() {
      startTimers()
    }

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      clearTimers()
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [isActive, startTimers, clearTimers])

  return { reset }
}

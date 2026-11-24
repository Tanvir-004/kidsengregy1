'use client'

import { useEffect } from 'react'

export function ScrollResetOnReload() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const navEntries = performance.getEntriesByType?.('navigation') as
      | PerformanceNavigationTiming[]
      | undefined
    const isReload = navEntries?.[0]?.type === 'reload'
    const currentHash = window.location.hash

    if (isReload || !currentHash || currentHash === '#home') {
      if (currentHash) {
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search
        )
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
      const rafId = window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
      })
      return () => window.cancelAnimationFrame(rafId)
    }
  }, [])

  return null
}

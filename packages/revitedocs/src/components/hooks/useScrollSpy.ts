import { useState, useEffect, useCallback } from 'react'

/**
 * Hook to track which section is currently visible in the viewport
 */
export function useScrollSpy(ids: string[]): string {
  const [activeId, setActiveId] = useState<string>(ids[0] || '')

  const handleScroll = useCallback(() => {
    if (ids.length === 0) return

    let currentId = ids[0]

    for (const id of ids) {
      const element = document.getElementById(id)
      if (element) {
        const rect = element.getBoundingClientRect()
        if (rect.top <= 150) {
          currentId = id
        } else {
          break
        }
      }
    }

    setActiveId(currentId)
  }, [ids])

  useEffect(() => {
    if (ids.length === 0) return

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [ids, handleScroll])

  return activeId
}

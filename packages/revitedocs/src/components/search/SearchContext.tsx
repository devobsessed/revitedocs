import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { SearchContextValue, SearchProviderProps } from './types.js'
import { loadPagefind } from './pagefind.js'
import { SearchModal } from './SearchModal.js'

const SearchContext = createContext<SearchContextValue | null>(null)

/**
 * Search provider that manages search modal state and keyboard shortcuts
 */
export function SearchProvider({ children, onNavigate }: SearchProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAvailable, setIsAvailable] = useState(false)

  // Try to load Pagefind on mount
  useEffect(() => {
    loadPagefind().then((pf) => {
      setIsAvailable(pf !== null)
    })
  }, [])

  // Register global keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setIsOpen((prev) => !prev)
      }

      // Also support Escape to close
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  const value: SearchContextValue = {
    open,
    close,
    toggle,
    isAvailable,
    isOpen,
  }

  return (
    <SearchContext.Provider value={value}>
      {children}
      <SearchModal open={isOpen} onOpenChange={setIsOpen} onNavigate={onNavigate} />
    </SearchContext.Provider>
  )
}

/**
 * Hook to access search functionality
 */
export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext)

  if (!context) {
    // Return a stub if used outside provider
    return {
      open: () => console.warn('[revitedocs] useSearch must be used within SearchProvider'),
      close: () => {},
      toggle: () => {},
      isAvailable: false,
      isOpen: false,
    }
  }

  return context
}

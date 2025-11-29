import { useState, useEffect, useCallback } from 'react'
import type { SearchState } from './types.js'
import { loadPagefind, searchWithPagefind } from './pagefind.js'

export interface UsePagefindReturn {
  /** Search for a query */
  search: (query: string) => Promise<void>
  /** Current search state */
  state: SearchState
  /** Whether Pagefind is available */
  isAvailable: boolean
  /** Clear search results */
  clear: () => void
}

/**
 * Hook for directly using Pagefind search
 * Use this if you want to build a custom search UI
 */
export function usePagefind(maxResults = 10): UsePagefindReturn {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
  })
  const [isAvailable, setIsAvailable] = useState(false)

  // Try to load Pagefind on mount
  useEffect(() => {
    loadPagefind().then((pf) => {
      setIsAvailable(pf !== null)
    })
  }, [])

  const search = useCallback(
    async (query: string) => {
      setState((prev) => ({
        ...prev,
        query,
        isLoading: true,
        error: null,
      }))

      if (!query.trim()) {
        setState((prev) => ({
          ...prev,
          results: [],
          isLoading: false,
        }))
        return
      }

      try {
        const results = await searchWithPagefind(query, maxResults)
        setState((prev) => ({
          ...prev,
          results,
          isLoading: false,
        }))
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Search failed',
        }))
      }
    },
    [maxResults]
  )

  const clear = useCallback(() => {
    setState({
      query: '',
      results: [],
      isLoading: false,
      error: null,
    })
  }, [])

  return {
    search,
    state,
    isAvailable,
    clear,
  }
}

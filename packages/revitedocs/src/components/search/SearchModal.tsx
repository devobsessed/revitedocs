import { useState, useEffect, useCallback } from 'react'
import { FileText, Clock, Loader2 } from 'lucide-react'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '../ui/command.js'
import { cn } from '../utils.js'
import type { SearchModalProps, SearchState } from './types.js'
import { searchDocs, initSearch, highlightMatches } from './pagefind.js'

const RECENT_SEARCHES_KEY = 'revitedocs-recent-searches'
const MAX_RECENT_SEARCHES = 5

/**
 * Search modal with command palette UI
 * Opens with Cmd/Ctrl+K, supports keyboard navigation
 * Uses shadcn/ui CommandDialog for polished appearance
 */
export function SearchModal({
  open,
  onOpenChange,
  placeholder = 'Search documentation...',
  maxResults = 10,
  onNavigate,
}: SearchModalProps) {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
  })
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [searchReady, setSearchReady] = useState(false)

  // Initialize search on mount
  useEffect(() => {
    initSearch().then((ready) => setSearchReady(ready))
  }, [])

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (stored) {
        setRecentSearches(JSON.parse(stored))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Reset state when closing
  useEffect(() => {
    if (!open) {
      setState({ query: '', results: [], isLoading: false, error: null })
    }
  }, [open])

  // Save recent search
  const saveRecentSearch = useCallback((query: string) => {
    if (!query.trim()) return

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== query)
      const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES)

      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
      } catch {
        // Ignore localStorage errors
      }

      return updated
    })
  }, [])

  // Debounced search
  useEffect(() => {
    if (!state.query.trim()) {
      setState((prev) => ({ ...prev, results: [], isLoading: false }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchDocs(state.query, maxResults)
        setState((prev) => ({ ...prev, results, isLoading: false }))
      } catch {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Search failed. Please try again.',
        }))
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [state.query, maxResults])

  // Handle navigation
  const handleNavigate = useCallback(
    (url: string) => {
      saveRecentSearch(state.query)
      onOpenChange(false)

      if (onNavigate) {
        onNavigate(url)
      } else {
        window.location.href = url
      }
    },
    [state.query, onNavigate, onOpenChange, saveRecentSearch]
  )

  // Handle recent search selection
  const handleRecentSelect = useCallback((query: string) => {
    setState((prev) => ({ ...prev, query }))
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder={placeholder}
        value={state.query}
        onValueChange={(value: string) => setState((prev) => ({ ...prev, query: value }))}
      />
      <CommandList className="max-h-[60vh]">
        {/* Loading state */}
        {state.isLoading && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Searching...</span>
          </div>
        )}

        {/* Initializing search index */}
        {!searchReady && state.query.trim() && !state.isLoading && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Initializing search...</span>
          </div>
        )}

        {/* Error state */}
        {state.error && (
          <div className="py-6 text-center text-sm text-destructive">{state.error}</div>
        )}

        {/* Empty state */}
        {!state.isLoading &&
          state.query.trim() &&
          state.results.length === 0 &&
          searchReady &&
          !state.error && <CommandEmpty>No results found for "{state.query}"</CommandEmpty>}

        {/* Recent searches (when no query) */}
        {!state.query.trim() && recentSearches.length > 0 && (
          <CommandGroup heading="Recent Searches">
            {recentSearches.map((query) => (
              <CommandItem
                key={query}
                value={query}
                onSelect={() => handleRecentSelect(query)}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{query}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Search results */}
        {state.results.length > 0 && (
          <>
            {recentSearches.length > 0 && !state.query.trim() && <CommandSeparator />}
            <CommandGroup heading="Results">
              {state.results.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.title}
                  onSelect={() => handleNavigate(result.url)}
                  className="flex items-start gap-3 py-3"
                >
                  <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{result.title}</div>
                    {result.section && (
                      <div className="text-xs text-muted-foreground mt-0.5">{result.section}</div>
                    )}
                    <div
                      className={cn(
                        'text-sm text-muted-foreground mt-1',
                        'line-clamp-2',
                        '[&_mark]:bg-yellow-200 dark:[&_mark]:bg-yellow-900/50',
                        '[&_mark]:text-foreground',
                        '[&_mark]:px-0.5 [&_mark]:rounded'
                      )}
                      dangerouslySetInnerHTML={{
                        __html:
                          result.excerpt ||
                          highlightMatches(result.content?.slice(0, 150) || '', state.query),
                      }}
                    />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>

      {/* Keyboard hints footer */}
      <div className="flex items-center justify-center gap-4 px-3 py-3 border-t text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd>
          navigate
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd>
          select
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">esc</kbd>
          close
        </span>
      </div>
    </CommandDialog>
  )
}

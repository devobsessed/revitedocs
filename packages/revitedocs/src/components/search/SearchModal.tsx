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
        className="border-none focus:ring-0"
      />
      <CommandList className="max-h-[60vh] overflow-hidden">
        {/* Loading state - refined */}
        {state.isLoading && (
          <div className="flex items-center justify-center gap-3 py-8 text-sm text-zinc-500 dark:text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Searching...</span>
          </div>
        )}

        {/* Initializing search index */}
        {!searchReady && state.query.trim() && !state.isLoading && (
          <div className="flex items-center justify-center gap-3 py-8 text-sm text-zinc-500 dark:text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Initializing search...</span>
          </div>
        )}

        {/* Error state */}
        {state.error && (
          <div className="py-8 text-center text-sm text-destructive">{state.error}</div>
        )}

        {/* Empty state - refined */}
        {!state.isLoading &&
          state.query.trim() &&
          state.results.length === 0 &&
          searchReady &&
          !state.error && (
            <CommandEmpty className="py-8 text-zinc-500 dark:text-zinc-400">
              No results found for "{state.query}"
            </CommandEmpty>
          )}

        {/* Recent searches (when no query) - refined */}
        {!state.query.trim() && recentSearches.length > 0 && (
          <CommandGroup 
            heading="Recent Searches"
            className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-400 dark:[&_[cmdk-group-heading]]:text-zinc-500"
          >
            {recentSearches.map((query, index) => (
              <CommandItem
                key={query}
                value={query}
                onSelect={() => handleRecentSelect(query)}
                className={cn(
                  'flex items-center gap-3 py-2.5 px-3 mx-1 rounded-lg',
                  'transition-all duration-150',
                  'data-[selected=true]:bg-zinc-100/80 dark:data-[selected=true]:bg-zinc-800/80',
                  'animate-[fade-in_0.2s_ease-out_forwards] opacity-0'
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <Clock className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                <span className="text-zinc-700 dark:text-zinc-300">{query}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Search results - refined */}
        {state.results.length > 0 && (
          <>
            {recentSearches.length > 0 && !state.query.trim() && (
              <CommandSeparator className="my-2 bg-zinc-200/50 dark:bg-zinc-800/50" />
            )}
            <CommandGroup 
              heading="Results"
              className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-zinc-400 dark:[&_[cmdk-group-heading]]:text-zinc-500"
            >
              {state.results.map((result, index) => (
                <CommandItem
                  key={result.id}
                  value={result.title}
                  onSelect={() => handleNavigate(result.url)}
                  className={cn(
                    'flex items-start gap-3 py-3 px-3 mx-1 rounded-lg',
                    'transition-all duration-150',
                    'data-[selected=true]:bg-zinc-100/80 dark:data-[selected=true]:bg-zinc-800/80',
                    'animate-[fade-in_0.2s_ease-out_forwards] opacity-0'
                  )}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg shrink-0 mt-0.5',
                    'bg-zinc-100 dark:bg-zinc-800',
                    'transition-colors duration-150',
                    'group-data-[selected=true]:bg-zinc-200 dark:group-data-[selected=true]:bg-zinc-700'
                  )}>
                    <FileText className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">{result.title}</div>
                    {result.section && (
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{result.section}</div>
                    )}
                    <div
                      className={cn(
                        'text-sm text-zinc-500 dark:text-zinc-400 mt-1.5',
                        'line-clamp-2 leading-relaxed',
                        '[&_mark]:bg-zinc-200 dark:[&_mark]:bg-zinc-700',
                        '[&_mark]:text-zinc-900 dark:[&_mark]:text-zinc-100',
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

      {/* Keyboard hints footer - refined */}
      <div className={cn(
        'flex items-center justify-center gap-6 px-4 py-3',
        'border-t border-zinc-200/50 dark:border-zinc-800/50',
        'bg-zinc-50/50 dark:bg-zinc-900/50',
        'text-xs text-zinc-400 dark:text-zinc-500'
      )}>
        <span className="flex items-center gap-1.5">
          <kbd className={cn(
            'px-1.5 py-0.5 text-[10px] font-mono rounded',
            'bg-zinc-200/70 dark:bg-zinc-800/70',
            'border border-zinc-300/30 dark:border-zinc-700/30'
          )}>↑↓</kbd>
          navigate
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className={cn(
            'px-1.5 py-0.5 text-[10px] font-mono rounded',
            'bg-zinc-200/70 dark:bg-zinc-800/70',
            'border border-zinc-300/30 dark:border-zinc-700/30'
          )}>↵</kbd>
          select
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className={cn(
            'px-1.5 py-0.5 text-[10px] font-mono rounded',
            'bg-zinc-200/70 dark:bg-zinc-800/70',
            'border border-zinc-300/30 dark:border-zinc-700/30'
          )}>esc</kbd>
          close
        </span>
      </div>
    </CommandDialog>
  )
}

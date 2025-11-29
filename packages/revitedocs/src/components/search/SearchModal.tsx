import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Search, FileText, Clock, X, Loader2 } from 'lucide-react'
import { cn } from '../utils.js'
import type { SearchModalProps, SearchResult, SearchState } from './types.js'
import { searchDocs, initSearch, highlightMatches } from './pagefind.js'

const RECENT_SEARCHES_KEY = 'revitedocs-recent-searches'
const MAX_RECENT_SEARCHES = 5

/**
 * Search modal with command palette UI
 * Opens with Cmd/Ctrl+K, supports keyboard navigation
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
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [searchReady, setSearchReady] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Initialize search on mount
  useEffect(() => {
    initSearch().then(ready => setSearchReady(ready))
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

  // Handle dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open) {
      dialog.showModal()
      inputRef.current?.focus()
    } else {
      dialog.close()
      // Reset state when closing
      setState({ query: '', results: [], isLoading: false, error: null })
      setSelectedIndex(0)
    }
  }, [open])

  // Handle clicks outside the content
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDialogElement>) => {
      if (event.target === event.currentTarget) {
        onOpenChange(false)
      }
    },
    [onOpenChange]
  )

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
        setSelectedIndex(0)
      } catch {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Search failed. Please try again.',
        }))
      }
    }, 100) // Fast search with MiniSearch

    return () => clearTimeout(timeoutId)
  }, [state.query, maxResults])

  // Combined items for keyboard navigation
  const items = useMemo(() => {
    if (state.query.trim()) {
      return state.results
    }
    // Show recent searches when no query
    return recentSearches.map((query) => ({
      id: `recent-${query}`,
      title: query,
      url: '',
      excerpt: '',
      score: 0,
      isRecent: true,
    }))
  }, [state.query, state.results, recentSearches])

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

  // Handle item selection
  const handleSelect = useCallback(
    (item: SearchResult & { isRecent?: boolean }) => {
      if (item.isRecent) {
        setState((prev) => ({ ...prev, query: item.title }))
      } else {
        handleNavigate(item.url)
      }
    },
    [handleNavigate]
  )

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1))
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
          break
        case 'Enter':
          event.preventDefault()
          if (items[selectedIndex]) {
            handleSelect(items[selectedIndex] as SearchResult & { isRecent?: boolean })
          }
          break
        case 'Escape':
          event.preventDefault()
          onOpenChange(false)
          break
      }
    },
    [items, selectedIndex, handleSelect, onOpenChange]
  )

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return

    const selectedEl = list.querySelector('[data-selected="true"]')
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'fixed inset-0 z-50 m-0 h-full w-full max-h-full max-w-full',
        'bg-black/60 backdrop-blur-sm',
        'open:flex open:items-start open:justify-center open:pt-[15vh]',
        '[&::backdrop]:hidden'
      )}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className={cn(
          'w-full max-w-xl mx-4',
          'bg-white dark:bg-zinc-900',
          'rounded-xl shadow-2xl',
          'border border-zinc-200 dark:border-zinc-800',
          'overflow-hidden',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 px-4">
          <Search className="h-5 w-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={state.query}
            onChange={(e) => setState((prev) => ({ ...prev, query: e.target.value }))}
            placeholder={placeholder}
            className={cn(
              'flex-1 h-14 px-3 bg-transparent',
              'text-zinc-900 dark:text-zinc-100',
              'placeholder:text-zinc-500',
              'focus:outline-none'
            )}
          />
          {state.isLoading && (
            <Loader2 className="h-5 w-5 text-zinc-400 animate-spin" />
          )}
          <button
            onClick={() => onOpenChange(false)}
            className={cn(
              'ml-2 p-1.5 rounded-md',
              'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200',
              'hover:bg-zinc-100 dark:hover:bg-zinc-800',
              'transition-colors'
            )}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto p-2"
          role="listbox"
        >
          {/* Loading search index */}
          {!searchReady && state.query.trim() && (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Initializing search...</span>
            </div>
          )}

          {/* Error state */}
          {state.error && (
            <div className="px-3 py-4 text-center text-sm text-red-600 dark:text-red-400">
              {state.error}
            </div>
          )}

          {/* Empty state */}
          {!state.isLoading && state.query.trim() && state.results.length === 0 && searchReady && !state.error && (
            <div className="px-3 py-8 text-center text-sm text-zinc-500">
              No results found for "{state.query}"
            </div>
          )}

          {/* Recent searches (when no query) */}
          {!state.query.trim() && recentSearches.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Recent Searches
              </div>
              {recentSearches.map((query, index) => (
                <button
                  key={query}
                  onClick={() => setState((prev) => ({ ...prev, query }))}
                  data-selected={index === selectedIndex}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
                    'text-left text-sm',
                    'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                    'focus:outline-none',
                    index === selectedIndex && 'bg-zinc-100 dark:bg-zinc-800'
                  )}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <Clock className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span className="text-zinc-700 dark:text-zinc-300">{query}</span>
                </button>
              ))}
            </>
          )}

          {/* Search results */}
          {state.results.length > 0 && (
            <>
              <div className="px-3 py-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Results
              </div>
              {state.results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleNavigate(result.url)}
                  data-selected={index === selectedIndex}
                  className={cn(
                    'w-full flex items-start gap-3 px-3 py-3 rounded-lg',
                    'text-left',
                    'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                    'focus:outline-none',
                    'transition-colors',
                    index === selectedIndex && 'bg-zinc-100 dark:bg-zinc-800'
                  )}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <FileText className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {result.title}
                    </div>
                    {result.section && (
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {result.section}
                      </div>
                    )}
                    <div
                      className={cn(
                        'text-sm text-zinc-600 dark:text-zinc-400 mt-1',
                        'line-clamp-2',
                        '[&_mark]:bg-yellow-200 dark:[&_mark]:bg-yellow-900/50',
                        '[&_mark]:text-zinc-900 dark:[&_mark]:text-zinc-100',
                        '[&_mark]:px-0.5 [&_mark]:rounded'
                      )}
                      dangerouslySetInnerHTML={{
                        __html: result.excerpt || highlightMatches(result.content?.slice(0, 150) || '', state.query),
                      }}
                    />
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Keyboard hints */}
          <div className="flex items-center justify-center gap-4 px-3 py-3 mt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px]">↑↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px]">↵</kbd>
              to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px]">esc</kbd>
              to close
            </span>
          </div>
        </div>
      </div>
    </dialog>
  )
}


/** Search result */
export interface SearchResult {
  /** Unique identifier for the result */
  id: string
  /** Page title */
  title: string
  /** URL/path to the page */
  url: string
  /** Content excerpt with matching text */
  excerpt: string
  /** Page description */
  description?: string
  /** Section heading (if available) */
  section?: string
  /** Relevance score (0-1) */
  score: number
  /** Raw content for additional processing */
  content?: string
}

/** Pagefind search result (raw from API) */
export interface PagefindResult {
  id: string
  score: number
  data: () => Promise<PagefindResultData>
}

/** Pagefind result data after loading */
export interface PagefindResultData {
  url: string
  content: string
  excerpt: string
  meta: {
    title?: string
    image?: string
  }
  anchors?: Array<{
    element: string
    id: string
    text: string
    location: number
  }>
  sub_results?: Array<{
    title: string
    url: string
    excerpt: string
    anchor?: {
      element: string
      id: string
      text: string
      location: number
    }
  }>
}

/** Pagefind search response */
export interface PagefindSearchResponse {
  results: PagefindResult[]
  unfilteredResultCount: number
  filters: Record<string, Record<string, number>>
  totalFilters: Record<string, Record<string, number>>
  timings: {
    preload: number
    search: number
    total: number
  }
}

/** Pagefind instance */
export interface PagefindInstance {
  init: () => Promise<void>
  search: (query: string, options?: PagefindSearchOptions) => Promise<PagefindSearchResponse>
  debouncedSearch: (
    query: string,
    options?: PagefindSearchOptions,
    debounceMs?: number
  ) => Promise<PagefindSearchResponse | null>
  filters: () => Promise<Record<string, Record<string, number>>>
  preload: (query: string) => Promise<void>
  destroy: () => void
}

/** Pagefind search options */
export interface PagefindSearchOptions {
  filters?: Record<string, string | string[]>
  sort?: Record<string, 'asc' | 'desc'>
}

/** Search modal props */
export interface SearchModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Placeholder text for the search input */
  placeholder?: string
  /** Max results to show */
  maxResults?: number
  /** Custom navigate function (defaults to window.location) */
  onNavigate?: (url: string) => void
}

/** Search context value */
export interface SearchContextValue {
  /** Open the search modal */
  open: () => void
  /** Close the search modal */
  close: () => void
  /** Toggle the search modal */
  toggle: () => void
  /** Whether search is available (Pagefind loaded) */
  isAvailable: boolean
  /** Whether the modal is currently open */
  isOpen: boolean
}

/** Search provider props */
export interface SearchProviderProps {
  children: React.ReactNode
  /** Custom navigate function for SPA navigation */
  onNavigate?: (url: string) => void
}

/** Search state */
export interface SearchState {
  /** Current search query */
  query: string
  /** Search results */
  results: SearchResult[]
  /** Whether search is in progress */
  isLoading: boolean
  /** Error message if search failed */
  error: string | null
}

import type { SearchResult } from './types.js'

// Search result item type
type SearchResultItem = {
  id: string
  title: string
  description: string
  url: string
  score: number
}

// Search function type - can be sync or async
type SearchFn = (query: string, options?: { maxResults?: number }) => 
  | SearchResultItem[]
  | Promise<SearchResultItem[]>

/** Search function - set via setSearchFunction */
let searchFn: SearchFn | null = null

/** Whether search is initialized */
let isInitialized = false

/**
 * Set the search function (called from entry point)
 */
export function setSearchFunction(fn: SearchFn): void {
  searchFn = fn
  isInitialized = true
  console.debug('[revitedocs] Search initialized')
}

/**
 * Initialize search - checks if search function is available
 */
export async function initSearch(): Promise<boolean> {
  // Give a small delay to allow entry point to set the function
  if (!isInitialized) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  return isInitialized
}

/**
 * Search documentation
 */
export async function searchDocs(
  query: string,
  maxResults = 10
): Promise<SearchResult[]> {
  if (!query.trim()) return []

  // Ensure search is initialized
  if (!isInitialized) {
    await initSearch()
  }

  if (!searchFn) {
    console.warn('[revitedocs] Search not available')
    return []
  }

  try {
    // Handle both sync and async search functions
    const resultsOrPromise = searchFn(query)
    const results = Array.isArray(resultsOrPromise) 
      ? resultsOrPromise 
      : await resultsOrPromise
    
    return results.slice(0, maxResults).map(result => ({
      id: result.id,
      title: result.title,
      url: result.url,
      excerpt: result.description || '',
      score: result.score,
    }))
  } catch (error) {
    console.error('[revitedocs] Search error:', error)
    return []
  }
}

/**
 * Check if search is available
 */
export function isSearchAvailable(): boolean {
  return isInitialized && searchFn !== null
}

/**
 * Legacy exports for backward compatibility
 */
export const loadPagefind = initSearch
export const searchWithPagefind = searchDocs
export const isPagefindAvailable = isSearchAvailable

/**
 * Highlight matching terms in text
 */
export function highlightMatches(text: string, query: string): string {
  if (!query.trim()) return text
  
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  let result = text

  for (const term of terms) {
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi')
    result = result.replace(regex, '<mark>$1</mark>')
  }

  return result
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// No-op for backward compatibility
export function getPagefindError(): string | null {
  return null
}

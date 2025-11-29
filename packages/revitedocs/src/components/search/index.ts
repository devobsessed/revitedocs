// Components
export { SearchModal } from './SearchModal.js'
export { SearchProvider, useSearch } from './SearchContext.js'

// Hooks
export { usePagefind, type UsePagefindReturn } from './usePagefind.js'

// Utilities
export {
  initSearch,
  searchDocs,
  isSearchAvailable,
  highlightMatches,
  setSearchFunction,
  // Legacy aliases
  loadPagefind,
  searchWithPagefind,
  isPagefindAvailable,
} from './pagefind.js'

// Types
export type {
  SearchModalProps,
  SearchResult,
  SearchContextValue,
  SearchProviderProps,
  SearchState,
} from './types.js'


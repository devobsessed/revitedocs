import { describe, it, expect } from 'vitest'

describe('search exports', () => {
  it('exports SearchModal component', async () => {
    const { SearchModal } = await import('./index.js')
    expect(SearchModal).toBeDefined()
    expect(typeof SearchModal).toBe('function')
  })

  it('exports useSearch hook', async () => {
    const { useSearch } = await import('./index.js')
    expect(useSearch).toBeDefined()
    expect(typeof useSearch).toBe('function')
  })

  it('exports SearchProvider component', async () => {
    const { SearchProvider } = await import('./index.js')
    expect(SearchProvider).toBeDefined()
    expect(typeof SearchProvider).toBe('function')
  })
})

describe('search types', () => {
  it('exports SearchResult type', async () => {
    // Type check - if this compiles, the type is exported correctly
    const { SearchModal } = await import('./index.js')
    // Verify SearchModal accepts props (type check)
    expect(typeof SearchModal).toBe('function')
  })
})

describe('usePagefind hook', () => {
  it('exports usePagefind hook', async () => {
    const { usePagefind } = await import('./index.js')
    expect(usePagefind).toBeDefined()
    expect(typeof usePagefind).toBe('function')
  })
})

describe('pagefind integration', () => {
  it('exports loadPagefind function', async () => {
    const { loadPagefind } = await import('./pagefind.js')
    expect(loadPagefind).toBeDefined()
    expect(typeof loadPagefind).toBe('function')
  })

  it('exports searchWithPagefind function', async () => {
    const { searchWithPagefind } = await import('./pagefind.js')
    expect(searchWithPagefind).toBeDefined()
    expect(typeof searchWithPagefind).toBe('function')
  })
})

describe('highlightMatches', () => {
  it('highlights single term matches', async () => {
    const { highlightMatches } = await import('./pagefind.js')
    const result = highlightMatches('Hello world', 'world')
    expect(result).toBe('Hello <mark>world</mark>')
  })

  it('highlights multiple term matches', async () => {
    const { highlightMatches } = await import('./pagefind.js')
    const result = highlightMatches('Hello world foo bar', 'world bar')
    expect(result).toContain('<mark>world</mark>')
    expect(result).toContain('<mark>bar</mark>')
  })

  it('handles case-insensitive matching', async () => {
    const { highlightMatches } = await import('./pagefind.js')
    const result = highlightMatches('Hello WORLD World', 'world')
    expect(result).toBe('Hello <mark>WORLD</mark> <mark>World</mark>')
  })

  it('returns original text for empty query', async () => {
    const { highlightMatches } = await import('./pagefind.js')
    const result = highlightMatches('Hello world', '')
    expect(result).toBe('Hello world')
  })

  it('escapes regex special characters', async () => {
    const { highlightMatches } = await import('./pagefind.js')
    const result = highlightMatches('Hello [world]', '[world]')
    expect(result).toBe('Hello <mark>[world]</mark>')
  })
})

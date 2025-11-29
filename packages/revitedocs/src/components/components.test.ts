import { describe, it, expect } from 'vitest'

// Test that all components and hooks export correctly
describe('components exports', () => {
  // Layout components
  it('exports Layout component', async () => {
    const { Layout } = await import('./index.js')
    expect(Layout).toBeDefined()
    expect(typeof Layout).toBe('function')
  })

  it('exports Header component', async () => {
    const { Header } = await import('./index.js')
    expect(Header).toBeDefined()
    expect(typeof Header).toBe('function')
  })

  it('exports Sidebar component', async () => {
    const { Sidebar } = await import('./index.js')
    expect(Sidebar).toBeDefined()
    expect(typeof Sidebar).toBe('function')
  })

  it('exports TableOfContents component', async () => {
    const { TableOfContents } = await import('./index.js')
    expect(TableOfContents).toBeDefined()
    expect(typeof TableOfContents).toBe('function')
  })

  it('exports PageWrapper component', async () => {
    const { PageWrapper } = await import('./index.js')
    expect(PageWrapper).toBeDefined()
    expect(typeof PageWrapper).toBe('function')
  })

  // Doc components
  it('exports CodeBlock component', async () => {
    const { CodeBlock } = await import('./index.js')
    expect(CodeBlock).toBeDefined()
    expect(typeof CodeBlock).toBe('function')
  })

  it('exports Callout component', async () => {
    const { Callout } = await import('./index.js')
    expect(Callout).toBeDefined()
    expect(typeof Callout).toBe('function')
  })

  it('exports Tabs component', async () => {
    const { Tabs } = await import('./index.js')
    expect(Tabs).toBeDefined()
    expect(typeof Tabs).toBe('function')
  })

  it('exports TabGroup component', async () => {
    const { TabGroup } = await import('./index.js')
    expect(TabGroup).toBeDefined()
    expect(typeof TabGroup).toBe('function')
  })

  it('exports Steps component', async () => {
    const { Steps } = await import('./index.js')
    expect(Steps).toBeDefined()
    expect(typeof Steps).toBe('function')
  })

  it('exports Step component', async () => {
    const { Step } = await import('./index.js')
    expect(Step).toBeDefined()
    expect(typeof Step).toBe('function')
  })

  it('exports Card component', async () => {
    const { Card } = await import('./index.js')
    expect(Card).toBeDefined()
    expect(typeof Card).toBe('function')
  })

  it('exports CardGroup component', async () => {
    const { CardGroup } = await import('./index.js')
    expect(CardGroup).toBeDefined()
    expect(typeof CardGroup).toBe('function')
  })

  it('exports FileTree component', async () => {
    const { FileTree } = await import('./index.js')
    expect(FileTree).toBeDefined()
    expect(typeof FileTree).toBe('function')
  })

  it('exports Badge component', async () => {
    const { Badge } = await import('./index.js')
    expect(Badge).toBeDefined()
    expect(typeof Badge).toBe('function')
  })

  it('exports VersionBadge component', async () => {
    const { VersionBadge } = await import('./index.js')
    expect(VersionBadge).toBeDefined()
    expect(typeof VersionBadge).toBe('function')
  })

  it('exports StatusBadge component', async () => {
    const { StatusBadge } = await import('./index.js')
    expect(StatusBadge).toBeDefined()
    expect(typeof StatusBadge).toBe('function')
  })

  it('exports MermaidDiagram component', async () => {
    const { MermaidDiagram } = await import('./index.js')
    expect(MermaidDiagram).toBeDefined()
    expect(typeof MermaidDiagram).toBe('function')
  })

  it('exports CopyMarkdownButton component', async () => {
    const { CopyMarkdownButton } = await import('./index.js')
    expect(CopyMarkdownButton).toBeDefined()
    expect(typeof CopyMarkdownButton).toBe('function')
  })

  // Hooks
  it('exports useTheme hook', async () => {
    const { useTheme } = await import('./index.js')
    expect(useTheme).toBeDefined()
    expect(typeof useTheme).toBe('function')
  })

  it('exports useScrollSpy hook', async () => {
    const { useScrollSpy } = await import('./index.js')
    expect(useScrollSpy).toBeDefined()
    expect(typeof useScrollSpy).toBe('function')
  })

  // Utilities
  it('exports cn utility', async () => {
    const { cn } = await import('./index.js')
    expect(cn).toBeDefined()
    expect(typeof cn).toBe('function')
  })
})

describe('cn utility', () => {
  it('merges class names', async () => {
    const { cn } = await import('./index.js')
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', async () => {
    const { cn } = await import('./index.js')
    const condition = false
    expect(cn('foo', condition && 'bar', 'baz')).toBe('foo baz')
  })

  it('merges Tailwind classes correctly', async () => {
    const { cn } = await import('./index.js')
    // tailwind-merge should combine conflicting classes
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

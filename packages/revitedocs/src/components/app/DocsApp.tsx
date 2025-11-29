import { useState, useEffect } from 'react'
import { MDXProvider } from '@mdx-js/react'
import { Search, Moon, Sun, Menu, X } from 'lucide-react'
import { Button } from '../ui/button.js'
import { ScrollArea } from '../ui/scroll-area.js'
import { SearchModal, setSearchFunction } from '../search/index.js'
import { VersionSwitcher } from '../layout/VersionSwitcher.js'
import { LanguageSwitcher, type LocaleConfig } from '../layout/LanguageSwitcher.js'
import { CopyMarkdownButton } from '../docs/CopyMarkdownButton.js'
import { Callout } from '../docs/Callout.js'
import { MermaidDiagram } from '../docs/MermaidDiagram.js'
import { TabGroup } from '../docs/Tabs.js'
import { Steps, Step } from '../docs/Steps.js'
import { FileTree } from '../docs/FileTree.js'
import { cn } from '../utils.js'

// Types for route and config
export interface RouteInfo {
  path: string
  element: React.ComponentType
  frontmatter?: Record<string, unknown>
  toc?: Array<{ id: string; text: string; depth: number }>
  rawMarkdown?: string
}

export interface NavItem {
  text: string
  link: string
}

export interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
}

export interface SidebarSection {
  text: string
  items: SidebarItem[]
}

export interface DocsConfig {
  title: string
  description?: string
  base?: string
  versions?: string[]
  defaultVersion?: string
  locales?: Record<string, LocaleConfig>
  defaultLocale?: string
  theme?: {
    nav?: NavItem[]
    sidebar?: Record<string, SidebarSection[]>
  }
}

export type SearchFn = (
  query: string,
  options?: { maxResults?: number }
) => Array<{
  id: string
  title: string
  description: string
  url: string
  score: number
}> | Promise<Array<{
  id: string
  title: string
  description: string
  url: string
  score: number
}>>

export interface DocsAppProps {
  routes: RouteInfo[]
  config: DocsConfig
  search?: SearchFn
  /** Server rendering mode - disables client-only features */
  ssr?: boolean
}

// MDX components mapping
const mdxComponents = {
  Callout,
  MermaidDiagram,
  TabGroup,
  Steps,
  Step,
  FileTree,
}

// Detect version from path (e.g., /v2/guide/intro -> 'v2')
function detectVersion(path: string): string | null {
  const match = path.match(/^\/?v(\d+(?:\.\d+)*)/)
  return match ? `v${match[1]}` : null
}

// Detect locale from path (e.g., /en/guide/intro -> 'en')
function detectLocale(path: string): string | null {
  const match = path.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(?:\/|$)/)
  return match ? match[1] : null
}

// Get the appropriate sidebar config for the current path
function getSidebarForPath(
  path: string,
  sidebarConfig?: Record<string, SidebarSection[]>
): SidebarSection[] {
  if (!sidebarConfig) return []
  const keys = Object.keys(sidebarConfig).sort((a, b) => b.length - a.length)
  for (const key of keys) {
    if (
      path.startsWith(key) ||
      (key === '/' && !keys.some((k) => k !== '/' && path.startsWith(k)))
    ) {
      return sidebarConfig[key] || []
    }
  }
  return sidebarConfig['/'] || []
}

// Get initial theme from localStorage or system preference
function getInitialTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('revitedocs-theme')
    if (stored === 'light' || stored === 'dark') {
      return stored
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
  }
  return 'light'
}

/**
 * DocsApp - Main documentation application component
 * Uses shadcn/ui components for a polished appearance
 */
export function DocsApp({ routes, config, search, ssr = false }: DocsAppProps) {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'
  const [searchOpen, setSearchOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (ssr ? 'light' : getInitialTheme()))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeId, setActiveId] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  // Initialize search function
  useEffect(() => {
    if (search) {
      setSearchFunction(search)
    }
  }, [search])

  // Mark as mounted after hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle Cmd/Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Handle theme toggle
  useEffect(() => {
    if (!ssr) {
      document.documentElement.classList.toggle('dark', theme === 'dark')
      localStorage.setItem('revitedocs-theme', theme)
    }
  }, [theme, ssr])

  // Set HTML lang attribute based on locale
  const currentLocale = detectLocale(path)
  useEffect(() => {
    const activeLocale = currentLocale || config.defaultLocale
    if (activeLocale && config.locales?.[activeLocale]) {
      document.documentElement.lang = config.locales[activeLocale].lang
    }
  }, [currentLocale, config.defaultLocale, config.locales])

  // Find current route
  const route =
    routes.find(
      (r) =>
        r.path === path ||
        r.path === path.replace(/\/$/, '') ||
        (r.path === '/' && (path === '/' || path === ''))
    ) || routes[0]

  // Scroll spy for TOC
  useEffect(() => {
    if (!route?.toc?.length) return

    const ids = route.toc.map((item) => item.id)
    if (ids.length === 0) return

    const handleScroll = () => {
      let currentId = ids[0]
      for (const id of ids) {
        const element = document.getElementById(id)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 150) {
            currentId = id
          } else {
            break
          }
        }
      }
      setActiveId(currentId)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [route?.toc])

  // Derived state
  const currentVersion = detectVersion(path)
  const hasVersions = config.versions && config.versions.length > 0
  const hasLocales = config.locales && Object.keys(config.locales).length > 1
  const sidebarSections = getSidebarForPath(path, config.theme?.sidebar)

  // Handle navigation from search
  const handleNavigate = (url: string) => {
    window.history.pushState({}, '', url)
    window.location.reload()
  }

  if (!route) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-950">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-500 mb-2">404 - No pages found</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Create an index.md file in your docs folder.</p>
        </div>
      </div>
    )
  }

  const Page = route.element

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Search Modal - render after hydration to avoid mismatch */}
      {isMounted && (
        <SearchModal
          open={searchOpen}
          onOpenChange={setSearchOpen}
          onNavigate={handleNavigate}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-950/60">
        <div className="flex h-14 items-center px-4 md:px-6">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold">
              {config.title?.[0] || 'D'}
            </div>
            <span className="font-semibold hidden sm:inline">{config.title || 'Documentation'}</span>
          </div>

          <div className="flex-1" />

          {/* Search button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSearchOpen(true)}
            className="mr-2 text-zinc-500 dark:text-zinc-400"
          >
            <Search className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden md:inline ml-4 px-1.5 py-0.5 text-xs rounded bg-zinc-200 dark:bg-zinc-700">
              ⌘K
            </kbd>
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-4 ml-4">
            {(config.theme?.nav || []).map((item, i) => (
              <a
                key={i}
                href={item.link}
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                {item.text}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950',
            'transform transition-transform duration-200 ease-in-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'md:translate-x-0'
          )}
        >
          <ScrollArea className="h-full">
            <nav className="p-4 pt-6 space-y-6">
              {/* Version and Language Switchers */}
              {(hasVersions || hasLocales) && (
                <div className="space-y-3">
                  {hasVersions && (
                    <VersionSwitcher
                      versions={config.versions!}
                      currentVersion={currentVersion ?? undefined}
                      defaultVersion={config.defaultVersion}
                      currentPath={path}
                    />
                  )}
                  {hasLocales && (
                    <LanguageSwitcher
                      locales={config.locales!}
                      currentLocale={currentLocale ?? undefined}
                      defaultLocale={config.defaultLocale}
                      currentPath={path}
                    />
                  )}
                </div>
              )}

              {/* Sidebar sections */}
              {sidebarSections.map((section, i) => (
                <div key={i}>
                  <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {section.text}
                  </h3>
                  <div className="space-y-1">
                    {(section.items || []).map((item, j) => (
                      <a
                        key={j}
                        href={item.link}
                        className={cn(
                          'block rounded-md px-3 py-2 text-sm transition-colors',
                          'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                          path === item.link
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                            : 'text-zinc-600 dark:text-zinc-400'
                        )}
                      >
                        {item.text}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        {/* Main content */}
        <main
          className={cn(
            'flex-1 min-w-0 px-4 md:px-8 py-8 md:ml-64 bg-white dark:bg-zinc-950',
            route.toc && route.toc.length > 0 && 'lg:mr-56'
          )}
        >
          <article className="prose dark:prose-invert max-w-none">
            {/* Page header with title and copy button */}
            {(route.frontmatter?.title || route.rawMarkdown) && (
              <div className="flex items-start justify-between gap-4 mb-4 not-prose">
                {route.frontmatter?.title ? (
                  <h1 className="text-3xl font-bold tracking-tight m-0">
                    {route.frontmatter.title as string}
                  </h1>
                ) : (
                  <div />
                )}
                {route.rawMarkdown && (
                  <CopyMarkdownButton
                    markdown={route.rawMarkdown}
                    className="flex-shrink-0 mt-1"
                  />
                )}
              </div>
            )}
            <MDXProvider components={mdxComponents}>
              <Page />
            </MDXProvider>
          </article>
        </main>

        {/* Table of Contents */}
        {route.toc && route.toc.length > 0 && (
          <aside className="hidden lg:block fixed right-4 top-16 w-52 max-h-[calc(100vh-5rem)] overflow-y-auto py-4">
            <p className="text-sm font-semibold mb-3">On this page</p>
            <ul className="space-y-2 text-sm border-l border-zinc-200 dark:border-zinc-800">
              {route.toc.map((item, i) => {
                const isActive = activeId === item.id
                return (
                  <li key={i} className="relative pl-3 -ml-px">
                    {isActive && (
                      <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-zinc-900 dark:bg-zinc-100" />
                    )}
                    <a
                      href={`#${item.id}`}
                      className={cn(
                        'block transition-colors',
                        isActive
                          ? 'text-zinc-900 dark:text-zinc-100 font-medium'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                      )}
                    >
                      {item.text}
                    </a>
                  </li>
                )
              })}
            </ul>
          </aside>
        )}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

// Also export a server-side version for SSR
export function DocsAppSSR(props: DocsAppProps) {
  return <DocsApp {...props} ssr />
}


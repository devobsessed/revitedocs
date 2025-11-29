import { createElement, useState, useEffect, type ReactNode } from 'react'
import { Header, type NavItem } from './Header.js'
import { Sidebar, type SidebarSection } from './Sidebar.js'
import { TableOfContents, type TocItem } from './TableOfContents.js'
import { SearchModal } from '../search/SearchModal.js'
import { useTheme } from '../hooks/useTheme.js'
import { useScrollSpy } from '../hooks/useScrollSpy.js'
import { cn } from '../utils.js'

export interface LocaleConfig {
  label: string
  lang: string
}

export interface LayoutProps {
  children: ReactNode
  title?: string
  logo?: string
  nav?: NavItem[]
  sidebar?: SidebarSection[]
  toc?: TocItem[]
  currentPath?: string
  className?: string
  /** Custom navigate function for SPA navigation */
  onNavigate?: (url: string) => void
  /** Available documentation versions (e.g., ['v2', 'v1']) */
  versions?: string[]
  /** Currently active version */
  currentVersion?: string
  /** Default version to use when not specified */
  defaultVersion?: string
  /** Available locales configuration */
  locales?: Record<string, LocaleConfig>
  /** Currently active locale */
  currentLocale?: string
  /** Default locale */
  defaultLocale?: string
}

/**
 * Main layout component that combines header, sidebar, content, and TOC
 */
export function Layout({
  children,
  title = 'Documentation',
  logo,
  nav = [],
  sidebar = [],
  toc = [],
  currentPath,
  className,
  onNavigate,
  versions,
  currentVersion,
  defaultVersion,
  locales,
  currentLocale,
  defaultLocale,
}: LayoutProps) {
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  
  const tocIds = toc.map((item) => item.id)
  const activeId = useScrollSpy(tocIds)

  // Global keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Set HTML lang attribute based on current locale
  useEffect(() => {
    const activeLocale = currentLocale || defaultLocale
    if (activeLocale && locales?.[activeLocale]) {
      document.documentElement.lang = locales[activeLocale].lang
    }
  }, [currentLocale, defaultLocale, locales])

  return createElement('div', { className: cn('min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100', className) },
    // Search Modal
    createElement(SearchModal, {
      open: searchOpen,
      onOpenChange: setSearchOpen,
      onNavigate,
    }),

    // Header
    createElement(Header, {
      title,
      logo,
      nav,
      theme,
      onThemeToggle: toggleTheme,
      onSearchOpen: () => setSearchOpen(true),
      onMenuToggle: () => setSidebarOpen(!sidebarOpen),
    }),

    // Main content area
    createElement('div', { className: 'flex' },
      // Sidebar
      sidebar.length > 0 && createElement(Sidebar, {
        sections: sidebar,
        currentPath,
        isOpen: sidebarOpen,
        onClose: () => setSidebarOpen(false),
        versions,
        currentVersion,
        defaultVersion,
        locales,
        currentLocale,
        defaultLocale,
      }),

      // Main content
      createElement('main', {
        className: cn(
          'flex-1 min-w-0',
          sidebar.length > 0 && 'md:ml-64', // Offset for sidebar on desktop
          toc.length > 0 && 'lg:mr-56', // Offset for TOC on large screens
        ),
      },
        createElement('div', { className: 'px-4 md:px-8 py-8' }, children)
      ),

      // Table of Contents
      toc.length > 0 && createElement('aside', {
        className: 'hidden lg:block fixed top-14 right-4 w-52 max-h-[calc(100vh-5rem)] overflow-y-auto py-8',
      },
        createElement(TableOfContents, { items: toc, activeId })
      )
    ),

    // Mobile sidebar overlay
    sidebarOpen && createElement('div', {
      className: 'fixed inset-0 z-30 bg-black/50 md:hidden',
      onClick: () => setSidebarOpen(false),
    })
  )
}


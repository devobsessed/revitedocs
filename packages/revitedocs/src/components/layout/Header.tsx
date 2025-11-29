import { createElement } from 'react'
import { Search, Moon, Sun, Menu } from 'lucide-react'
import { cn } from '../utils.js'
import type { Theme } from '../hooks/useTheme.js'

export interface NavItem {
  text: string
  link: string
}

export interface HeaderProps {
  title?: string
  logo?: string
  nav?: NavItem[]
  theme: Theme
  onThemeToggle: () => void
  onSearchOpen?: () => void
  onMenuToggle?: () => void
  className?: string
}

/**
 * Header component with logo, navigation, theme toggle, and search
 */
export function Header({
  title = 'Documentation',
  logo,
  nav = [],
  theme,
  onThemeToggle,
  onSearchOpen,
  onMenuToggle,
  className,
}: HeaderProps) {
  return createElement('header', {
    className: cn(
      'sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur',
      'supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-950/60',
      className
    ),
  },
    createElement('div', { className: 'flex h-14 items-center px-4 md:px-6' },
      // Mobile menu button
      onMenuToggle && createElement('button', {
        onClick: onMenuToggle,
        className: 'mr-2 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden',
        'aria-label': 'Toggle navigation menu',
      },
        createElement(Menu, { className: 'h-5 w-5' })
      ),

      // Logo & Title
      createElement('div', { className: 'mr-4 flex items-center space-x-2' },
        logo
          ? createElement('img', { src: logo, alt: '', className: 'h-8 w-8' })
          : createElement('div', {
              className: 'flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-sm',
            }, title.charAt(0).toUpperCase()),
        createElement('span', { className: 'font-semibold tracking-tight' }, title)
      ),

      // Navigation links (desktop)
      nav.length > 0 && createElement('nav', { className: 'hidden md:flex items-center space-x-4 ml-4' },
        nav.map((item) =>
          createElement('a', {
            key: item.link,
            href: item.link,
            className: 'text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100',
          }, item.text)
        )
      ),

      // Spacer
      createElement('div', { className: 'flex-1' }),

      // Search button
      onSearchOpen && createElement('button', {
        onClick: onSearchOpen,
        className: cn(
          'flex items-center h-9 px-3 rounded-md border border-zinc-200 dark:border-zinc-800',
          'bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800',
          'text-zinc-500 dark:text-zinc-400'
        ),
      },
        createElement(Search, { className: 'h-4 w-4 mr-2' }),
        createElement('span', { className: 'hidden md:inline text-sm' }, 'Search...'),
        createElement('kbd', {
          className: 'hidden md:inline ml-4 px-1.5 py-0.5 text-xs rounded bg-zinc-200 dark:bg-zinc-700',
        }, '⌘K')
      ),

      // Theme toggle
      createElement('button', {
        onClick: onThemeToggle,
        className: 'ml-2 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800',
        'aria-label': 'Toggle theme',
      },
        theme === 'dark'
          ? createElement(Sun, { className: 'h-5 w-5' })
          : createElement(Moon, { className: 'h-5 w-5' })
      )
    )
  )
}


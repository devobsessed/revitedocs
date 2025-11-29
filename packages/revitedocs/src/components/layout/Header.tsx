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
 * Features: Glass morphism, animated beam border, polished micro-interactions
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
  return createElement(
    'header',
    {
      className: cn(
        'sticky top-0 z-50 w-full relative',
        // Glass morphism
        'bg-white/70 dark:bg-zinc-950/70',
        'backdrop-blur-xl backdrop-saturate-150',
        'supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-zinc-950/60',
        // Border
        'border-b border-zinc-200/50 dark:border-zinc-800/50',
        className
      ),
    },
    createElement(
      'div',
      { className: 'flex h-14 items-center px-4 md:px-6 max-w-screen-2xl mx-auto' },
      // Mobile menu button
      onMenuToggle &&
        createElement(
          'button',
          {
            onClick: onMenuToggle,
            className: cn(
              'mr-2 p-2 rounded-lg md:hidden',
              'text-zinc-600 dark:text-zinc-400',
              'hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80',
              'transition-all duration-200',
              'active:scale-95'
            ),
            'aria-label': 'Toggle navigation menu',
          },
          createElement(Menu, { className: 'h-5 w-5' })
        ),

      // Logo & Title
      createElement(
        'div',
        { className: 'mr-4 flex items-center space-x-2.5 group' },
        logo
          ? createElement('img', {
              src: logo,
              alt: '',
              className: 'h-8 w-8 transition-transform duration-300 group-hover:scale-105',
            })
          : createElement(
              'div',
              {
                className: cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg',
                  'bg-zinc-900 dark:bg-zinc-100',
                  'text-white dark:text-zinc-900 font-bold text-sm',
                  // Subtle glow
                  'shadow-[0_2px_8px_-2px_rgba(0,0,0,0.2)]',
                  'dark:shadow-[0_2px_8px_-2px_rgba(255,255,255,0.1)]',
                  'transition-all duration-300',
                  'group-hover:scale-105 group-hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.25)]',
                  'dark:group-hover:shadow-[0_4px_16px_-4px_rgba(255,255,255,0.15)]'
                ),
              },
              title.charAt(0).toUpperCase()
            ),
        createElement(
          'span',
          { className: 'font-semibold tracking-tight text-zinc-900 dark:text-zinc-100' },
          title
        )
      ),

      // Navigation links (desktop)
      nav.length > 0 &&
        createElement(
          'nav',
          { className: 'hidden md:flex items-center space-x-1 ml-4' },
          nav.map((item) =>
            createElement(
              'a',
              {
                key: item.link,
                href: item.link,
                className: cn(
                  'px-3 py-1.5 rounded-lg text-sm',
                  'text-zinc-600 dark:text-zinc-400',
                  'hover:text-zinc-900 dark:hover:text-zinc-100',
                  'hover:bg-zinc-100/70 dark:hover:bg-zinc-800/70',
                  'transition-all duration-200',
                  'active:scale-[0.98]'
                ),
              },
              item.text
            )
          )
        ),

      // Spacer
      createElement('div', { className: 'flex-1' }),

      // Search button - premium glass style
      onSearchOpen &&
        createElement(
          'button',
          {
            onClick: onSearchOpen,
            className: cn(
              'flex items-center h-9 px-3 rounded-lg',
              // Glass effect
              'bg-zinc-100/60 dark:bg-zinc-800/60',
              'border border-zinc-200/50 dark:border-zinc-700/50',
              'backdrop-blur-sm',
              // Text
              'text-zinc-500 dark:text-zinc-400',
              // Hover states
              'hover:bg-zinc-100/90 dark:hover:bg-zinc-800/90',
              'hover:border-zinc-300/50 dark:hover:border-zinc-600/50',
              'hover:text-zinc-700 dark:hover:text-zinc-300',
              // Transitions
              'transition-all duration-200',
              'active:scale-[0.98]',
              // Subtle shadow
              'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
              'hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]'
            ),
          },
          createElement(Search, { className: 'h-4 w-4 mr-2 opacity-60' }),
          createElement('span', { className: 'hidden md:inline text-sm' }, 'Search...'),
          createElement(
            'kbd',
            {
              className: cn(
                'hidden md:inline ml-4 px-1.5 py-0.5 text-xs rounded',
                'bg-zinc-200/70 dark:bg-zinc-700/70',
                'border border-zinc-300/30 dark:border-zinc-600/30',
                'font-mono text-zinc-500 dark:text-zinc-400'
              ),
            },
            '⌘K'
          )
        ),

      // Theme toggle - polished
      createElement(
        'button',
        {
          onClick: onThemeToggle,
          className: cn(
            'ml-2 p-2.5 rounded-lg',
            'text-zinc-600 dark:text-zinc-400',
            'hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80',
            'hover:text-zinc-900 dark:hover:text-zinc-100',
            'transition-all duration-200',
            'active:scale-95',
            // Subtle focus ring
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          ),
          'aria-label': 'Toggle theme',
        },
        theme === 'dark'
          ? createElement(Sun, {
              className: 'h-[18px] w-[18px] transition-transform duration-300 hover:rotate-45',
            })
          : createElement(Moon, {
              className: 'h-[18px] w-[18px] transition-transform duration-300 hover:-rotate-12',
            })
      )
    )
  )
}

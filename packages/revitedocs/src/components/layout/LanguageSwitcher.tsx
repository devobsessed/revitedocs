import { createElement, useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Globe } from 'lucide-react'
import { cn } from '../utils.js'

export interface LocaleConfig {
  label: string
  lang: string
}

export interface LanguageSwitcherProps {
  locales: Record<string, LocaleConfig>
  currentLocale?: string
  defaultLocale?: string
  currentPath: string
  className?: string
}

/**
 * Remove locale prefix from a path
 * e.g., /en/guide/intro -> /guide/intro
 */
export function stripLocaleFromPath(path: string, locale: string): string {
  const localePrefix = `/${locale}`
  if (path.startsWith(localePrefix)) {
    const stripped = path.slice(localePrefix.length)
    return stripped || '/'
  }
  return path
}

/**
 * Add locale prefix to a path
 * e.g., /guide/intro + ja -> /ja/guide/intro
 */
export function addLocaleToPath(path: string, locale: string): string {
  if (path === '/') {
    return `/${locale}/`
  }
  return `/${locale}${path}`
}

/**
 * Language switcher dropdown component
 * Allows users to switch between documentation locales while staying on the same page
 */
export function LanguageSwitcher({
  locales,
  currentLocale,
  defaultLocale,
  currentPath,
  className,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const localeKeys = Object.keys(locales)
  if (!locales || localeKeys.length === 0) {
    return null
  }

  const activeLocale = currentLocale || defaultLocale || localeKeys[0]
  const activeLocaleConfig = locales[activeLocale]

  /**
   * Get the target URL when switching to a different locale
   * Tries to maintain the same page path, with locale prefix adjusted
   */
  function getLocaleUrl(targetLocale: string): string {
    // Strip current locale from path to get the base path
    const basePath = currentLocale
      ? stripLocaleFromPath(currentPath, currentLocale)
      : currentPath

    // Add target locale prefix
    return addLocaleToPath(basePath, targetLocale)
  }

  return createElement('div', {
    ref: dropdownRef,
    className: cn('relative', className),
  },
    // Language selector button
    createElement('button', {
      onClick: () => setIsOpen(!isOpen),
      className: cn(
        'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium',
        'border transition-colors',
        'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
        'dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      ),
      'aria-expanded': isOpen,
      'aria-haspopup': 'listbox',
      'aria-label': 'Select language',
    },
      createElement(Globe, { className: 'h-4 w-4' }),
      createElement('span', null, activeLocaleConfig?.label || activeLocale),
      createElement(ChevronDown, {
        className: cn('h-4 w-4 transition-transform', isOpen && 'rotate-180'),
      })
    ),

    // Dropdown menu
    isOpen && createElement('div', {
      className: cn(
        'absolute top-full left-0 z-50 mt-1 min-w-[140px] rounded-md border shadow-lg',
        'bg-white dark:bg-gray-800 dark:border-gray-700'
      ),
      role: 'listbox',
    },
      createElement('div', { className: 'py-1' },
        localeKeys.map((localeKey) => {
          const localeConfig = locales[localeKey]
          const isSelected = localeKey === activeLocale
          const isDefault = localeKey === defaultLocale

          return createElement('a', {
            key: localeKey,
            href: getLocaleUrl(localeKey),
            role: 'option',
            'aria-selected': isSelected,
            className: cn(
              'flex items-center justify-between px-3 py-2 text-sm',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              isSelected
                ? 'text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-700 dark:text-gray-300'
            ),
            onClick: () => setIsOpen(false),
          },
            createElement('span', { className: 'flex items-center gap-2' },
              localeConfig.label,
              isDefault && createElement('span', {
                className: 'text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
              }, 'default')
            ),
            isSelected && createElement(Check, { className: 'h-4 w-4' })
          )
        })
      )
    )
  )
}


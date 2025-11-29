import React, { createElement, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '../utils.js'
import { VersionSwitcher } from './VersionSwitcher.js'
import { LanguageSwitcher, type LocaleConfig } from './LanguageSwitcher.js'

export interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

export interface SidebarSection {
  title: string
  items: SidebarItem[]
}

export interface SidebarProps {
  sections: SidebarSection[]
  currentPath?: string
  isOpen?: boolean
  onClose?: () => void
  className?: string
  /** Available documentation versions */
  versions?: string[]
  /** Currently active version */
  currentVersion?: string
  /** Default version */
  defaultVersion?: string
  /** Available locales configuration */
  locales?: Record<string, LocaleConfig>
  /** Currently active locale */
  currentLocale?: string
  /** Default locale */
  defaultLocale?: string
}

interface SidebarItemComponentProps {
  item: SidebarItem
  currentPath?: string
  depth?: number
  onNavigate?: () => void
}

function SidebarItemComponent({ item, currentPath, depth = 0, onNavigate }: SidebarItemComponentProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState(!item.collapsed)
  const hasChildren = item.items && item.items.length > 0
  const isActive = item.link && currentPath === item.link

  if (hasChildren) {
    return createElement('div', { className: 'space-y-1' },
      createElement('button', {
        onClick: () => setIsExpanded(!isExpanded),
        className: cn(
          'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'text-gray-700 dark:text-gray-300'
        ),
      },
        createElement('span', null, item.text),
        createElement(ChevronRight, {
          className: cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90'),
        })
      ),
      isExpanded && createElement('div', { className: 'ml-3 space-y-1' },
        item.items!.map((child, index) =>
          createElement(SidebarItemComponent, {
            key: child.link || index,
            item: child,
            currentPath,
            depth: depth + 1,
            onNavigate,
          })
        )
      )
    )
  }

  return createElement('a', {
    href: item.link,
    onClick: onNavigate,
    className: cn(
      'block rounded-md px-3 py-2 text-sm transition-colors',
      'hover:bg-gray-100 dark:hover:bg-gray-800',
      isActive
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-medium'
        : 'text-gray-600 dark:text-gray-400'
    ),
  }, item.text)
}

/**
 * Sidebar navigation component with collapsible sections
 */
export function Sidebar({
  sections,
  currentPath,
  isOpen = true,
  onClose,
  className,
  versions,
  currentVersion,
  defaultVersion,
  locales,
  currentLocale,
  defaultLocale,
}: SidebarProps) {
  const hasVersions = versions && versions.length > 0
  const hasLocales = locales && Object.keys(locales).length > 1

  return createElement('aside', {
    className: cn(
      'fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 overflow-y-auto border-r bg-white dark:bg-gray-900',
      'transform transition-transform duration-200 ease-in-out',
      isOpen ? 'translate-x-0' : '-translate-x-full',
      'md:translate-x-0', // Always visible on desktop
      className
    ),
  },
    createElement('nav', { className: 'p-4 pt-6 space-y-6' },
      // Switchers container (version and/or language)
      (hasVersions || hasLocales) && createElement('div', { className: 'px-3 pb-2 space-y-3' },
        // Version Switcher (when versions are configured)
        hasVersions && createElement(VersionSwitcher, {
          versions: versions!,
          currentVersion,
          defaultVersion,
          currentPath: currentPath || '/',
        }),
        // Language Switcher (when multiple locales are configured)
        hasLocales && createElement(LanguageSwitcher, {
          locales: locales!,
          currentLocale,
          defaultLocale,
          currentPath: currentPath || '/',
        })
      ),
      // Navigation sections
      sections.map((section) =>
        createElement('div', { key: section.title },
          createElement('h3', {
            className: 'mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400',
          }, section.title),
          createElement('div', { className: 'space-y-1' },
            section.items.map((item, index) =>
              createElement(SidebarItemComponent, {
                key: item.link || index,
                item,
                currentPath,
                onNavigate: onClose,
              })
            )
          )
        )
      )
    )
  )
}


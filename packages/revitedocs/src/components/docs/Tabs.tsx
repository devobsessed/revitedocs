'use client'

import { useState, type ReactNode } from 'react'
import { cn } from '../utils.js'

export interface TabItem {
  /** Tab label shown in tab button */
  label: string
  /** Tab content */
  content: ReactNode
}

export interface TabsProps {
  /** Array of tab items */
  items: TabItem[]
  /** Default active tab index */
  defaultIndex?: number
  /** Additional CSS classes */
  className?: string
}

/**
 * Tabs component for displaying tabbed content.
 * Supports keyboard navigation (arrow keys, Home, End).
 */
export function Tabs({ items, defaultIndex = 0, className }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex)

  if (items.length === 0) return null

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        newIndex = index === 0 ? items.length - 1 : index - 1
        break
      case 'ArrowRight':
        e.preventDefault()
        newIndex = index === items.length - 1 ? 0 : index + 1
        break
      case 'Home':
        e.preventDefault()
        newIndex = 0
        break
      case 'End':
        e.preventDefault()
        newIndex = items.length - 1
        break
      default:
        return
    }

    setActiveIndex(newIndex)
    // Focus the new tab button
    const tabList = e.currentTarget.parentElement
    const buttons = tabList?.querySelectorAll('[role="tab"]')
    const button = buttons?.[newIndex] as HTMLButtonElement
    button?.focus()
  }

  return (
    <div className={cn('not-prose my-6', className)}>
      {/* Tab list */}
      <div
        role="tablist"
        aria-label="Content tabs"
        className="flex border-b border-zinc-200 dark:border-zinc-700"
      >
        {items.map((item, index) => (
          <button
            key={index}
            role="tab"
            type="button"
            id={`tab-${index}`}
            aria-selected={index === activeIndex}
            aria-controls={`panel-${index}`}
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              index === activeIndex
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {items.map((item, index) => (
        <div
          key={index}
          role="tabpanel"
          id={`panel-${index}`}
          aria-labelledby={`tab-${index}`}
          hidden={index !== activeIndex}
          tabIndex={0}
          className="p-4 focus:outline-none"
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}

/**
 * TabGroup wrapper for direct use in markdown (pre-parsed tabs)
 */
export interface TabGroupProps {
  /** Tab labels array */
  labels: string[]
  /** Children must be the same count as labels */
  children: ReactNode[]
  /** Additional CSS classes */
  className?: string
}

export function TabGroup({ labels, children, className }: TabGroupProps) {
  const childArray = Array.isArray(children) ? children : [children]
  const items: TabItem[] = labels.map((label, i) => ({
    label,
    content: childArray[i] || null,
  }))

  return <Tabs items={items} className={className} />
}


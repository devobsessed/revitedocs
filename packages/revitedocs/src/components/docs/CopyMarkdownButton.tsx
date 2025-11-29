import { createElement, useState, useCallback } from 'react'
import { cn } from '../utils.js'

// Icons as SVG elements
const CopyIcon = () => createElement('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
},
  createElement('rect', { width: 14, height: 14, x: 8, y: 8, rx: 2, ry: 2 }),
  createElement('path', { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' })
)

const CheckIcon = () => createElement('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
},
  createElement('polyline', { points: '20 6 9 17 4 12' })
)

export interface CopyMarkdownButtonProps {
  /** Raw markdown content to copy */
  markdown: string
  /** Additional CSS classes */
  className?: string
  /** Button label (default: "Copy Markdown") */
  label?: string
  /** Compact mode - icon only */
  compact?: boolean
}

/**
 * Button component to copy raw markdown content to clipboard
 * Useful for feeding documentation to AI tools
 */
export function CopyMarkdownButton({ 
  markdown, 
  className,
  label = 'Copy Markdown',
  compact = false,
}: CopyMarkdownButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy markdown:', err)
    }
  }, [markdown])

  return createElement('button', {
    onClick: handleCopy,
    className: cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md',
      'text-gray-600 dark:text-gray-400',
      'bg-gray-100 dark:bg-gray-800',
      'hover:bg-gray-200 dark:hover:bg-gray-700',
      'border border-gray-200 dark:border-gray-700',
      'transition-colors duration-150',
      copied && 'text-green-600 dark:text-green-400',
      className
    ),
    title: copied ? 'Copied!' : label,
    'aria-label': label,
  },
    copied ? createElement(CheckIcon) : createElement(CopyIcon),
    !compact && createElement('span', null, copied ? 'Copied!' : label)
  )
}


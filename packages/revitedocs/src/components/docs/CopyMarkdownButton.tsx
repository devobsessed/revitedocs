import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '../ui/button.js'
import { cn } from '../utils.js'

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
 * Useful for feeding documentation to AI tools.
 * Uses shadcn/ui Button under the hood.
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

  return (
    <Button
      variant="outline"
      size={compact ? 'icon-sm' : 'sm'}
      onClick={handleCopy}
      className={cn('gap-1.5', copied && 'text-green-600 dark:text-green-400', className)}
      title={copied ? 'Copied!' : label}
      aria-label={label}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {!compact && <span>{copied ? 'Copied!' : label}</span>}
    </Button>
  )
}

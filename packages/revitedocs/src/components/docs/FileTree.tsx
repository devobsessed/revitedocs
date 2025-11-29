import { Folder, FolderOpen, File, ChevronRight, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../utils.js'

export interface FileTreeItem {
  /** File or folder name */
  name: string
  /** Type: 'file' or 'folder' */
  type: 'file' | 'folder'
  /** Child items (for folders) */
  children?: FileTreeItem[]
  /** Whether folder is expanded by default */
  defaultExpanded?: boolean
  /** Highlight this item */
  highlight?: boolean
}

export interface FileTreeProps {
  /** Tree items (can be array of FileTreeItem or raw string lines) */
  items: FileTreeItem[] | string[]
  /** Additional CSS classes */
  className?: string
}

/**
 * Parse string format file tree into structured items
 * Format: "- folder/" or "  - file.txt" (indentation indicates nesting)
 */
function parseFileTreeStrings(lines: string[]): FileTreeItem[] {
  const items: FileTreeItem[] = []
  const stack: { items: FileTreeItem[]; indent: number }[] = [{ items, indent: -1 }]

  for (const line of lines) {
    const match = line.match(/^(\s*)[-•]\s*(.+)$/)
    if (!match) continue

    const indent = match[1].length
    const name = match[2].trim()
    const isFolder = name.endsWith('/')
    const cleanName = isFolder ? name.slice(0, -1) : name

    const item: FileTreeItem = {
      name: cleanName,
      type: isFolder ? 'folder' : 'file',
      children: isFolder ? [] : undefined,
    }

    // Pop stack until we find parent
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop()
    }

    // Add to current parent
    stack[stack.length - 1].items.push(item)

    // If folder, push to stack for potential children
    if (isFolder) {
      stack.push({ items: item.children!, indent })
    }
  }

  return items
}

interface TreeNodeProps {
  item: FileTreeItem
  depth: number
}

function TreeNode({ item, depth }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(item.defaultExpanded ?? true)
  const isFolder = item.type === 'folder'
  const hasChildren = isFolder && item.children && item.children.length > 0

  return (
    <div role="treeitem" aria-expanded={isFolder ? expanded : undefined}>
      <div
        className={cn(
          'flex items-center gap-1.5 py-1 px-2 rounded-md text-sm',
          'hover:bg-zinc-100 dark:hover:bg-zinc-800',
          item.highlight && 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
          isFolder && 'cursor-pointer'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={isFolder ? () => setExpanded(!expanded) : undefined}
        onKeyDown={
          isFolder
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setExpanded(!expanded)
                }
              }
            : undefined
        }
        tabIndex={isFolder ? 0 : undefined}
        role={isFolder ? 'button' : undefined}
      >
        {/* Expand/collapse indicator for folders */}
        {isFolder ? (
          expanded ? (
            <ChevronDown className="h-4 w-4 text-zinc-400 flex-shrink-0" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-400 flex-shrink-0" aria-hidden="true" />
          )
        ) : (
          <span className="w-4 flex-shrink-0" aria-hidden="true" />
        )}

        {/* Icon */}
        {isFolder ? (
          expanded ? (
            <FolderOpen className="h-4 w-4 text-zinc-600 dark:text-zinc-400 flex-shrink-0" aria-hidden="true" />
          ) : (
            <Folder className="h-4 w-4 text-zinc-600 dark:text-zinc-400 flex-shrink-0" aria-hidden="true" />
          )
        ) : (
          <File className="h-4 w-4 text-zinc-400 flex-shrink-0" aria-hidden="true" />
        )}

        {/* Name */}
        <span className={cn('truncate', isFolder && 'font-medium')}>
          {item.name}
        </span>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div role="group">
          {item.children!.map((child, i) => (
            <TreeNode key={`${child.name}-${i}`} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * FileTree component for displaying directory structures
 */
export function FileTree({ items, className }: FileTreeProps) {
  // Parse string format if provided
  const treeItems: FileTreeItem[] = Array.isArray(items) && typeof items[0] === 'string'
    ? parseFileTreeStrings(items as string[])
    : (items as FileTreeItem[])

  return (
    <div
      className={cn(
        'not-prose my-6 rounded-lg border border-zinc-200 dark:border-zinc-700',
        'bg-zinc-50 dark:bg-zinc-800/50 p-2 font-mono text-sm',
        className
      )}
      role="tree"
      aria-label="File tree"
    >
      {treeItems.map((item, i) => (
        <TreeNode key={`${item.name}-${i}`} item={item} depth={0} />
      ))}
    </div>
  )
}


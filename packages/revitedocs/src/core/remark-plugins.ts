/**
 * Custom remark plugins for revitedocs markdown syntax
 *
 * Supports:
 * - ```mermaid - Mermaid diagrams
 *
 * Note: Container directives (:::) are handled via MDX syntax directly
 */

import type { Root, Code } from 'mdast'
import { visit } from 'unist-util-visit'

// MDX JSX types for creating proper JSX nodes
interface MdxJsxAttribute {
  type: 'mdxJsxAttribute'
  name: string
  value: string | MdxJsxAttributeValueExpression | null
}

interface MdxJsxAttributeValueExpression {
  type: 'mdxJsxAttributeValueExpression'
  value: string
  data?: {
    estree?: unknown
  }
}

interface MdxJsxFlowElement {
  type: 'mdxJsxFlowElement'
  name: string
  attributes: MdxJsxAttribute[]
  children: unknown[]
  data?: unknown
}

/**
 * Create an MDX JSX expression attribute (for JS values)
 */
function createJsxExpressionAttribute(name: string, expression: string): MdxJsxAttribute {
  return {
    type: 'mdxJsxAttribute',
    name,
    value: {
      type: 'mdxJsxAttributeValueExpression',
      value: expression,
    },
  }
}

/**
 * Create an MDX JSX flow element
 */
function createJsxElement(
  name: string,
  attributes: MdxJsxAttribute[],
  children: unknown[] = []
): MdxJsxFlowElement {
  return {
    type: 'mdxJsxFlowElement',
    name,
    attributes,
    children,
  }
}

/**
 * Remark plugin to transform ```mermaid code blocks to MermaidDiagram components
 */
export function remarkMermaid() {
  return (tree: Root) => {
    visit(tree, 'code', (node: Code, index, parent) => {
      if (node.lang === 'mermaid' && parent && typeof index === 'number') {
        // Escape backticks and create a template literal
        const escapedChart = node.value
          .replace(/\\/g, '\\\\')
          .replace(/`/g, '\\`')
          .replace(/\$/g, '\\$')

        const jsxNode = createJsxElement('MermaidDiagram', [
          createJsxExpressionAttribute('chart', `\`${escapedChart}\``),
        ])

        // Replace the code node with our JSX element
        parent.children[index] = jsxNode as unknown as typeof node
      }
    })
  }
}

/**
 * Remark plugin to transform container directives (:::) to React components
 *
 * This works by finding paragraph nodes that contain ::: syntax and transforming them
 */
export function remarkContainerDirectives() {
  return (tree: Root) => {
    // Find and transform container blocks
    const nodesToProcess: Array<{
      parent: { children: unknown[] }
      startIndex: number
      endIndex: number
      type: string
      title?: string
      contentNodes: unknown[]
    }> = []

    // First pass: identify all container blocks
    if ('children' in tree) {
      let i = 0
      while (i < tree.children.length) {
        const node = tree.children[i]
        const text = getNodeText(node)

        // Check for opening :::
        const openMatch = text.match(/^:::\s*(\w+)(?:\s+(.*))?$/)
        if (openMatch) {
          const directiveType = openMatch[1]
          const directiveTitle = openMatch[2]?.trim()

          // Find closing :::
          let endIndex = -1
          const contentNodes: unknown[] = []

          for (let j = i + 1; j < tree.children.length; j++) {
            const siblingText = getNodeText(tree.children[j])
            if (siblingText.trim() === ':::') {
              endIndex = j
              break
            }
            contentNodes.push(tree.children[j])
          }

          if (endIndex !== -1) {
            nodesToProcess.push({
              parent: tree,
              startIndex: i,
              endIndex,
              type: directiveType,
              title: directiveTitle,
              contentNodes,
            })
            i = endIndex + 1
            continue
          }
        }
        i++
      }
    }

    // Second pass: replace identified blocks (in reverse order to preserve indices)
    for (let i = nodesToProcess.length - 1; i >= 0; i--) {
      const block = nodesToProcess[i]
      const jsxNode = createDirectiveElement(block.type, block.title, block.contentNodes)

      if (jsxNode) {
        // Remove old nodes and insert JSX element
        const removeCount = block.endIndex - block.startIndex + 1
        block.parent.children.splice(block.startIndex, removeCount, jsxNode)
      }
    }
  }
}

/**
 * Get text content from a node
 */
function getNodeText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''

  const n = node as { type?: string; value?: string; children?: unknown[] }

  if (n.type === 'text' && typeof n.value === 'string') {
    return n.value
  }

  if (n.type === 'paragraph' && n.children) {
    return n.children.map(getNodeText).join('')
  }

  if (n.children && Array.isArray(n.children)) {
    return n.children.map(getNodeText).join('')
  }

  return ''
}

/**
 * Create appropriate JSX element for a directive type
 */
function createDirectiveElement(
  type: string,
  title: string | undefined,
  contentNodes: unknown[]
): MdxJsxFlowElement | null {
  // Callout types
  if (['info', 'warning', 'tip', 'danger', 'note'].includes(type)) {
    const attrs: MdxJsxAttribute[] = [{ type: 'mdxJsxAttribute', name: 'variant', value: type }]
    if (title) {
      attrs.push({ type: 'mdxJsxAttribute', name: 'title', value: title })
    }
    return createJsxElement('Callout', attrs, contentNodes)
  }

  // Tabs
  if (type === 'tabs') {
    return createTabsElement(contentNodes)
  }

  // Steps
  if (type === 'steps') {
    return createStepsElement(contentNodes)
  }

  // File tree
  if (type === 'file-tree') {
    return createFileTreeElement(contentNodes)
  }

  return null
}

/**
 * Create a TabGroup element from content nodes
 */
function createTabsElement(contentNodes: unknown[]): MdxJsxFlowElement {
  const tabs: { label: string; content: unknown[] }[] = []
  let currentTab: { label: string; content: unknown[] } | null = null

  for (const node of contentNodes) {
    const text = getNodeText(node)
    const tabMatch = text.match(/^@tab\s+(.+)/)

    if (tabMatch) {
      if (currentTab) {
        tabs.push(currentTab)
      }
      currentTab = { label: tabMatch[1].trim(), content: [] }
    } else if (currentTab) {
      currentTab.content.push(node)
    }
  }

  if (currentTab) {
    tabs.push(currentTab)
  }

  const labels = tabs.map((t) => t.label)
  const children = tabs.map((tab) => createJsxElement('div', [], tab.content))

  return createJsxElement(
    'TabGroup',
    [createJsxExpressionAttribute('labels', JSON.stringify(labels))],
    children
  )
}

/**
 * Create a Steps element from content nodes
 */
function createStepsElement(contentNodes: unknown[]): MdxJsxFlowElement {
  const steps: { content: unknown[] }[] = []
  let currentStep: { content: unknown[] } | null = null

  for (const node of contentNodes) {
    const text = getNodeText(node)
    const stepMatch = text.match(/^\d+\.\s+/)

    if (stepMatch) {
      if (currentStep) {
        steps.push(currentStep)
      }
      currentStep = { content: [node] }
    } else if (currentStep) {
      currentStep.content.push(node)
    }
  }

  if (currentStep) {
    steps.push(currentStep)
  }

  const children = steps.map((step, i) =>
    createJsxElement('Step', [createJsxExpressionAttribute('number', String(i + 1))], step.content)
  )

  return createJsxElement('Steps', [], children)
}

/**
 * Create a FileTree element from content nodes
 */
function createFileTreeElement(contentNodes: unknown[]): MdxJsxFlowElement {
  const items: string[] = []

  for (const node of contentNodes) {
    const text = getNodeText(node)
    const lines = text.split('\n').filter((l) => l.trim())
    for (const line of lines) {
      items.push(line.replace(/^-\s*/, '').trim())
    }
  }

  return createJsxElement('FileTree', [
    createJsxExpressionAttribute('items', JSON.stringify(items)),
  ])
}

/**
 * Generate import statements for doc components used in transformed markdown
 */
export function getDocComponentImports(html: string): string[] {
  const imports: string[] = []

  if (html.includes('<Callout') || html.includes(':::')) {
    imports.push('Callout')
  }
  if (html.includes('<TabGroup') || html.includes('<Tabs') || html.includes('::: tabs')) {
    imports.push('TabGroup')
  }
  if (html.includes('<Steps') || html.includes('<Step') || html.includes('::: steps')) {
    imports.push('Steps', 'Step')
  }
  if (html.includes('<FileTree') || html.includes('::: file-tree')) {
    imports.push('FileTree')
  }
  if (html.includes('<MermaidDiagram') || html.includes('```mermaid')) {
    imports.push('MermaidDiagram')
  }

  return imports
}

/**
 * Check if a code block is a mermaid diagram
 */
export function isMermaidCodeBlock(lang: string): boolean {
  return lang === 'mermaid' || lang === 'mmd'
}

/**
 * Transform a mermaid code block to MermaidDiagram component JSX
 */
export function transformMermaidToJsx(code: string): string {
  const escaped = code.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')

  return `<MermaidDiagram chart={\`${escaped}\`} />`
}

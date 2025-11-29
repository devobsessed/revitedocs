import type { Plugin } from 'vite'
import { createProcessor } from '@mdx-js/mdx'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import rehypeSlug from 'rehype-slug'
import matter from 'gray-matter'
import type { Root, Code } from 'mdast'
import type { TocItem, Frontmatter } from './markdown.js'

/**
 * Extract YAML frontmatter from markdown content
 */
function extractFrontmatter(content: string): { frontmatter: Frontmatter; content: string } {
  const { data, content: markdownContent } = matter(content)
  return {
    frontmatter: data as Frontmatter,
    content: markdownContent,
  }
}

/**
 * Generate a URL-friendly slug from text
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Strip code blocks and container directives from markdown content to avoid false positives
 */
function stripCodeBlocks(content: string): string {
  // Remove fenced code blocks (```...``` or ~~~...~~~)
  let stripped = content.replace(/^(`{3,}|~{3,})[\s\S]*?^\1/gm, '')
  // Remove indented code blocks (4 spaces or 1 tab at start of line)
  stripped = stripped.replace(/^(?: {4}|\t).*$/gm, '')
  // Remove container directives (::: type ... :::) - headings inside these are component content, not doc sections
  stripped = stripped.replace(/^:::\s*\w+[\s\S]*?^:::/gm, '')
  return stripped
}

/**
 * Extract table of contents from markdown headings
 */
function extractToc(content: string): TocItem[] {
  // Strip code blocks first to avoid picking up # comments in code
  const strippedContent = stripCodeBlocks(content)
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const toc: TocItem[] = []
  const idCounts = new Map<string, number>()
  let match

  while ((match = headingRegex.exec(strippedContent)) !== null) {
    const depth = match[1].length
    const text = match[2].trim()
    const baseId = slugify(text)
    
    // Make IDs unique by appending -1, -2, etc. for duplicates
    // This matches rehype-slug's behavior
    const count = idCounts.get(baseId) || 0
    const id = count === 0 ? baseId : `${baseId}-${count}`
    idCounts.set(baseId, count + 1)
    
    toc.push({ depth, text, id })
  }

  return toc
}

/**
 * Remark plugin to transform container directives to React components
 * Handles ::: info, ::: warning, ::: tip, ::: danger, ::: note
 */
function remarkCustomContainers() {
  return (tree: Root) => {
    const newChildren: typeof tree.children = []
    let i = 0

    while (i < tree.children.length) {
      const node = tree.children[i]

      // Check for paragraph starting with :::
      if (node.type === 'paragraph' && node.children?.[0]?.type === 'text') {
        const text = node.children[0].value
        const openMatch = text.match(/^:::\s*(\w+)(?:\s+(.*))?$/)

        if (openMatch) {
          const [, type, title] = openMatch
          const contentNodes: typeof tree.children = []
          let closed = false
          i++

          // Collect content until :::
          while (i < tree.children.length) {
            const innerNode = tree.children[i]
            if (
              innerNode.type === 'paragraph' &&
              innerNode.children?.[0]?.type === 'text' &&
              innerNode.children[0].value.trim() === ':::'
            ) {
              closed = true
              i++
              break
            }
            contentNodes.push(innerNode)
            i++
          }

          if (closed) {
            // Convert to JSX based on type
            const jsxNode = createContainerJsx(type, title, contentNodes)
            if (jsxNode) {
              newChildren.push(jsxNode)
              continue
            }
          }
          // If not properly closed, fall through to add original
        }
      }

      newChildren.push(node)
      i++
    }

    tree.children = newChildren
  }
}

/**
 * Create JSX node for container directive
 */
function createContainerJsx(
  type: string,
  title: string | undefined,
  _content: Root['children']
   
): any {
  // Callout types
  if (['info', 'warning', 'tip', 'danger', 'note'].includes(type)) {
    return {
      type: 'mdxJsxFlowElement',
      name: 'Callout',
      attributes: [
        { type: 'mdxJsxAttribute', name: 'variant', value: type },
        ...(title ? [{ type: 'mdxJsxAttribute', name: 'title', value: title }] : []),
      ],
      children: _content,
    }
  }

  return null
}

/**
 * Remark plugin to transform mermaid code blocks to MermaidDiagram components
 */
function remarkMermaid() {
  return (tree: Root) => {
    const newChildren: typeof tree.children = []

    for (const node of tree.children) {
      if (node.type === 'code' && (node.lang === 'mermaid' || node.lang === 'mmd')) {
        const codeNode = node as Code
         
        newChildren.push({
          type: 'mdxJsxFlowElement',
          name: 'MermaidDiagram',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'chart',
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: `\`${codeNode.value.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\``,
              },
            },
          ],
          children: [],
        } as any)
      } else {
        newChildren.push(node)
      }
    }

    tree.children = newChildren
  }
}

/**
 * Vite plugin that transforms .md and .mdx files into React components using MDX
 */
export function revitedocsMarkdownPlugin(): Plugin {
  // Create MDX processor once
  const processor = createProcessor({
    remarkPlugins: [
      remarkGfm,
      remarkFrontmatter,
      remarkCustomContainers,
      remarkMermaid,
    ],
    rehypePlugins: [rehypeSlug],
    jsx: false, // Output to JavaScript, not JSX
    outputFormat: 'program',
    providerImportSource: undefined,
  })

  return {
    name: 'revitedocs:markdown',
    enforce: 'pre', // Run before other plugins

    async transform(code: string, id: string) {
      // Only process .md and .mdx files
      if (!id.endsWith('.md') && !id.endsWith('.mdx')) {
        return
      }

      try {
        // Extract frontmatter first
        const { frontmatter, content } = extractFrontmatter(code)
        const toc = extractToc(content)

        // Process with MDX - outputs a VFile
        const file = await processor.process(content)
        const compiledCode = String(file)

        // Remove MDX's default export so we can provide our own wrapper
        // MDX outputs: export default function MDXContent(props) {...}
        // We need to rename it to _MDXContent and export our own default
        const processedCode = compiledCode
          .replace(/export default function MDXContent/g, 'function _MDXContent')
          .replace(/export \{ MDXContent as default \}/g, '')
        
        // Generate the output module with component imports
        const output = `
import { Callout, MermaidDiagram, Tabs, TabGroup, Steps, Step, Card, CardGroup, FileTree, Badge } from 'revitedocs/components';

export const frontmatter = ${JSON.stringify(frontmatter)};
export const toc = ${JSON.stringify(toc)};

// Provide components to MDX
const _mdxComponents = {
  Callout,
  MermaidDiagram,
  Tabs,
  TabGroup,
  Steps,
  Step,
  Card,
  CardGroup,
  FileTree,
  Badge,
};

${processedCode}

// Export wrapper that passes our custom components
export default function MarkdownContent(props) {
  return _MDXContent({ components: _mdxComponents, ...props });
}
`

        return {
          code: output,
          map: null,
        }
      } catch (error) {
        console.error('MDX compilation error for', id, ':', error)
        // Fallback to simple text rendering
        const { frontmatter, content } = extractFrontmatter(code)
        const toc = extractToc(content)

        return {
          code: `
import { createElement } from 'react';

export const frontmatter = ${JSON.stringify(frontmatter)};
export const toc = ${JSON.stringify(toc)};

export default function MarkdownContent() {
  return createElement('div', {
    className: 'markdown-content',
  }, createElement('pre', { style: { whiteSpace: 'pre-wrap' } }, ${JSON.stringify(content)}));
}
`,
          map: null,
        }
      }
    },
  }
}

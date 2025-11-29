import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeSlug from 'rehype-slug'
import { createHighlighter, type Highlighter } from 'shiki'
import matter from 'gray-matter'
import { remarkContainerDirectives } from './remark-plugins.js'

export interface TocItem {
  depth: number
  text: string
  id: string
}

export interface Frontmatter {
  title?: string
  description?: string
  [key: string]: unknown
}

export interface MarkdownResult {
  html: string
  frontmatter: Frontmatter
  toc: TocItem[]
}

// Cache the highlighter instance
let highlighterPromise: Promise<Highlighter> | null = null

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['javascript', 'typescript', 'jsx', 'tsx', 'json', 'bash', 'shell', 'markdown', 'html', 'css', 'yaml'],
    })
  }
  return highlighterPromise
}

/**
 * Extract YAML frontmatter from markdown content
 */
export function extractFrontmatter(content: string): { frontmatter: Frontmatter; content: string } {
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
    .replace(/[^\w\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .trim()
}

/**
 * Extract table of contents from markdown headings
 */
export function extractToc(content: string): TocItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const toc: TocItem[] = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length
    const text = match[2].trim()
    const id = slugify(text)

    toc.push({ depth, text, id })
  }

  return toc
}

/**
 * Create a unified processor for markdown transformation
 */
export async function createMarkdownProcessor() {
  const highlighter = await getHighlighter()

  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkContainerDirectives) // Transform ::: syntax to component JSX
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(function rehypeShiki() {
      return async (tree: any) => {
        const { visit } = await import('unist-util-visit')
        
        visit(tree, 'element', (node: any) => {
          if (node.tagName === 'pre') {
            const codeNode = node.children?.[0]
            if (codeNode?.tagName === 'code') {
              const className = codeNode.properties?.className?.[0] || ''
              const lang = className.replace('language-', '') || 'text'
              const code = codeNode.children?.[0]?.value || ''

              try {
                const highlighted = highlighter.codeToHtml(code, {
                  lang: highlighter.getLoadedLanguages().includes(lang) ? lang : 'text',
                  theme: 'github-dark',
                })
                
                // Parse the highlighted HTML and replace the node
                node.type = 'raw'
                node.value = highlighted
                delete node.children
                delete node.tagName
              } catch {
                // Keep original if highlighting fails
              }
            }
          }
        })
      }
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
}

/**
 * Transform markdown content to HTML with frontmatter and TOC
 */
export async function transformMarkdown(rawContent: string): Promise<MarkdownResult> {
  const { frontmatter, content } = extractFrontmatter(rawContent)
  const toc = extractToc(content)
  
  const processor = await createMarkdownProcessor()
  const result = await processor.process(content)
  
  return {
    html: String(result),
    frontmatter,
    toc,
  }
}


import MiniSearch from 'minisearch'
import fg from 'fast-glob'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export interface SearchDocument {
  id: string
  title: string
  description: string
  headings: string
  content: string
  url: string
}

export interface SearchIndexData {
  documents: SearchDocument[]
  index: string // Serialized MiniSearch index
}

/**
 * Extract searchable content from markdown file
 */
function extractSearchableContent(filePath: string, rootDir: string): SearchDocument | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const { data: frontmatter, content: markdown } = matter(content)

    // Generate URL from file path
    const relativePath = path.relative(rootDir, filePath)
    let url = '/' + relativePath
      .replace(/\.mdx?$/, '')
      .replace(/\/index$/, '/')
      .replace(/index$/, '/')
    
    if (!url.endsWith('/')) url += '/'

    // Extract title
    const title = frontmatter.title || extractFirstHeading(markdown) || pathToTitle(relativePath)

    // Extract description
    const description = frontmatter.description || ''

    // Extract all headings
    const headings = extractHeadings(markdown).join(' ')

    // Clean content (remove code blocks, links, etc for better search)
    const cleanContent = cleanMarkdown(markdown)

    return {
      id: url,
      title,
      description,
      headings,
      content: cleanContent.slice(0, 10000), // Limit content size
      url,
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error)
    return null
  }
}

/**
 * Extract first heading from markdown
 */
function extractFirstHeading(markdown: string): string | null {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : null
}

/**
 * Extract all headings from markdown
 */
function extractHeadings(markdown: string): string[] {
  const headingRegex = /^#{1,6}\s+(.+)$/gm
  const headings: string[] = []
  let match

  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push(match[1].trim())
  }

  return headings
}

/**
 * Clean markdown for better search indexing
 */
function cleanMarkdown(markdown: string): string {
  return markdown
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Remove frontmatter markers
    .replace(/^---[\s\S]*?---/m, '')
    // Remove directive markers
    .replace(/:::\s*\w+.*$/gm, '')
    .replace(/^:::$/gm, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Convert path to title
 */
function pathToTitle(filePath: string): string {
  const name = path.basename(filePath, path.extname(filePath))
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * Create MiniSearch instance with our configuration
 */
export function createSearchInstance(): MiniSearch<SearchDocument> {
  return new MiniSearch<SearchDocument>({
    fields: ['title', 'description', 'headings', 'content'],
    storeFields: ['title', 'description', 'url'],
    searchOptions: {
      boost: { title: 3, headings: 2, description: 1.5 },
      fuzzy: 0.2,
      prefix: true,
    },
  })
}

/**
 * Build search index from markdown files
 */
export async function buildSearchIndex(rootDir: string): Promise<SearchIndexData> {
  // Find all markdown files
  const files = await fg(['**/*.md', '**/*.mdx'], {
    cwd: rootDir,
    ignore: ['.revitedocs/**', 'node_modules/**', '**/node_modules/**'],
    absolute: true,
  })

  // Extract searchable content from each file
  const documents: SearchDocument[] = []
  for (const file of files) {
    const doc = extractSearchableContent(file, rootDir)
    if (doc) {
      documents.push(doc)
    }
  }

  // Build MiniSearch index
  const miniSearch = createSearchInstance()
  miniSearch.addAll(documents)

  return {
    documents,
    index: JSON.stringify(miniSearch.toJSON()),
  }
}

/**
 * Generate the virtual module code for search index
 * Uses simple client-side search to avoid requiring minisearch in user's project
 */
export function generateSearchIndexModule(indexData: SearchIndexData): string {
  return `
const documents = ${JSON.stringify(indexData.documents)};

export { documents };

// Simple client-side search function
export function search(query, options = {}) {
  if (!query.trim()) return [];
  
  const terms = query.toLowerCase().split(/\\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  
  const maxResults = options.maxResults || 10;
  
  // Score each document
  const scored = documents.map(doc => {
    let score = 0;
    const titleLower = (doc.title || '').toLowerCase();
    const descLower = (doc.description || '').toLowerCase();
    const headingsLower = (doc.headings || '').toLowerCase();
    const contentLower = (doc.content || '').toLowerCase();
    
    for (const term of terms) {
      // Title matches (highest weight)
      if (titleLower.includes(term)) {
        score += titleLower === term ? 100 : 50;
      }
      // Heading matches
      if (headingsLower.includes(term)) {
        score += 30;
      }
      // Description matches
      if (descLower.includes(term)) {
        score += 20;
      }
      // Content matches
      if (contentLower.includes(term)) {
        score += 10;
      }
    }
    
    return { ...doc, score };
  });
  
  // Filter and sort by score
  return scored
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(doc => ({
      id: doc.id,
      title: doc.title || doc.id,
      description: doc.description || '',
      url: doc.url || doc.id,
      score: doc.score,
    }));
}
`
}


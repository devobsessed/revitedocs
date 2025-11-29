import fs from 'node:fs/promises'
import path from 'node:path'
import type { ResolvedConfig } from './config.js'
import { extractFrontmatter, type Frontmatter } from './markdown.js'

export interface LlmsRoute {
  path: string
  file: string
  frontmatter: Frontmatter
}

/**
 * Convert a URL path to a human-readable title
 * e.g., /guide/quick-start → Guide Quick Start
 */
function pathToTitle(urlPath: string): string {
  if (urlPath === '/') return 'Home'

  return urlPath
    .replace(/^\//, '') // Remove leading slash
    .replace(/\/$/, '') // Remove trailing slash
    .split('/')
    .map((segment) =>
      segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    )
    .join(' ')
}

/**
 * Generate llms.txt overview content
 * This is a concise listing of all pages with titles and descriptions
 */
export function generateLlmsOverview(config: ResolvedConfig, routes: LlmsRoute[]): string {
  const title = config.llms.title || config.title
  const description = config.llms.description || config.description || ''

  const lines: string[] = [`# ${title}`, '']

  if (description) {
    lines.push(`> ${description}`, '')
  }

  lines.push('## Pages', '')

  for (const route of routes) {
    const pageTitle = route.frontmatter.title || pathToTitle(route.path)
    const pageDesc = route.frontmatter.description || ''

    if (pageDesc) {
      lines.push(`- [${pageTitle}](${route.path}): ${pageDesc}`)
    } else {
      lines.push(`- [${pageTitle}](${route.path})`)
    }
  }

  return lines.join('\n')
}

/**
 * Generate llms-full.txt with complete content
 * This concatenates all page content for full AI consumption
 */
export async function generateLlmsFull(
  config: ResolvedConfig,
  routes: LlmsRoute[]
): Promise<string> {
  const title = config.llms.title || config.title
  const description = config.llms.description || config.description || ''

  const sections: string[] = [`# ${title}`, '']

  if (description) {
    sections.push(`> ${description}`, '')
  }

  for (const route of routes) {
    try {
      const rawContent = await fs.readFile(route.file, 'utf-8')
      const { content } = extractFrontmatter(rawContent)
      const pageTitle = route.frontmatter.title || pathToTitle(route.path)

      sections.push('---', `# ${pageTitle}`, '', content.trim(), '')
    } catch {
      // Skip files that can't be read
      console.warn(`Warning: Could not read ${route.file}`)
    }
  }

  return sections.join('\n')
}

/**
 * Generate both llms.txt and llms-full.txt files
 * Writes to the specified output directory
 */
export async function generateLlmsTxt(
  config: ResolvedConfig,
  routes: LlmsRoute[],
  outDir: string
): Promise<void> {
  // Skip if llms generation is disabled
  if (!config.llms.enabled) {
    return
  }

  console.log('[revitedocs] Generating llms.txt files...')

  // Generate overview (llms.txt)
  const overview = generateLlmsOverview(config, routes)
  await fs.writeFile(path.join(outDir, 'llms.txt'), overview)

  // Generate full content (llms-full.txt)
  const full = await generateLlmsFull(config, routes)
  await fs.writeFile(path.join(outDir, 'llms-full.txt'), full)

  console.log(`[revitedocs] Generated llms.txt (${routes.length} pages)`)
}

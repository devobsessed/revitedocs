import path from 'node:path'
import fg from 'fast-glob'
import matter from 'gray-matter'
import fs from 'node:fs'
import pc from 'picocolors'
import { runPagefind } from './pagefind.js'
import { buildSSG, generateSitemap } from './ssg.js'
import { loadConfig } from '../../core/config.js'
import { generateLlmsTxt, type LlmsRoute } from '../../core/llms.js'
import { fileToUrlPath } from '../../core/router.js'

export interface BuildOptions {
  outDir?: string
  base?: string
  /** Skip SSG pre-rendering (client-only build) */
  skipSSG?: boolean
  /** Skip search index generation */
  skipSearch?: boolean
  /** Skip llms.txt generation */
  skipLlms?: boolean
  /** Skip sitemap.xml generation */
  skipSitemap?: boolean
  /** Base URL for sitemap (e.g., https://docs.example.com) */
  siteUrl?: string
}

/**
 * Generate routes with frontmatter for llms.txt generation
 */
async function generateLlmsRoutes(rootDir: string): Promise<LlmsRoute[]> {
  const files = await fg(['**/*.md', '**/*.mdx'], {
    cwd: rootDir,
    ignore: ['.revitedocs/**', 'node_modules/**', '**/_*'],
    absolute: true,
  })

  return files
    .filter((file) => !path.basename(file).startsWith('_'))
    .map((file) => {
      const relativePath = path.relative(rootDir, file)
      const content = fs.readFileSync(file, 'utf-8')
      const { data: frontmatter } = matter(content)

      return {
        path: fileToUrlPath(relativePath),
        file,
        frontmatter,
      }
    })
    .sort((a, b) => a.path.localeCompare(b.path))
}

export async function build(root: string, options: BuildOptions): Promise<void> {
  const resolvedRoot = path.resolve(root)
  const outDir = options.outDir ?? '.revitedocs/dist'
  const base = options.base ?? '/'

  console.log(pc.bold(`\n🚀 Building for production in ${resolvedRoot}...`))
  console.log(pc.dim(`   outDir=${outDir}, base=${base}`))

  // Load config
  const config = await loadConfig(resolvedRoot)

  // Build with SSG (pre-rendering)
  if (!options.skipSSG) {
    await buildSSG(resolvedRoot, config, { outDir, base })
  } else {
    // Fallback: client-only build (no pre-rendering)
    console.log(pc.yellow('\n⚠ SSG disabled - building client bundle only'))
    const { build: viteBuild } = await import('vite')
    await viteBuild({
      root: resolvedRoot,
      base,
      build: {
        outDir,
        ssrManifest: true,
      },
    })
  }

  const distPath = path.join(resolvedRoot, outDir)

  // Generate sitemap.xml
  if (!options.skipSitemap) {
    await generateSitemap(resolvedRoot, config, outDir, options.siteUrl)
  }

  // Generate search index with Pagefind
  if (!options.skipSearch) {
    await runPagefind({ site: distPath })
  }

  // Generate llms.txt files
  if (!options.skipLlms && config.llms.enabled) {
    const routes = await generateLlmsRoutes(resolvedRoot)
    await generateLlmsTxt(config, routes, distPath)
  }

  console.log(pc.bold(pc.green('\n✅ Build complete!')))
  console.log(pc.dim(`   Output: ${distPath}`))
}

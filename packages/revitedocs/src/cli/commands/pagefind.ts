import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import fs from 'node:fs'
import pc from 'picocolors'

const execAsync = promisify(exec)

export interface PagefindOptions {
  /** Directory containing built HTML files */
  site: string
  /** Output subdirectory for Pagefind files (default: 'pagefind') */
  outputSubdir?: string
  /** Whether to show verbose output */
  verbose?: boolean
}

/**
 * Run Pagefind to generate search index
 * Pagefind creates an index from the built HTML files
 */
export async function runPagefind(options: PagefindOptions): Promise<boolean> {
  const { site, outputSubdir = 'pagefind', verbose = false } = options

  // Check if site directory exists
  if (!fs.existsSync(site)) {
    console.error(pc.red(`✗ Build directory not found: ${site}`))
    return false
  }

  // Check if there are any HTML files to index
  const htmlFiles = findHtmlFiles(site)
  if (htmlFiles.length === 0) {
    console.warn(pc.yellow('⚠ No HTML files found to index'))
    return false
  }

  console.log(pc.cyan('⚡ Generating search index...'))
  if (verbose) {
    console.log(pc.dim(`  Found ${htmlFiles.length} HTML files`))
  }

  try {
    // Run Pagefind via npx
    const command = ['npx', 'pagefind', '--site', site, '--output-subdir', outputSubdir].join(' ')

    if (verbose) {
      console.log(pc.dim(`  Running: ${command}`))
    }

    const { stdout, stderr } = await execAsync(command, {
      cwd: path.dirname(site),
    })

    if (verbose && stdout) {
      console.log(pc.dim(stdout))
    }

    // Verify the index was created
    const indexPath = path.join(site, outputSubdir, 'pagefind.js')
    if (fs.existsSync(indexPath)) {
      console.log(pc.green('✓ Search index generated'))
      return true
    } else {
      console.error(pc.red('✗ Search index generation failed'))
      if (stderr) {
        console.error(pc.red(stderr))
      }
      return false
    }
  } catch (error) {
    // Check if Pagefind is not installed
    if (error instanceof Error && error.message.includes('not found')) {
      console.error(pc.red('✗ Pagefind not found. Install it with: npm install -D pagefind'))
    } else {
      console.error(pc.red('✗ Failed to run Pagefind:'), error)
    }
    return false
  }
}

/**
 * Find all HTML files in a directory recursively
 */
function findHtmlFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      // Skip pagefind output directory
      if (entry.name !== 'pagefind') {
        findHtmlFiles(fullPath, files)
      }
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath)
    }
  }

  return files
}

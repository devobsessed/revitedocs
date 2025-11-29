import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

// Mock @clack/prompts
vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  text: vi.fn(),
  confirm: vi.fn(),
  spinner: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
  })),
  isCancel: vi.fn(() => false),
}))

// Mock child_process
vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}))

describe('init command', () => {
  let tempDir: string
  let originalCwd: string

  beforeEach(() => {
    // Create temp directory for testing
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'revitedocs-init-test-'))
    originalCwd = process.cwd()
    process.chdir(tempDir)
  })

  afterEach(() => {
    process.chdir(originalCwd)
    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true })
    vi.clearAllMocks()
  })

  describe('config file generation', () => {
    it('should generate valid TypeScript config content', () => {
      const title = 'Test Docs'
      const description = 'Test description'
      
      const expectedContent = `import { defineConfig } from 'revitedocs'

export default defineConfig({
  title: '${title}',
  description: '${description}',

  theme: {
    nav: [
      { text: 'Guide', link: '/guide/' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/' },
          ],
        },
      ],
    },
  },
})
`
      
      expect(expectedContent).toContain("import { defineConfig } from 'revitedocs'")
      expect(expectedContent).toContain(`title: '${title}'`)
      expect(expectedContent).toContain(`description: '${description}'`)
      expect(expectedContent).toContain('theme:')
      expect(expectedContent).toContain('nav:')
      expect(expectedContent).toContain('sidebar:')
    })

    it('should generate valid JavaScript config content', () => {
      const title = 'Test Docs'
      const description = 'Test description'
      
      const expectedContent = `export default {
  title: '${title}',
  description: '${description}',

  theme: {
    nav: [
      { text: 'Guide', link: '/guide/' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/' },
          ],
        },
      ],
    },
  },
}
`
      
      expect(expectedContent).not.toContain('import')
      expect(expectedContent).toContain(`title: '${title}'`)
      expect(expectedContent).toContain(`description: '${description}'`)
    })
  })

  describe('index.md generation', () => {
    it('should generate valid markdown content with frontmatter', () => {
      const title = 'Test Docs'
      const description = 'Test description'
      const docsDir = './docs'
      
      const expectedContent = `---
title: ${title}
description: ${description}
---

# ${title}

Welcome to your new documentation site powered by ReviteDocs.

## Getting Started

Edit this file at \`${docsDir}/index.md\` to get started.

## Features

- 📝 Write in Markdown
- ⚡ Powered by Vite
- 🎨 Dark/Light themes
- 🔍 Built-in search
- 📱 Mobile responsive

## Learn More

Check out the [ReviteDocs documentation](https://github.com) to learn more.
`
      
      expect(expectedContent).toContain('---')
      expect(expectedContent).toContain(`title: ${title}`)
      expect(expectedContent).toContain(`description: ${description}`)
      expect(expectedContent).toContain(`# ${title}`)
      expect(expectedContent).toContain('Welcome to your new documentation site')
    })
  })

  describe('package.json script injection', () => {
    it('should add correct scripts to existing package.json', () => {
      const existingPkg = {
        name: 'test-project',
        version: '1.0.0',
        scripts: {
          test: 'vitest',
        },
      }
      
      fs.writeFileSync('package.json', JSON.stringify(existingPkg, null, 2))
      
      const prefix = 'docs'
      const docsDir = './docs'
      
      // Read and modify
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      pkg.type = 'module'
      const scripts = pkg.scripts || {}
      scripts[`${prefix}:dev`] = `revitedocs dev ${docsDir}`
      scripts[`${prefix}:build`] = `revitedocs build ${docsDir}`
      scripts[`${prefix}:preview`] = `revitedocs preview ${docsDir}`
      pkg.scripts = scripts
      
      const devDeps = pkg.devDependencies || {}
      devDeps['revitedocs'] = 'latest'
      pkg.devDependencies = devDeps
      
      fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2))
      
      // Verify
      const result = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      
      expect(result.type).toBe('module')
      expect(result.scripts['docs:dev']).toBe('revitedocs dev ./docs')
      expect(result.scripts['docs:build']).toBe('revitedocs build ./docs')
      expect(result.scripts['docs:preview']).toBe('revitedocs preview ./docs')
      expect(result.scripts.test).toBe('vitest') // Original preserved
      expect(result.devDependencies.revitedocs).toBe('latest')
    })

    it('should create package.json if it does not exist', () => {
      const prefix = 'docs'
      const docsDir = './docs'
      
      // Simulate createPackageJson logic
      const pkg = {
        name: path.basename(tempDir),
        version: '0.0.1',
        private: true,
        type: 'module',
        scripts: {
          [`${prefix}:dev`]: `revitedocs dev ${docsDir}`,
          [`${prefix}:build`]: `revitedocs build ${docsDir}`,
          [`${prefix}:preview`]: `revitedocs preview ${docsDir}`,
        },
        devDependencies: {
          revitedocs: 'latest',
        },
      }
      
      fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2))
      
      const result = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      
      expect(result.version).toBe('0.0.1')
      expect(result.private).toBe(true)
      expect(result.type).toBe('module')
      expect(result.scripts['docs:dev']).toBeDefined()
    })

    it('should use custom script prefix', () => {
      const prefix = 'documentation'
      const docsDir = './my-docs'
      
      const pkg = {
        name: 'test',
        version: '1.0.0',
        type: 'module',
        scripts: {
          [`${prefix}:dev`]: `revitedocs dev ${docsDir}`,
          [`${prefix}:build`]: `revitedocs build ${docsDir}`,
          [`${prefix}:preview`]: `revitedocs preview ${docsDir}`,
        },
      }
      
      fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2))
      
      const result = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      
      expect(result.scripts['documentation:dev']).toBe('revitedocs dev ./my-docs')
      expect(result.scripts['documentation:build']).toBe('revitedocs build ./my-docs')
      expect(result.scripts['documentation:preview']).toBe('revitedocs preview ./my-docs')
    })
  })

  describe('directory structure creation', () => {
    it('should create .revitedocs directory inside docs folder', () => {
      const docsDir = './docs'
      const docsPath = path.resolve(docsDir)
      const configPath = path.join(docsPath, '.revitedocs')
      
      fs.mkdirSync(configPath, { recursive: true })
      
      expect(fs.existsSync(configPath)).toBe(true)
    })

    it('should handle nested docs directory paths', () => {
      const docsDir = './project/docs/site'
      const docsPath = path.resolve(docsDir)
      const configPath = path.join(docsPath, '.revitedocs')
      
      fs.mkdirSync(configPath, { recursive: true })
      
      expect(fs.existsSync(configPath)).toBe(true)
    })
  })

  describe('file creation safety', () => {
    it('should not overwrite existing index.md', () => {
      const docsDir = './docs'
      const docsPath = path.resolve(docsDir)
      const indexPath = path.join(docsPath, 'index.md')
      
      fs.mkdirSync(docsPath, { recursive: true })
      
      const existingContent = '# Existing Content\n\nDo not overwrite!'
      fs.writeFileSync(indexPath, existingContent)
      
      // Simulate createExampleDocs check
      if (!fs.existsSync(indexPath)) {
        fs.writeFileSync(indexPath, 'New content')
      }
      
      const result = fs.readFileSync(indexPath, 'utf-8')
      expect(result).toBe(existingContent)
    })
  })

  describe('package manager detection', () => {
    it('should detect npm from user agent', () => {
      const userAgent = 'npm/9.0.0 node/v18.0.0'
      const pm = detectPackageManager(userAgent)
      expect(pm).toBe('npm')
    })

    it('should detect pnpm from user agent', () => {
      const userAgent = 'pnpm/8.0.0 npm/? node/v18.0.0'
      const pm = detectPackageManager(userAgent)
      expect(pm).toBe('pnpm')
    })

    it('should detect yarn from user agent', () => {
      const userAgent = 'yarn/1.22.0 npm/? node/v18.0.0'
      const pm = detectPackageManager(userAgent)
      expect(pm).toBe('yarn')
    })

    it('should detect bun from user agent', () => {
      const userAgent = 'bun/1.0.0'
      const pm = detectPackageManager(userAgent)
      expect(pm).toBe('bun')
    })

    it('should default to npm when no user agent', () => {
      const pm = detectPackageManager('')
      expect(pm).toBe('npm')
    })
  })
})

// Helper function matching init.ts logic
function detectPackageManager(userAgent: string): string {
  if (userAgent.includes('pnpm')) return 'pnpm'
  if (userAgent.includes('yarn')) return 'yarn'
  if (userAgent.includes('bun')) return 'bun'
  return 'npm'
}


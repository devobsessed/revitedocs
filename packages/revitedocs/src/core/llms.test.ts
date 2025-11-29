import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  generateLlmsOverview, 
  generateLlmsFull, 
  generateLlmsTxt,
  type LlmsRoute 
} from './llms.js'
import type { ResolvedConfig } from './config.js'
import fs from 'node:fs/promises'
import path from 'node:path'

// Mock fs module
vi.mock('node:fs/promises')

describe('llms.txt generation', () => {
  const mockRoutes: LlmsRoute[] = [
    {
      path: '/',
      file: '/docs/index.md',
      frontmatter: { title: 'Introduction', description: 'Getting started guide' },
    },
    {
      path: '/guide/installation',
      file: '/docs/guide/installation.md',
      frontmatter: { title: 'Installation', description: 'How to install the package' },
    },
    {
      path: '/guide/configuration',
      file: '/docs/guide/configuration.md',
      frontmatter: { title: 'Configuration', description: 'Configuration options' },
    },
    {
      path: '/api/reference',
      file: '/docs/api/reference.md',
      frontmatter: { title: 'API Reference', description: 'Complete API documentation' },
    },
  ]

  const mockConfig: ResolvedConfig = {
    root: '/docs',
    title: 'My Documentation',
    description: 'Comprehensive docs for My Project',
    base: '/',
    theme: { nav: [], sidebar: {}, socialLinks: [] },
    llms: { enabled: true },
    search: { enabled: true },
  }

  describe('generateLlmsOverview', () => {
    it('should generate overview with title from config', () => {
      const result = generateLlmsOverview(mockConfig, mockRoutes)
      
      expect(result).toContain('# My Documentation')
    })

    it('should use custom llms title if provided', () => {
      const configWithCustomTitle = {
        ...mockConfig,
        llms: { enabled: true, title: 'Custom Title' },
      }
      const result = generateLlmsOverview(configWithCustomTitle, mockRoutes)
      
      expect(result).toContain('# Custom Title')
    })

    it('should include description in blockquote', () => {
      const result = generateLlmsOverview(mockConfig, mockRoutes)
      
      expect(result).toContain('> Comprehensive docs for My Project')
    })

    it('should use custom llms description if provided', () => {
      const configWithCustomDesc = {
        ...mockConfig,
        llms: { enabled: true, description: 'Custom description' },
      }
      const result = generateLlmsOverview(configWithCustomDesc, mockRoutes)
      
      expect(result).toContain('> Custom description')
    })

    it('should list all pages with titles and descriptions', () => {
      const result = generateLlmsOverview(mockConfig, mockRoutes)
      
      expect(result).toContain('- [Introduction](/): Getting started guide')
      expect(result).toContain('- [Installation](/guide/installation): How to install the package')
      expect(result).toContain('- [Configuration](/guide/configuration): Configuration options')
      expect(result).toContain('- [API Reference](/api/reference): Complete API documentation')
    })

    it('should fallback to path-based title if frontmatter title missing', () => {
      const routesWithoutTitles: LlmsRoute[] = [
        { path: '/guide/intro', file: '/docs/guide/intro.md', frontmatter: {} },
      ]
      const result = generateLlmsOverview(mockConfig, routesWithoutTitles)
      
      expect(result).toContain('- [Guide Intro](/guide/intro)')
    })

    it('should handle root path title conversion', () => {
      const routesWithRoot: LlmsRoute[] = [
        { path: '/', file: '/docs/index.md', frontmatter: {} },
      ]
      const result = generateLlmsOverview(mockConfig, routesWithRoot)
      
      expect(result).toContain('- [Home](/)')
    })

    it('should include Pages section header', () => {
      const result = generateLlmsOverview(mockConfig, mockRoutes)
      
      expect(result).toContain('## Pages')
    })

    it('should handle empty routes', () => {
      const result = generateLlmsOverview(mockConfig, [])
      
      expect(result).toContain('# My Documentation')
      expect(result).toContain('## Pages')
    })
  })

  describe('generateLlmsFull', () => {
    beforeEach(() => {
      vi.mocked(fs.readFile).mockImplementation(async (filePath) => {
        const pathStr = filePath.toString()
        if (pathStr.includes('index.md')) {
          return '---\ntitle: Introduction\n---\n\nWelcome to the documentation.'
        }
        if (pathStr.includes('installation.md')) {
          return '---\ntitle: Installation\n---\n\n## Install\n\nRun `npm install`'
        }
        if (pathStr.includes('configuration.md')) {
          return '---\ntitle: Configuration\n---\n\n## Config\n\nCreate config file.'
        }
        if (pathStr.includes('reference.md')) {
          return '---\ntitle: API Reference\n---\n\n## API\n\nAPI docs here.'
        }
        throw new Error(`File not found: ${pathStr}`)
      })
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should include title and description header', async () => {
      const result = await generateLlmsFull(mockConfig, mockRoutes)
      
      expect(result).toContain('# My Documentation')
      expect(result).toContain('> Comprehensive docs for My Project')
    })

    it('should concatenate all page content with separators', async () => {
      const result = await generateLlmsFull(mockConfig, mockRoutes)
      
      expect(result).toContain('---')
      expect(result).toContain('# Introduction')
      expect(result).toContain('Welcome to the documentation.')
      expect(result).toContain('# Installation')
      expect(result).toContain('Run `npm install`')
    })

    it('should strip frontmatter from content', async () => {
      const result = await generateLlmsFull(mockConfig, mockRoutes)
      
      // Should not contain raw YAML frontmatter
      expect(result).not.toMatch(/^---\ntitle:/m)
    })

    it('should use frontmatter title for section headers', async () => {
      const result = await generateLlmsFull(mockConfig, mockRoutes)
      
      expect(result).toContain('# Introduction')
      expect(result).toContain('# Installation')
      expect(result).toContain('# Configuration')
      expect(result).toContain('# API Reference')
    })

    it('should handle empty routes', async () => {
      const result = await generateLlmsFull(mockConfig, [])
      
      expect(result).toContain('# My Documentation')
      expect(result).not.toContain('---\n#') // No page sections
    })

    it('should handle file read errors gracefully', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'))
      
      const result = await generateLlmsFull(mockConfig, mockRoutes)
      
      // Should still generate header
      expect(result).toContain('# My Documentation')
    })
  })

  describe('generateLlmsTxt', () => {
    const tempDir = '/tmp/llms-test-output'

    beforeEach(() => {
      vi.mocked(fs.readFile).mockImplementation(async (filePath) => {
        const pathStr = filePath.toString()
        if (pathStr.includes('index.md')) {
          return '---\ntitle: Test\n---\n\nTest content.'
        }
        throw new Error(`File not found: ${pathStr}`)
      })
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    it('should write llms.txt to output directory', async () => {
      const routes: LlmsRoute[] = [
        { path: '/', file: '/docs/index.md', frontmatter: { title: 'Test' } },
      ]
      
      await generateLlmsTxt(mockConfig, routes, tempDir)
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(tempDir, 'llms.txt'),
        expect.stringContaining('# My Documentation')
      )
    })

    it('should write llms-full.txt to output directory', async () => {
      const routes: LlmsRoute[] = [
        { path: '/', file: '/docs/index.md', frontmatter: { title: 'Test' } },
      ]
      
      await generateLlmsTxt(mockConfig, routes, tempDir)
      
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(tempDir, 'llms-full.txt'),
        expect.stringContaining('Test content.')
      )
    })

    it('should skip generation when llms.enabled is false', async () => {
      const disabledConfig = {
        ...mockConfig,
        llms: { enabled: false },
      }
      
      await generateLlmsTxt(disabledConfig, mockRoutes, tempDir)
      
      expect(fs.writeFile).not.toHaveBeenCalled()
    })

    it('should log generation status', async () => {
      const consoleSpy = vi.spyOn(console, 'log')
      const routes: LlmsRoute[] = [
        { path: '/', file: '/docs/index.md', frontmatter: { title: 'Test' } },
      ]
      
      await generateLlmsTxt(mockConfig, routes, tempDir)
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('llms.txt'))
      consoleSpy.mockRestore()
    })
  })
})


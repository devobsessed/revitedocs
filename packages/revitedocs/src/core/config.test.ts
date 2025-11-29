import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { defineConfig, resolveConfig, loadConfig, formatConfigError } from './config.js'
import path from 'node:path'
import { ZodError } from 'zod'

// Mock Vite's loadConfigFromFile
vi.mock('vite', () => ({
  loadConfigFromFile: vi.fn(),
}))

describe('config', () => {
  describe('defineConfig', () => {
    it('returns the config unchanged', () => {
      const config = { title: 'My Docs' }
      expect(defineConfig(config)).toEqual(config)
    })
  })

  describe('resolveConfig', () => {
    it('applies defaults to empty config', () => {
      const resolved = resolveConfig('/root', {})
      
      expect(resolved.root).toBe('/root')
      expect(resolved.title).toBe('Documentation')
      expect(resolved.base).toBe('/')
      expect(resolved.theme.nav).toEqual([])
      expect(resolved.theme.sidebar).toEqual({})
      expect(resolved.llms.enabled).toBe(true)
      expect(resolved.search.enabled).toBe(true)
    })

    it('preserves user values', () => {
      const resolved = resolveConfig('/docs', {
        title: 'My Docs',
        description: 'Test description',
        base: '/docs/',
        theme: {
          logo: '/logo.svg',
          nav: [{ text: 'Guide', link: '/guide/' }],
        },
        versions: ['v2', 'v1'],
        defaultVersion: 'v2',
      })

      expect(resolved.title).toBe('My Docs')
      expect(resolved.description).toBe('Test description')
      expect(resolved.base).toBe('/docs/')
      expect(resolved.theme.logo).toBe('/logo.svg')
      expect(resolved.theme.nav).toHaveLength(1)
      expect(resolved.versions).toEqual(['v2', 'v1'])
      expect(resolved.defaultVersion).toBe('v2')
    })

    it('resolves nested sidebar items', () => {
      const resolved = resolveConfig('/root', {
        theme: {
          sidebar: {
            '/guide/': [
              {
                text: 'Getting Started',
                items: [
                  { text: 'Installation', link: '/guide/installation' },
                  { text: 'Quick Start', link: '/guide/quick-start' },
                ],
              },
            ],
          },
        },
      })

      expect(resolved.theme.sidebar['/guide/']).toHaveLength(1)
      expect(resolved.theme.sidebar['/guide/'][0].items).toHaveLength(2)
    })
  })

  describe('loadConfig', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('loads config from .revitedocs/config.ts', async () => {
      const { loadConfigFromFile } = await import('vite')
      vi.mocked(loadConfigFromFile).mockResolvedValue({
        path: '/root/.revitedocs/config.ts',
        config: { title: 'Loaded Docs' },
        dependencies: [],
      })

      const resolved = await loadConfig('/root')

      expect(loadConfigFromFile).toHaveBeenCalledWith(
        expect.objectContaining({ command: 'serve', mode: 'development' }),
        expect.stringContaining('.revitedocs/config.ts')
      )
      expect(resolved.title).toBe('Loaded Docs')
      expect(resolved.root).toBe('/root')
    })

    it('returns defaults when no config file exists', async () => {
      const { loadConfigFromFile } = await import('vite')
      vi.mocked(loadConfigFromFile).mockResolvedValue(null)

      const resolved = await loadConfig('/root')

      expect(resolved.title).toBe('Documentation')
      expect(resolved.base).toBe('/')
    })

    it('resolves root path correctly', async () => {
      const { loadConfigFromFile } = await import('vite')
      vi.mocked(loadConfigFromFile).mockResolvedValue(null)

      const resolved = await loadConfig('./relative/path')

      expect(resolved.root).toBe(path.resolve('./relative/path'))
    })
  })

  describe('formatConfigError', () => {
    it('formats Zod errors into readable messages', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['title'],
          message: 'Expected string, received number',
        },
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          path: ['theme', 'nav', 0, 'text'],
          message: 'Required',
        },
      ])

      const formatted = formatConfigError(zodError)

      expect(formatted).toContain('title')
      expect(formatted).toContain('theme.nav[0].text')
    })
  })
})


import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fileToUrlPath, generateRoutes, generateRouteModule, detectVersionFromPath, isVersionFolder, isLocaleFolder, detectLocaleFromPath } from './router.js'

// Mock fast-glob
vi.mock('fast-glob', () => ({
  default: vi.fn(),
}))

describe('router', () => {
  describe('fileToUrlPath', () => {
    it('converts simple file to URL path', () => {
      expect(fileToUrlPath('guide.md')).toBe('/guide')
      expect(fileToUrlPath('intro.mdx')).toBe('/intro')
    })

    it('handles nested paths', () => {
      expect(fileToUrlPath('guide/getting-started.md')).toBe('/guide/getting-started')
      expect(fileToUrlPath('api/reference/methods.md')).toBe('/api/reference/methods')
    })

    it('converts index files to directory paths', () => {
      expect(fileToUrlPath('index.md')).toBe('/')
      expect(fileToUrlPath('guide/index.md')).toBe('/guide/')
      expect(fileToUrlPath('api/v2/index.md')).toBe('/api/v2/')
    })

    it('handles README as index', () => {
      expect(fileToUrlPath('README.md')).toBe('/')
      expect(fileToUrlPath('guide/README.md')).toBe('/guide/')
    })

    it('preserves case in URLs', () => {
      expect(fileToUrlPath('API/Reference.md')).toBe('/API/Reference')
    })
  })

  describe('generateRoutes', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('discovers markdown files and generates routes', async () => {
      const fg = (await import('fast-glob')).default
      vi.mocked(fg).mockResolvedValue([
        'index.md',
        'guide/intro.md',
        'guide/advanced.md',
      ])

      const routes = await generateRoutes('/docs')

      expect(routes).toHaveLength(3)
      // Routes are sorted alphabetically
      expect(routes[0]).toEqual({
        path: '/',
        file: '/docs/index.md',
      })
      expect(routes[1]).toEqual({
        path: '/guide/advanced',
        file: '/docs/guide/advanced.md',
      })
      expect(routes[2]).toEqual({
        path: '/guide/intro',
        file: '/docs/guide/intro.md',
      })
    })

    it('ignores private files starting with _', async () => {
      const fg = (await import('fast-glob')).default
      vi.mocked(fg).mockResolvedValue([
        'index.md',
        '_draft.md',
        'guide/_wip.md',
      ])

      const routes = await generateRoutes('/docs')

      expect(routes).toHaveLength(1)
      expect(routes[0].path).toBe('/')
    })

    it('calls fast-glob with correct patterns', async () => {
      const fg = (await import('fast-glob')).default
      vi.mocked(fg).mockResolvedValue([])

      await generateRoutes('/my/docs')

      expect(fg).toHaveBeenCalledWith(
        ['**/*.md', '**/*.mdx'],
        expect.objectContaining({
          cwd: '/my/docs',
          ignore: expect.arrayContaining(['.revitedocs/**', 'node_modules/**', '**/_*']),
        })
      )
    })
  })

  describe('generateRouteModule', () => {
    it('generates valid JavaScript module code', () => {
      const routes = [
        { path: '/', file: '/docs/index.md' },
        { path: '/guide/intro', file: '/docs/guide/intro.md' },
      ]

      const code = generateRouteModule(routes)

      // Should contain imports
      expect(code).toContain('import')
      expect(code).toContain('/docs/index.md')
      expect(code).toContain('/docs/guide/intro.md')
      
      // Should export routes array
      expect(code).toContain('export const routes')
      
      // Should include path definitions
      expect(code).toContain("path: '/'")
      expect(code).toContain("path: '/guide/intro'")
    })

    it('exports frontmatter and toc from each route', () => {
      const routes = [
        { path: '/', file: '/docs/index.md' },
      ]

      const code = generateRouteModule(routes)

      expect(code).toContain('frontmatter')
      expect(code).toContain('toc')
    })

    it('handles empty routes array', () => {
      const code = generateRouteModule([])

      expect(code).toContain('export const routes = []')
    })
  })

  describe('isVersionFolder', () => {
    it('identifies version folders with v prefix', () => {
      expect(isVersionFolder('v1')).toBe(true)
      expect(isVersionFolder('v2')).toBe(true)
      expect(isVersionFolder('v10')).toBe(true)
      expect(isVersionFolder('v2.0')).toBe(true)
      expect(isVersionFolder('v1.2.3')).toBe(true)
    })

    it('rejects non-version folders', () => {
      expect(isVersionFolder('guide')).toBe(false)
      expect(isVersionFolder('api')).toBe(false)
      expect(isVersionFolder('vanilla')).toBe(false)
      expect(isVersionFolder('overview')).toBe(false)
    })

    it('is case-insensitive for v prefix', () => {
      expect(isVersionFolder('V1')).toBe(true)
      expect(isVersionFolder('V2')).toBe(true)
    })
  })

  describe('detectVersionFromPath', () => {
    it('extracts version from top-level version folder', () => {
      expect(detectVersionFromPath('v1/guide/intro.md')).toBe('v1')
      expect(detectVersionFromPath('v2/api/reference.md')).toBe('v2')
      expect(detectVersionFromPath('v1.0/getting-started.md')).toBe('v1.0')
    })

    it('returns null for non-versioned paths', () => {
      expect(detectVersionFromPath('guide/intro.md')).toBeNull()
      expect(detectVersionFromPath('index.md')).toBeNull()
      expect(detectVersionFromPath('api/v2/endpoint.md')).toBeNull() // v2 not at root
    })
  })

  describe('versioned routing', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('generates versioned routes with version prefix', async () => {
      const fg = (await import('fast-glob')).default
      vi.mocked(fg).mockResolvedValue([
        'v1/index.md',
        'v1/guide/intro.md',
        'v2/index.md',
        'v2/guide/intro.md',
        'v2/guide/advanced.md',
      ])

      const routes = await generateRoutes('/docs')

      // Check v1 routes
      const v1Index = routes.find(r => r.path === '/v1/')
      expect(v1Index).toBeDefined()
      expect(v1Index?.version).toBe('v1')
      
      const v1Guide = routes.find(r => r.path === '/v1/guide/intro')
      expect(v1Guide).toBeDefined()
      expect(v1Guide?.version).toBe('v1')

      // Check v2 routes
      const v2Index = routes.find(r => r.path === '/v2/')
      expect(v2Index).toBeDefined()
      expect(v2Index?.version).toBe('v2')

      const v2Advanced = routes.find(r => r.path === '/v2/guide/advanced')
      expect(v2Advanced).toBeDefined()
      expect(v2Advanced?.version).toBe('v2')
    })

    it('generates non-versioned routes without version prefix', async () => {
      const fg = (await import('fast-glob')).default
      vi.mocked(fg).mockResolvedValue([
        'index.md',
        'guide/intro.md',
      ])

      const routes = await generateRoutes('/docs')

      expect(routes.find(r => r.path === '/')?.version).toBeUndefined()
      expect(routes.find(r => r.path === '/guide/intro')?.version).toBeUndefined()
    })

    it('handles mixed versioned and non-versioned content', async () => {
      const fg = (await import('fast-glob')).default
      vi.mocked(fg).mockResolvedValue([
        'index.md',           // Root landing page (unversioned)
        'v2/index.md',        // Latest docs
        'v2/guide/intro.md',
        'v1/index.md',        // Old docs
        'v1/guide/intro.md',
      ])

      const routes = await generateRoutes('/docs')

      // Unversioned root
      const root = routes.find(r => r.path === '/')
      expect(root?.version).toBeUndefined()

      // Versioned content
      expect(routes.filter(r => r.version === 'v1')).toHaveLength(2)
      expect(routes.filter(r => r.version === 'v2')).toHaveLength(2)
    })
  })

  describe('isLocaleFolder', () => {
    it('identifies 2-letter locale codes', () => {
      expect(isLocaleFolder('en')).toBe(true)
      expect(isLocaleFolder('ja')).toBe(true)
      expect(isLocaleFolder('zh')).toBe(true)
      expect(isLocaleFolder('fr')).toBe(true)
      expect(isLocaleFolder('de')).toBe(true)
    })

    it('identifies locale codes with region', () => {
      expect(isLocaleFolder('en-US')).toBe(true)
      expect(isLocaleFolder('zh-CN')).toBe(true)
      expect(isLocaleFolder('pt-BR')).toBe(true)
    })

    it('rejects non-locale folders', () => {
      expect(isLocaleFolder('guide')).toBe(false)
      expect(isLocaleFolder('api')).toBe(false)
      expect(isLocaleFolder('v1')).toBe(false)
      expect(isLocaleFolder('v2')).toBe(false)
      expect(isLocaleFolder('docs')).toBe(false)
      expect(isLocaleFolder('english')).toBe(false)
    })

    it('rejects invalid locale formats', () => {
      expect(isLocaleFolder('e')).toBe(false)       // Too short
      expect(isLocaleFolder('eng')).toBe(false)    // Too long without region
      expect(isLocaleFolder('en-usa')).toBe(false) // Invalid region format
      expect(isLocaleFolder('EN_US')).toBe(false)  // Wrong separator
    })
  })

  describe('detectLocaleFromPath', () => {
    it('extracts locale from top-level locale folder', () => {
      expect(detectLocaleFromPath('en/guide/intro.md')).toBe('en')
      expect(detectLocaleFromPath('ja/api/reference.md')).toBe('ja')
      expect(detectLocaleFromPath('zh-CN/getting-started.md')).toBe('zh-CN')
    })

    it('returns null for non-localized paths', () => {
      expect(detectLocaleFromPath('guide/intro.md')).toBeNull()
      expect(detectLocaleFromPath('index.md')).toBeNull()
      expect(detectLocaleFromPath('api/en/endpoint.md')).toBeNull() // en not at root
    })

    it('returns null for version folders', () => {
      expect(detectLocaleFromPath('v1/guide/intro.md')).toBeNull()
      expect(detectLocaleFromPath('v2/index.md')).toBeNull()
    })
  })

  describe('localized routing', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('generates localized routes with locale metadata', async () => {
      const fg = (await import('fast-glob')).default
      vi.mocked(fg).mockResolvedValue([
        'en/index.md',
        'en/guide/intro.md',
        'ja/index.md',
        'ja/guide/intro.md',
      ])

      const routes = await generateRoutes('/docs')

      // Check en routes
      const enIndex = routes.find(r => r.path === '/en/')
      expect(enIndex).toBeDefined()
      expect(enIndex?.locale).toBe('en')
      
      const enGuide = routes.find(r => r.path === '/en/guide/intro')
      expect(enGuide).toBeDefined()
      expect(enGuide?.locale).toBe('en')

      // Check ja routes
      const jaIndex = routes.find(r => r.path === '/ja/')
      expect(jaIndex).toBeDefined()
      expect(jaIndex?.locale).toBe('ja')
    })

    it('handles mixed localized and non-localized content', async () => {
      const fg = (await import('fast-glob')).default
      vi.mocked(fg).mockResolvedValue([
        'index.md',           // Root landing page (unlocalized)
        'en/index.md',
        'en/guide/intro.md',
        'ja/index.md',
      ])

      const routes = await generateRoutes('/docs')

      // Unlocalized root
      const root = routes.find(r => r.path === '/')
      expect(root?.locale).toBeUndefined()

      // Localized content
      expect(routes.filter(r => r.locale === 'en')).toHaveLength(2)
      expect(routes.filter(r => r.locale === 'ja')).toHaveLength(1)
    })
  })
})


import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { BuildOptions } from './build.js'

const mockConfig = {
  root: '/test/root',
  title: 'Test Docs',
  base: '/',
  theme: { nav: [], sidebar: {}, socialLinks: [] },
  llms: { enabled: false },
  search: { enabled: true },
}

// Mock vite module
vi.mock('vite', () => ({
  build: vi.fn().mockResolvedValue({}),
  loadConfigFromFile: vi.fn().mockResolvedValue({ config: {} }),
}))

// Mock pagefind module
vi.mock('./pagefind.js', () => ({
  runPagefind: vi.fn().mockResolvedValue(true),
}))

// Mock ssg module
vi.mock('./ssg.js', () => ({
  buildSSG: vi.fn().mockResolvedValue(undefined),
  generateSitemap: vi.fn().mockResolvedValue(undefined),
}))

// Mock config module
vi.mock('../../core/config.js', () => ({
  loadConfig: vi.fn().mockResolvedValue(mockConfig),
}))

// Mock llms module
vi.mock('../../core/llms.js', () => ({
  generateLlmsTxt: vi.fn().mockResolvedValue(undefined),
}))

// Mock fast-glob
vi.mock('fast-glob', () => ({
  default: vi.fn().mockResolvedValue([]),
}))

describe('build command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('build function', () => {
    it('calls SSG build by default', async () => {
      const { loadConfig } = await import('../../core/config.js')
      const { buildSSG } = await import('./ssg.js')
      vi.mocked(loadConfig).mockResolvedValue({ ...mockConfig })

      const { build } = await import('./build.js')
      const options: BuildOptions = { skipSearch: true, skipSitemap: true }

      await build('/test/root', options)

      expect(buildSSG).toHaveBeenCalledWith(
        '/test/root',
        expect.objectContaining({ title: 'Test Docs' }),
        expect.objectContaining({ outDir: 'dist', base: '/' })
      )
    })

    it('falls back to vite build when skipSSG is true', async () => {
      const { build: viteBuild } = await import('vite')
      const { loadConfig } = await import('../../core/config.js')
      vi.mocked(loadConfig).mockResolvedValue({ ...mockConfig })

      const { build } = await import('./build.js')

      await build('/test/root', { skipSSG: true, skipSearch: true, skipSitemap: true })

      expect(viteBuild).toHaveBeenCalledWith(
        expect.objectContaining({
          root: '/test/root',
          build: expect.objectContaining({
            ssrManifest: true,
          }),
        })
      )
    })

    it('respects outDir option for SSG', async () => {
      const { loadConfig } = await import('../../core/config.js')
      const { buildSSG } = await import('./ssg.js')
      vi.mocked(loadConfig).mockResolvedValue({ ...mockConfig })

      const { build } = await import('./build.js')

      await build('/root', { outDir: 'custom-dist', skipSearch: true, skipSitemap: true })

      expect(buildSSG).toHaveBeenCalledWith(
        '/root',
        expect.anything(),
        expect.objectContaining({ outDir: 'custom-dist' })
      )
    })

    it('respects base option for SSG', async () => {
      const { loadConfig } = await import('../../core/config.js')
      const { buildSSG } = await import('./ssg.js')
      vi.mocked(loadConfig).mockResolvedValue({ ...mockConfig })

      const { build } = await import('./build.js')

      await build('/root', { base: '/docs/', skipSearch: true, skipSitemap: true })

      expect(buildSSG).toHaveBeenCalledWith(
        '/root',
        expect.anything(),
        expect.objectContaining({ base: '/docs/' })
      )
    })

    it('generates sitemap by default', async () => {
      const { loadConfig } = await import('../../core/config.js')
      const { generateSitemap } = await import('./ssg.js')
      vi.mocked(loadConfig).mockResolvedValue({ ...mockConfig })

      const { build } = await import('./build.js')

      await build('/test/root', { skipSearch: true })

      expect(generateSitemap).toHaveBeenCalledWith(
        '/test/root',
        expect.anything(),
        'dist',
        undefined
      )
    })

    it('skips sitemap when skipSitemap is true', async () => {
      const { loadConfig } = await import('../../core/config.js')
      const { generateSitemap } = await import('./ssg.js')
      vi.mocked(loadConfig).mockResolvedValue({ ...mockConfig })

      const { build } = await import('./build.js')

      await build('/test/root', { skipSearch: true, skipSitemap: true })

      expect(generateSitemap).not.toHaveBeenCalled()
    })

    it('runs Pagefind after build by default', async () => {
      const { loadConfig } = await import('../../core/config.js')
      const { runPagefind } = await import('./pagefind.js')
      vi.mocked(loadConfig).mockResolvedValue({ ...mockConfig })

      const { build } = await import('./build.js')

      await build('/test/root', { skipSitemap: true })

      expect(runPagefind).toHaveBeenCalledWith({
        site: '/test/root/dist',
      })
    })

    it('skips Pagefind when skipSearch is true', async () => {
      const { loadConfig } = await import('../../core/config.js')
      const { runPagefind } = await import('./pagefind.js')
      vi.mocked(loadConfig).mockResolvedValue({ ...mockConfig })

      const { build } = await import('./build.js')

      await build('/test/root', { skipSearch: true, skipSitemap: true })

      expect(runPagefind).not.toHaveBeenCalled()
    })

    it('uses correct outDir for Pagefind', async () => {
      const { loadConfig } = await import('../../core/config.js')
      const { runPagefind } = await import('./pagefind.js')
      vi.mocked(loadConfig).mockResolvedValue({ ...mockConfig })

      const { build } = await import('./build.js')

      await build('/test/root', { outDir: 'public', skipSitemap: true })

      expect(runPagefind).toHaveBeenCalledWith({
        site: '/test/root/public',
      })
    })

    it('generates llms.txt when enabled in config', async () => {
      const { loadConfig } = await import('../../core/config.js')
      const { generateLlmsTxt } = await import('../../core/llms.js')
      const fg = await import('fast-glob')
      
      vi.mocked(loadConfig).mockResolvedValue({
        ...mockConfig,
        llms: { enabled: true },
      })
      vi.mocked(fg.default).mockResolvedValue([])

      const { build } = await import('./build.js')

      await build('/test/root', { skipSearch: true, skipSitemap: true })

      expect(generateLlmsTxt).toHaveBeenCalled()
    })

    it('skips llms.txt when disabled in config', async () => {
      const { loadConfig } = await import('../../core/config.js')
      const { generateLlmsTxt } = await import('../../core/llms.js')
      vi.mocked(loadConfig).mockResolvedValue({
        ...mockConfig,
        llms: { enabled: false },
      })

      const { build } = await import('./build.js')

      await build('/test/root', { skipSearch: true, skipSitemap: true })

      expect(generateLlmsTxt).not.toHaveBeenCalled()
    })

    it('skips llms.txt when skipLlms option is true', async () => {
      const { loadConfig } = await import('../../core/config.js')
      const { generateLlmsTxt } = await import('../../core/llms.js')
      vi.mocked(loadConfig).mockResolvedValue({
        ...mockConfig,
        llms: { enabled: true },
      })

      const { build } = await import('./build.js')

      await build('/test/root', { skipSearch: true, skipLlms: true, skipSitemap: true })

      expect(generateLlmsTxt).not.toHaveBeenCalled()
    })
  })
})

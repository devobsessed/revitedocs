import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revitedocsSlotsPlugin, resolveThemeSlot, SLOT_COMPONENTS } from './vite-plugin-slots.js'
import type { ResolvedConfig } from './config.js'
import fs from 'node:fs'

// Mock fs module
vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
  },
  existsSync: vi.fn(),
}))

describe('vite-plugin-slots', () => {
  const mockConfig: ResolvedConfig = {
    root: '/test/docs',
    title: 'Test Docs',
    description: 'Test description',
    base: '/',
    theme: {
      logo: '/logo.svg',
      nav: [],
      sidebar: {},
      socialLinks: [],
    },
    llms: { enabled: true },
    search: { enabled: true },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('SLOT_COMPONENTS', () => {
    it('defines all expected slot components', () => {
      expect(SLOT_COMPONENTS).toContain('Header')
      expect(SLOT_COMPONENTS).toContain('Footer')
      expect(SLOT_COMPONENTS).toContain('Sidebar')
      expect(SLOT_COMPONENTS).toContain('Layout')
      expect(SLOT_COMPONENTS).toContain('NotFound')
    })
  })

  describe('revitedocsSlotsPlugin', () => {
    it('has correct plugin name', () => {
      const plugin = revitedocsSlotsPlugin(mockConfig)
      expect(plugin.name).toBe('revitedocs:theme-slots')
    })

    describe('resolveId', () => {
      it('resolves virtual:revitedocs/theme/Header', () => {
        const plugin = revitedocsSlotsPlugin(mockConfig)
        const resolveId = plugin.resolveId as (id: string) => string | undefined

        expect(resolveId('virtual:revitedocs/theme/Header')).toBe(
          '\0virtual:revitedocs/theme/Header'
        )
      })

      it('resolves all slot components', () => {
        const plugin = revitedocsSlotsPlugin(mockConfig)
        const resolveId = plugin.resolveId as (id: string) => string | undefined

        for (const component of SLOT_COMPONENTS) {
          const resolved = resolveId(`virtual:revitedocs/theme/${component}`)
          expect(resolved).toBe(`\0virtual:revitedocs/theme/${component}`)
        }
      })

      it('ignores non-slot virtual modules', () => {
        const plugin = revitedocsSlotsPlugin(mockConfig)
        const resolveId = plugin.resolveId as (id: string) => string | undefined

        expect(resolveId('virtual:revitedocs/config')).toBeUndefined()
        expect(resolveId('virtual:revitedocs/routes')).toBeUndefined()
        expect(resolveId('some-other-module')).toBeUndefined()
      })

      it('ignores invalid slot component names', () => {
        const plugin = revitedocsSlotsPlugin(mockConfig)
        const resolveId = plugin.resolveId as (id: string) => string | undefined

        expect(resolveId('virtual:revitedocs/theme/InvalidComponent')).toBeUndefined()
        expect(resolveId('virtual:revitedocs/theme/SomethingElse')).toBeUndefined()
      })
    })

    describe('load', () => {
      it('returns custom component when user file exists', async () => {
        const mockExistsSync = vi.mocked(fs.existsSync)
        mockExistsSync.mockReturnValue(true)

        const plugin = revitedocsSlotsPlugin(mockConfig)
        const load = plugin.load as (id: string) => Promise<string | undefined>

        const result = await load('\0virtual:revitedocs/theme/Header')

        expect(result).toContain("export { default } from")
        expect(result).toContain('.revitedocs/theme/Header.tsx')
      })

      it('returns default component when user file does not exist', async () => {
        const mockExistsSync = vi.mocked(fs.existsSync)
        mockExistsSync.mockReturnValue(false)

        const plugin = revitedocsSlotsPlugin(mockConfig)
        const load = plugin.load as (id: string) => Promise<string | undefined>

        const result = await load('\0virtual:revitedocs/theme/Header')

        expect(result).toContain("export { Header as default } from 'revitedocs/components'")
      })

      it('resolves Footer slot correctly', async () => {
        const mockExistsSync = vi.mocked(fs.existsSync)
        mockExistsSync.mockReturnValue(false)

        const plugin = revitedocsSlotsPlugin(mockConfig)
        const load = plugin.load as (id: string) => Promise<string | undefined>

        const result = await load('\0virtual:revitedocs/theme/Footer')

        // Footer doesn't exist in default components, so should export empty
        expect(result).toContain('export default')
      })

      it('ignores non-slot module IDs', async () => {
        const plugin = revitedocsSlotsPlugin(mockConfig)
        const load = plugin.load as (id: string) => Promise<string | undefined>

        const result = await load('some-other-module')
        expect(result).toBeUndefined()
      })
    })
  })

  describe('resolveThemeSlot', () => {
    it('returns custom path when file exists', () => {
      const mockExistsSync = vi.mocked(fs.existsSync)
      mockExistsSync.mockReturnValue(true)

      const result = resolveThemeSlot('Header', '/test/docs')

      expect(result.isCustom).toBe(true)
      expect(result.path).toContain('.revitedocs/theme/Header.tsx')
    })

    it('returns default path when file does not exist', () => {
      const mockExistsSync = vi.mocked(fs.existsSync)
      mockExistsSync.mockReturnValue(false)

      const result = resolveThemeSlot('Header', '/test/docs')

      expect(result.isCustom).toBe(false)
      expect(result.defaultExport).toBe('Header')
    })

    it('checks both .tsx and .jsx extensions', () => {
      const mockExistsSync = vi.mocked(fs.existsSync)
      mockExistsSync.mockImplementation((filePath) => {
        return (filePath as string).endsWith('.jsx')
      })

      const result = resolveThemeSlot('Header', '/test/docs')

      expect(result.isCustom).toBe(true)
      expect(result.path).toContain('.jsx')
    })

    it('returns correct module for each slot type', () => {
      const mockExistsSync = vi.mocked(fs.existsSync)
      mockExistsSync.mockReturnValue(false)

      const headerSlot = resolveThemeSlot('Header', '/test/docs')
      expect(headerSlot.defaultExport).toBe('Header')

      const sidebarSlot = resolveThemeSlot('Sidebar', '/test/docs')
      expect(sidebarSlot.defaultExport).toBe('Sidebar')

      const layoutSlot = resolveThemeSlot('Layout', '/test/docs')
      expect(layoutSlot.defaultExport).toBe('Layout')
    })
  })
})


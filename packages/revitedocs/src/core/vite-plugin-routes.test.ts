import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revitedocsRoutesPlugin } from './vite-plugin-routes.js'

// Mock the router module
vi.mock('./router.js', () => ({
  generateRoutes: vi.fn(),
}))

describe('vite-plugin-routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('revitedocsRoutesPlugin', () => {
    it('has correct plugin name', () => {
      const plugin = revitedocsRoutesPlugin('/docs')
      expect(plugin.name).toBe('revitedocs:routes')
    })

    describe('resolveId', () => {
      it('resolves virtual:revitedocs/routes', () => {
        const plugin = revitedocsRoutesPlugin('/docs')
        const resolveId = plugin.resolveId as (id: string) => string | undefined

        expect(resolveId('virtual:revitedocs/routes')).toBe('\0virtual:revitedocs/routes')
      })

      it('ignores other module IDs', () => {
        const plugin = revitedocsRoutesPlugin('/docs')
        const resolveId = plugin.resolveId as (id: string) => string | undefined

        expect(resolveId('some-other-module')).toBeUndefined()
      })
    })

    describe('load', () => {
      it('generates route module code', async () => {
        const { generateRoutes } = await import('./router.js')
        // Mock empty routes for simplicity (no file reads needed)
        vi.mocked(generateRoutes).mockResolvedValue([])

        const plugin = revitedocsRoutesPlugin('/docs')
        const load = plugin.load as (id: string) => Promise<string | undefined>

        const result = await load('\0virtual:revitedocs/routes')

        expect(generateRoutes).toHaveBeenCalledWith('/docs')
        // Plugin generates route module internally using generateRouteModuleWithMeta
        expect(result).toBe('export const routes = [];')
      })

      it('ignores other module IDs', async () => {
        const plugin = revitedocsRoutesPlugin('/docs')
        const load = plugin.load as (id: string) => Promise<string | undefined>

        const result = await load('some-other-module')

        expect(result).toBeUndefined()
      })
    })
  })
})

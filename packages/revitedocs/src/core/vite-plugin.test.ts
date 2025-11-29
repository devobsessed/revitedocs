import { describe, it, expect } from 'vitest'
import { revitedocsConfigPlugin } from './vite-plugin.js'
import type { ResolvedConfig } from './config.js'

describe('vite-plugin', () => {
  const mockConfig: ResolvedConfig = {
    root: '/test/root',
    title: 'Test Docs',
    description: 'Test description',
    base: '/docs/',
    theme: {
      logo: '/logo.svg',
      nav: [{ text: 'Guide', link: '/guide/' }],
      sidebar: {},
      socialLinks: [],
    },
    llms: { enabled: true },
    search: { enabled: true },
  }

  describe('revitedocsConfigPlugin', () => {
    it('has correct plugin name', () => {
      const plugin = revitedocsConfigPlugin(mockConfig)
      expect(plugin.name).toBe('revitedocs:config')
    })

    describe('resolveId', () => {
      it('resolves virtual:revitedocs/config', () => {
        const plugin = revitedocsConfigPlugin(mockConfig)
        const resolveId = plugin.resolveId as (id: string) => string | undefined
        
        expect(resolveId('virtual:revitedocs/config')).toBe('\0virtual:revitedocs/config')
      })

      it('ignores other module IDs', () => {
        const plugin = revitedocsConfigPlugin(mockConfig)
        const resolveId = plugin.resolveId as (id: string) => string | undefined
        
        expect(resolveId('some-other-module')).toBeUndefined()
        expect(resolveId('virtual:other')).toBeUndefined()
      })
    })

    describe('load', () => {
      it('returns config as JSON module', () => {
        const plugin = revitedocsConfigPlugin(mockConfig)
        const load = plugin.load as (id: string) => string | undefined
        
        const result = load('\0virtual:revitedocs/config')
        
        expect(result).toContain('export default')
        expect(result).toContain('"title": "Test Docs"')
        expect(result).toContain('"description": "Test description"')
        expect(result).toContain('"base": "/docs/"')
      })

      it('excludes root from client config', () => {
        const plugin = revitedocsConfigPlugin(mockConfig)
        const load = plugin.load as (id: string) => string | undefined
        
        const result = load('\0virtual:revitedocs/config')
        
        expect(result).not.toContain('/test/root')
        expect(result).not.toContain('"root"')
      })

      it('ignores other module IDs', () => {
        const plugin = revitedocsConfigPlugin(mockConfig)
        const load = plugin.load as (id: string) => string | undefined
        
        expect(load('some-other-module')).toBeUndefined()
      })
    })
  })
})


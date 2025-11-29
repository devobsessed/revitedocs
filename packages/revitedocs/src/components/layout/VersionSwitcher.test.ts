import { describe, it, expect } from 'vitest'
import { stripVersionFromPath, addVersionToPath } from './VersionSwitcher.js'

describe('VersionSwitcher utilities', () => {
  describe('stripVersionFromPath', () => {
    it('removes version prefix from path', () => {
      expect(stripVersionFromPath('/v2/guide/intro', 'v2')).toBe('/guide/intro')
      expect(stripVersionFromPath('/v1/api/reference', 'v1')).toBe('/api/reference')
    })

    it('handles version index path', () => {
      expect(stripVersionFromPath('/v2/', 'v2')).toBe('/')
      expect(stripVersionFromPath('/v1/', 'v1')).toBe('/')
    })

    it('returns original path if version not found', () => {
      expect(stripVersionFromPath('/guide/intro', 'v2')).toBe('/guide/intro')
      expect(stripVersionFromPath('/', 'v1')).toBe('/')
    })

    it('handles paths without trailing content', () => {
      expect(stripVersionFromPath('/v2', 'v2')).toBe('/')
    })
  })

  describe('addVersionToPath', () => {
    it('adds version prefix to path', () => {
      expect(addVersionToPath('/guide/intro', 'v2')).toBe('/v2/guide/intro')
      expect(addVersionToPath('/api/reference', 'v1')).toBe('/v1/api/reference')
    })

    it('handles root path', () => {
      expect(addVersionToPath('/', 'v2')).toBe('/v2/')
      expect(addVersionToPath('/', 'v1')).toBe('/v1/')
    })

    it('handles paths with trailing slashes', () => {
      expect(addVersionToPath('/guide/', 'v2')).toBe('/v2/guide/')
    })
  })

  describe('version switching paths', () => {
    it('switches between versions on same page', () => {
      // User on /v2/guide/intro wants to switch to v1
      const currentPath = '/v2/guide/intro'
      const currentVersion = 'v2'
      const targetVersion = 'v1'

      const basePath = stripVersionFromPath(currentPath, currentVersion)
      const targetPath = addVersionToPath(basePath, targetVersion)

      expect(targetPath).toBe('/v1/guide/intro')
    })

    it('switches from v1 to v2', () => {
      const currentPath = '/v1/api/methods'
      const currentVersion = 'v1'
      const targetVersion = 'v2'

      const basePath = stripVersionFromPath(currentPath, currentVersion)
      const targetPath = addVersionToPath(basePath, targetVersion)

      expect(targetPath).toBe('/v2/api/methods')
    })

    it('handles root version index', () => {
      const currentPath = '/v2/'
      const currentVersion = 'v2'
      const targetVersion = 'v1'

      const basePath = stripVersionFromPath(currentPath, currentVersion)
      const targetPath = addVersionToPath(basePath, targetVersion)

      expect(targetPath).toBe('/v1/')
    })
  })
})

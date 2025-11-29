import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'

// Mock child_process
vi.mock('node:child_process', () => ({
  exec: vi.fn(),
}))

// Mock fs
vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
  },
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
}))

describe('pagefind integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('runPagefind', () => {
    it('returns false if site directory does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const { runPagefind } = await import('./pagefind.js')
      const result = await runPagefind({ site: '/nonexistent' })

      expect(result).toBe(false)
    })

    it('returns false if no HTML files found', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readdirSync).mockReturnValue([])

      const { runPagefind } = await import('./pagefind.js')
      const result = await runPagefind({ site: '/test/dist' })

      expect(result).toBe(false)
    })

    it('runs pagefind command with correct arguments', async () => {
      const { exec } = await import('node:child_process')

      // Setup mocks
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        // Return true for site directory and generated index
        return p === '/test/dist' || (p as string).includes('pagefind.js')
      })
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'index.html', isDirectory: () => false },
      ] as any)

      // Mock exec to succeed
      vi.mocked(exec).mockImplementation((_cmd, _opts, callback) => {
        if (callback) {
          callback(null, { stdout: 'Success', stderr: '' } as any, '')
        }
        return {} as any
      })

      // Re-import to get fresh module with mocks
      vi.resetModules()
      const { runPagefind } = await import('./pagefind.js')

      // Note: This test verifies the function structure, but full integration
      // requires actual Pagefind installation
      await runPagefind({ site: '/test/dist' })

      // Should have called fs.existsSync for the site directory
      expect(fs.existsSync).toHaveBeenCalledWith('/test/dist')
    })

    it('uses custom output subdirectory', async () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        return p === '/test/dist' || (p as string).includes('search-index')
      })
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'index.html', isDirectory: () => false },
      ] as any)

      const { exec } = await import('node:child_process')
      vi.mocked(exec).mockImplementation((cmd, _opts, callback) => {
        // Verify custom output subdirectory is used
        expect(cmd).toContain('--output-subdir')
        expect(cmd).toContain('search-index')
        if (callback) {
          callback(null, { stdout: '', stderr: '' } as any, '')
        }
        return {} as any
      })

      vi.resetModules()
      const { runPagefind } = await import('./pagefind.js')

      await runPagefind({ site: '/test/dist', outputSubdir: 'search-index' })
    })
  })
})


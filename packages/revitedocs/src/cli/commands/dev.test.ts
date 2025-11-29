import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { DevOptions } from './dev.js'

// Mock vite module
vi.mock('vite', () => ({
  createServer: vi.fn(),
  loadConfigFromFile: vi.fn().mockResolvedValue(null),
}))

// Mock fs module
vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(true),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn().mockReturnValue(''),
  },
  existsSync: vi.fn().mockReturnValue(true),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn().mockReturnValue(''),
}))

describe('dev command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('dev function', () => {
    it('creates a Vite dev server with SSR config', async () => {
      const { createServer } = await import('vite')
      const mockServer = {
        listen: vi.fn().mockResolvedValue(undefined),
        printUrls: vi.fn(),
      }
      vi.mocked(createServer).mockResolvedValue(mockServer as any)

      const { dev } = await import('./dev.js')
      const options: DevOptions = { port: 3000 }

      await dev('/test/root', options)

      expect(createServer).toHaveBeenCalledWith(
        expect.objectContaining({
          root: '/test/root',
          server: expect.objectContaining({
            port: 3000,
          }),
        })
      )
      expect(mockServer.listen).toHaveBeenCalled()
      expect(mockServer.printUrls).toHaveBeenCalled()
    })

    it('respects port option', async () => {
      const { createServer } = await import('vite')
      const mockServer = {
        listen: vi.fn().mockResolvedValue(undefined),
        printUrls: vi.fn(),
      }
      vi.mocked(createServer).mockResolvedValue(mockServer as any)

      const { dev } = await import('./dev.js')

      await dev('/root', { port: 5000 })

      expect(createServer).toHaveBeenCalledWith(
        expect.objectContaining({
          server: expect.objectContaining({
            port: 5000,
          }),
        })
      )
    })

    it('respects open option', async () => {
      const { createServer } = await import('vite')
      const mockServer = {
        listen: vi.fn().mockResolvedValue(undefined),
        printUrls: vi.fn(),
      }
      vi.mocked(createServer).mockResolvedValue(mockServer as any)

      const { dev } = await import('./dev.js')

      await dev('/root', { port: 3000, open: true })

      expect(createServer).toHaveBeenCalledWith(
        expect.objectContaining({
          server: expect.objectContaining({
            open: true,
          }),
        })
      )
    })

    it('respects host option', async () => {
      const { createServer } = await import('vite')
      const mockServer = {
        listen: vi.fn().mockResolvedValue(undefined),
        printUrls: vi.fn(),
      }
      vi.mocked(createServer).mockResolvedValue(mockServer as any)

      const { dev } = await import('./dev.js')

      await dev('/root', { port: 3000, host: true })

      expect(createServer).toHaveBeenCalledWith(
        expect.objectContaining({
          server: expect.objectContaining({
            host: true,
          }),
        })
      )
    })
  })
})


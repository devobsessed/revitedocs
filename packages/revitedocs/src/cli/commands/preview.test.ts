import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { PreviewOptions } from './preview.js'

// Mock vite module
vi.mock('vite', () => ({
  preview: vi.fn(),
}))

describe('preview command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('preview function', () => {
    it('starts Vite preview server', async () => {
      const { preview: vitePreview } = await import('vite')
      const mockServer = {
        printUrls: vi.fn(),
      }
      vi.mocked(vitePreview).mockResolvedValue(mockServer as any)

      const { preview } = await import('./preview.js')
      const options: PreviewOptions = { port: 4173 }

      await preview('/test/root', options)

      expect(vitePreview).toHaveBeenCalledWith(
        expect.objectContaining({
          root: '/test/root',
          preview: expect.objectContaining({
            port: 4173,
          }),
        })
      )
      expect(mockServer.printUrls).toHaveBeenCalled()
    })

    it('respects port option', async () => {
      const { preview: vitePreview } = await import('vite')
      const mockServer = {
        printUrls: vi.fn(),
      }
      vi.mocked(vitePreview).mockResolvedValue(mockServer as any)

      const { preview } = await import('./preview.js')

      await preview('/root', { port: 8080 })

      expect(vitePreview).toHaveBeenCalledWith(
        expect.objectContaining({
          preview: expect.objectContaining({
            port: 8080,
          }),
        })
      )
    })
  })
})


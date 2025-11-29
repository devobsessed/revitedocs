import { describe, it, expect } from 'vitest'
import { revitedocsMarkdownPlugin } from './vite-plugin-markdown.js'

describe('vite-plugin-markdown', () => {
  describe('revitedocsMarkdownPlugin', () => {
    const plugin = revitedocsMarkdownPlugin()

    it('has correct plugin name', () => {
      expect(plugin.name).toBe('revitedocs:markdown')
    })

    describe('transform', () => {
      const transform = plugin.transform as (code: string, id: string) => Promise<{ code: string; map: null } | undefined>

      it('transforms .md files', async () => {
        const code = `---
title: Test Page
---

# Hello World

This is **bold** text.`

        const result = await transform(code, '/docs/test.md')

        expect(result).toBeDefined()
        expect(result?.code).toContain('export const frontmatter')
        expect(result?.code).toContain('export const toc')
        expect(result?.code).toContain('export default function')
        expect(result?.code).toContain('"title":"Test Page"')
      })

      it('ignores non-markdown files', async () => {
        const result = await transform('const x = 1', '/src/app.ts')

        expect(result).toBeUndefined()
      })

      it('transforms .mdx files', async () => {
        const code = `# MDX Content

Some text`

        const result = await transform(code, '/docs/test.mdx')

        expect(result).toBeDefined()
        expect(result?.code).toContain('export const frontmatter')
      })

      it('generates React component using MDX compilation', async () => {
        const code = '# Hello'

        const result = await transform(code, '/docs/test.md')

        // MDX compilation generates JSX function components
        expect(result?.code).toContain('MDXContent')
        expect(result?.code).toContain('MarkdownContent')
        // The default export is MarkdownContent which wraps MDX
        expect(result?.code).toContain('export default function MarkdownContent')
      })

      it('exports toc array', async () => {
        const code = `# One
## Two
### Three`

        const result = await transform(code, '/docs/test.md')

        expect(result?.code).toContain('"text":"One"')
        expect(result?.code).toContain('"text":"Two"')
        expect(result?.code).toContain('"text":"Three"')
      })
    })
  })
})


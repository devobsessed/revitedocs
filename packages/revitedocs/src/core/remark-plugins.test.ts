import { describe, it, expect } from 'vitest'
import { getDocComponentImports, isMermaidCodeBlock, transformMermaidToJsx } from './remark-plugins.js'

describe('remark-plugins', () => {
  describe('getDocComponentImports', () => {
    it('detects Callout component usage', () => {
      const html = '<div><Callout variant="info">Test</Callout></div>'
      const imports = getDocComponentImports(html)
      expect(imports).toContain('Callout')
    })

    it('detects TabGroup component usage', () => {
      const html = '<TabGroup labels={["a", "b"]}><div>Tab 1</div><div>Tab 2</div></TabGroup>'
      const imports = getDocComponentImports(html)
      expect(imports).toContain('TabGroup')
    })

    it('detects Steps and Step component usage', () => {
      const html = '<Steps><Step number={1}>First</Step><Step number={2}>Second</Step></Steps>'
      const imports = getDocComponentImports(html)
      expect(imports).toContain('Steps')
      expect(imports).toContain('Step')
    })

    it('detects FileTree component usage', () => {
      const html = '<FileTree items={["docs/", "README.md"]} />'
      const imports = getDocComponentImports(html)
      expect(imports).toContain('FileTree')
    })

    it('returns empty array for plain HTML', () => {
      const html = '<div><h1>Hello</h1><p>World</p></div>'
      const imports = getDocComponentImports(html)
      expect(imports).toHaveLength(0)
    })

    it('detects multiple components', () => {
      const html = `
        <Callout variant="info">Note</Callout>
        <FileTree items={["a"]} />
        <TabGroup labels={["x"]}><div>y</div></TabGroup>
      `
      const imports = getDocComponentImports(html)
      expect(imports).toContain('Callout')
      expect(imports).toContain('FileTree')
      expect(imports).toContain('TabGroup')
    })

    it('detects MermaidDiagram component usage', () => {
      const html = '<MermaidDiagram chart={`graph TD; A-->B`} />'
      const imports = getDocComponentImports(html)
      expect(imports).toContain('MermaidDiagram')
    })
  })

  describe('isMermaidCodeBlock', () => {
    it('returns true for mermaid language', () => {
      expect(isMermaidCodeBlock('mermaid')).toBe(true)
    })

    it('returns true for mmd language', () => {
      expect(isMermaidCodeBlock('mmd')).toBe(true)
    })

    it('returns false for other languages', () => {
      expect(isMermaidCodeBlock('javascript')).toBe(false)
      expect(isMermaidCodeBlock('typescript')).toBe(false)
      expect(isMermaidCodeBlock('')).toBe(false)
    })
  })

  describe('transformMermaidToJsx', () => {
    it('transforms mermaid code to JSX', () => {
      const code = 'graph TD\n  A-->B'
      const jsx = transformMermaidToJsx(code)
      expect(jsx).toContain('<MermaidDiagram')
      expect(jsx).toContain('chart={`')
      expect(jsx).toContain('graph TD')
    })

    it('escapes backticks in chart code', () => {
      const code = 'graph TD\n  A["`text`"]-->B'
      const jsx = transformMermaidToJsx(code)
      expect(jsx).toContain('\\`text\\`')
    })

    it('escapes dollar signs in chart code', () => {
      const code = 'graph TD\n  A[$100]-->B'
      const jsx = transformMermaidToJsx(code)
      expect(jsx).toContain('\\$100')
    })
  })
})


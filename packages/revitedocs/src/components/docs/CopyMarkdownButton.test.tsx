import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createElement } from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CopyMarkdownButton } from './CopyMarkdownButton.js'

// Mock clipboard API
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
}

Object.assign(navigator, {
  clipboard: mockClipboard,
})

describe('CopyMarkdownButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders with default label', () => {
    render(createElement(CopyMarkdownButton, { markdown: '# Test' }))
    
    expect(screen.getByText('Copy Markdown')).toBeTruthy()
  })

  it('renders with custom label', () => {
    render(createElement(CopyMarkdownButton, { markdown: '# Test', label: 'Copy Content' }))
    
    expect(screen.getByText('Copy Content')).toBeTruthy()
  })

  it('copies markdown to clipboard on click', async () => {
    const markdown = '# Hello World\n\nThis is test content.'
    render(createElement(CopyMarkdownButton, { markdown }))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockClipboard.writeText).toHaveBeenCalledWith(markdown)
  })

  it('shows "Copied!" feedback after clicking', async () => {
    render(createElement(CopyMarkdownButton, { markdown: '# Test' }))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeTruthy()
    })
  })

  it('renders icon only in compact mode', () => {
    render(createElement(CopyMarkdownButton, { markdown: '# Test', compact: true }))
    
    // Should not show label text
    expect(screen.queryByText('Copy Markdown')).toBeNull()
    // But button should still exist
    expect(screen.getByRole('button')).toBeTruthy()
  })

  it('has correct aria-label', () => {
    render(createElement(CopyMarkdownButton, { markdown: '# Test', label: 'Copy Content' }))
    
    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-label')).toBe('Copy Content')
  })

  it('applies custom className', () => {
    render(createElement(CopyMarkdownButton, { markdown: '# Test', className: 'custom-class' }))
    
    const button = screen.getByRole('button')
    expect(button.className).toContain('custom-class')
  })

  it('handles clipboard errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockClipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'))
    
    render(createElement(CopyMarkdownButton, { markdown: '# Test' }))
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to copy markdown:', expect.any(Error))
    })
    
    consoleSpy.mockRestore()
  })
})


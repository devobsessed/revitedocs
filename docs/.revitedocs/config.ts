import { defineConfig } from 'revitedocs'

export default defineConfig({
  title: 'ReviteDocs',
  description: 'A VitePress-style documentation generator built with Vite and React',

  theme: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/cli' },
      { text: 'GitHub', link: 'https://github.com/devobsessed/revitedocs' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is ReviteDocs?', link: '/' },
            { text: 'Getting Started', link: '/getting-started/installation' },
            { text: 'Quick Start', link: '/getting-started/quick-start' },
          ],
        },
        {
          text: 'Guide',
          items: [
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Markdown Features', link: '/guide/markdown' },
            { text: 'Components', link: '/guide/components' },
            { text: 'Theming', link: '/guide/theming' },
            { text: 'Search', link: '/guide/search' },
          ],
        },
        {
          text: 'API Reference',
          items: [
            { text: 'CLI Commands', link: '/api/cli' },
            { text: 'Config Options', link: '/api/config' },
          ],
        },
      ],
    },
  },

  llms: {
    enabled: true,
    title: 'ReviteDocs Documentation',
    description: 'Documentation generator for creating beautiful docs with React and Vite',
  },

  search: {
    enabled: true,
  },
})


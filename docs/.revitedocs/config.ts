import { defineConfig } from "revitedocs";

export default defineConfig({
  title: "ReviteDocs",
  description: "A modern documentation generator built with Vite and React",

  llms: {
    enabled: true,
  },

  search: {
    enabled: true,
  },

  theme: {
    nav: [
      { text: "Guide", link: "/guide/configuration" },
      { text: "API", link: "/api/cli" },
      { text: "GitHub", link: "https://github.com/devobsessed/revitedocs" },
    ],
    sidebar: {
      "/": [
        {
          text: "Introduction",
          items: [
            { text: "What is ReviteDocs?", link: "/" },
            { text: "Getting Started", link: "/getting-started/installation" },
            { text: "Quick Start", link: "/getting-started/quick-start" },
          ],
        },
        {
          text: "Guide",
          items: [
            { text: "Configuration", link: "/guide/configuration" },
            { text: "Markdown Features", link: "/guide/markdown" },
            { text: "Components", link: "/guide/components" },
            { text: "Theming", link: "/guide/theming" },
            { text: "Search", link: "/guide/search" },
          ],
        },
        {
          text: "API Reference",
          items: [
            { text: "CLI Commands", link: "/api/cli" },
            { text: "Config Options", link: "/api/config" },
          ],
        },
      ],
    },
  },
});

import cac from 'cac'

const program = cac('revitedocs')

program
  .command('[root]', 'Start dev server')
  .alias('dev')
  .option('--port <port>', 'Port number', { default: 3000 })
  .option('--open', 'Open browser on startup')
  .option('--host', 'Expose to network')
  .action(async (root: string | undefined, options: { port: number; open?: boolean; host?: boolean }) => {
    const { dev } = await import('./commands/dev.js')
    await dev(root || '.', options)
  })

program
  .command('build [root]', 'Build for production (SSG)')
  .option('--outDir <dir>', 'Output directory')
  .option('--base <path>', 'Public base path')
  .option('--skip-ssg', 'Skip SSG pre-rendering (client-only build)')
  .option('--skip-search', 'Skip search index generation')
  .option('--skip-llms', 'Skip llms.txt generation')
  .option('--skip-sitemap', 'Skip sitemap.xml generation')
  .option('--site-url <url>', 'Base URL for sitemap (e.g., https://docs.example.com)')
  .action(async (root: string | undefined, options: { outDir?: string; base?: string; skipSSG?: boolean; skipSearch?: boolean; skipLlms?: boolean; skipSitemap?: boolean; siteUrl?: string }) => {
    const { build } = await import('./commands/build.js')
    await build(root || '.', options)
  })

program
  .command('preview [root]', 'Preview production build')
  .option('--port <port>', 'Port number', { default: 4173 })
  .option('--outDir <dir>', 'Output directory to preview')
  .action(async (root: string | undefined, options: { port: number; outDir?: string }) => {
    const { preview } = await import('./commands/preview.js')
    await preview(root || '.', options)
  })

program
  .command('init', 'Initialize a new revitedocs project')
  .action(async () => {
    const { init } = await import('./commands/init.js')
    await init()
  })

program.help()
program.version('0.0.1')

export function cli(args: string[]) {
  program.parse(['node', 'revitedocs', ...args])
}


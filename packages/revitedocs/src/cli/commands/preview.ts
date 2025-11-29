import { preview as vitePreview } from 'vite'
import path from 'node:path'

export interface PreviewOptions {
  port: number
  outDir?: string
}

export async function preview(root: string, options: PreviewOptions): Promise<void> {
  const resolvedRoot = path.resolve(root)
  const outDir = options.outDir ?? '.revitedocs/dist'
  
  console.log(`Previewing build in ${resolvedRoot}...`)
  console.log(`Options: port=${options.port}, outDir=${outDir}`)

  const server = await vitePreview({
    root: resolvedRoot,
    build: {
      outDir,
    },
    preview: {
      port: options.port,
    },
  })

  server.printUrls()
}

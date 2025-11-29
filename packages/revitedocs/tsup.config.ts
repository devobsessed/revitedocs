import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'cli/index': 'src/cli/index.ts',
    'core/index': 'src/core/index.ts',
    'components/index': 'src/components/index.ts',
    'theme/index': 'src/theme/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom', 'vite'],
  banner: {
    js: '// revitedocs - Documentation generator with React Router 7 SSG',
  },
})


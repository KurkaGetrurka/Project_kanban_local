import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function localHtmlPlugin() {
  return {
    name: 'local-html-plugin',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: `<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kanban lokalny</title>
    <link rel="stylesheet" href="./assets/style.css" />
  </head>
  <body>
    <div id="root"></div>
    <script src="./assets/app.js"></script>
  </body>
</html>`
      })
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    localHtmlPlugin(),
  ],
  build: {
    outDir: 'dist-local',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: 'src/main.jsx',
      output: {
        format: 'iife',
        name: 'KanbanLocal',
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'assets/style.css'
          }
          return 'assets/[name][extname]'
        },
      },
    },
  },
})

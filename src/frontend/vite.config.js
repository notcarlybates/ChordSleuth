import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        tailwindcss(), 
        autoprefixer()
      ]
    }
  },
  build: {
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return
        }
        defaultHandler(warning)
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  }
})
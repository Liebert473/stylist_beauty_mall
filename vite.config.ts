import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build:single` produces one self-contained dist-single/index.html
// that opens straight from disk — no server or internet needed on presentation day.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  build: { chunkSizeWarningLimit: 2000, ...(mode === 'single' ? { outDir: 'dist-single' } : {}) },
}))

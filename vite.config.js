import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Get all HTML files from root for multi-page app entries
const getHTMLEntries = () => {
  const htmlFiles = {}
  const rootDir = process.cwd()
  
  // Scan for all .html files in root directory (exclude node_modules)
  fs.readdirSync(rootDir).forEach(file => {
    if (file.endsWith('.html')) {
      const name = file.replace('.html', '')
      htmlFiles[name] = path.resolve(rootDir, file)
    }
  })
  
  return htmlFiles
}

export default defineConfig({
  plugins: [react()],
  
  // Configure server for development
  server: {
    port: 5174,
    host: 'localhost',
    open: true,
    // Enable HMR for live reload
    hmr: {
      host: 'localhost',
      port: 5174,
    },
    // Middleware to handle all requests
    middlewareMode: false,
  },
  
  // Configure build
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: getHTMLEntries(),
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash][extname]',
      }
    }
  },
  
  // Root is the project root
  root: '.',
  
  // Base path for production
  base: '/',
  
  // Public directory
  publicDir: 'public',
})

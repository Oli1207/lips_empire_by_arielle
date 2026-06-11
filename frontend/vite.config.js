import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: 'https://lipsempirebyarielle.store/',
  plugins: [react()],
  resolve: {
    alias: {
      'simple-zustand-devtools': '/src/utils/devtools-stub.js',
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/password-reset': 'http://localhost:4000', // Replace 3001 with your backend port
      '/auth': 'http://localhost:4000'
      // Add other API routes as needed
    }
  }
})

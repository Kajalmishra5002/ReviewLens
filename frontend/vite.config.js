import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000"
    }
  },
  optimizeDeps: {
    // Pre-bundle recharts + react-is so Vite never fails to resolve the
    // "Failed to resolve import 'react-is' from recharts" error.
    include: ["recharts", "react-is"]
  }
})

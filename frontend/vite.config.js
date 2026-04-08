import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'cmnqci0ot0005g56xos2hbtgy-frontend.trycloudflare.com',
      'peltate-nonusuriously-sina.ngrok-free.dev'
    ]
  }
})

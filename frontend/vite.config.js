import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // Agar dapat diakses dari luar container Docker
    port: 5173,
    watch: {
      usePolling: true, // Diperlukan agar hot-reload berjalan di dalam Docker (volume mount)
    },
  },
})

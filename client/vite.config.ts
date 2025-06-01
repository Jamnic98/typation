import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tsconfigPaths(), tailwindcss()],
  server: {
    host: true,
    ...(mode === 'development' && {
      proxy: {
        '/text': {
          target: 'http://192.168.68.104:5000',
          changeOrigin: true,
        },
      },
      allowedHosts: ['192.168.68.104', 'ubuntu-server.local'],
    }),
  },
}))

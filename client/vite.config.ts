import { defineConfig } from 'vite'
import { VitePluginRadar } from 'vite-plugin-radar'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    VitePluginRadar({
      enableDev: true,
      analytics: [
        {
          id: 'G-K6KQGP4TKX',
          disable: false,

          // GA4 config
          config: {
            send_page_view: true, // track first page view
            allow_google_signals: true,
            allow_ad_personalization_signals: true,
          },

          // Consent defaults (basic)
          consentDefaults: {
            analytics_storage: 'granted',
            ad_storage: 'denied',
          },
        },
      ],
    }),
  ],
  server: {
    host: true,
    ...(mode === 'development' && {
      proxy: {
        '/text': {
          target: 'http://192.168.68.104:5000',
          changeOrigin: true,
        },
      },
      allowedHosts: ['192.168.68.104'],
    }),
  },
}))

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vite-pwa/nuxt'
  ],
  css: ['~/assets/css/main.css'],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'YNAB-lite',
      short_name: 'YNAB-lite',
      description: 'Offline-first budgeting PWA focused on core YNAB workflows.',
      theme_color: '#0f172a',
      background_color: '#0f172a',
      display: 'standalone',
      start_url: '/',
      lang: 'ru'
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}']
    },
    client: {
      installPrompt: true
    }
  }
})

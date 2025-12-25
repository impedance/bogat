// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: '.',
  ssr: false,
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vite-pwa/nuxt'
  ],
  css: ['~/app/assets/css/main.css'],
  pwa: {
    // AICODE-NOTE: Manifest и Workbox задаются здесь, чтобы офлайн-шелл и установка через @vite-pwa/nuxt оставались воспроизводимыми между релизами. [2025-11-18]
    registerType: 'autoUpdate',
    includeAssets: [
      'favicon.ico',
      'icons/apple-touch-icon.png',
      'icons/icon-192x192.png',
      'icons/icon-512x512.png',
      'icons/icon-512x512-maskable.png'
    ],
    manifest: {
      id: '/',
      scope: '/',
      name: 'YNAB-lite — локальный контроль бюджета',
      short_name: 'YNAB-lite',
      description: 'Offline-first бюджетирование с Dexie и JSON-бэкапами.',
      theme_color: '#0f172a',
      background_color: '#020617',
      display: 'standalone',
      start_url: '/',
      orientation: 'portrait',
      lang: 'ru',
      dir: 'ltr',
      categories: ['finance', 'productivity'],
      icons: [
        { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        {
          src: '/icons/icon-512x512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ],
      shortcuts: [
        {
          name: 'Новая транзакция',
          short_name: 'Добавить',
          description: 'Быстрый переход к форме транзакции.',
          url: '/transactions?panel=new'
        },
        {
          name: 'Категории',
          short_name: 'Категории',
          description: 'Открыть экран категорий.',
          url: '/categories'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-stylesheets'
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-webfonts',
            expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 }
          }
        }
      ]
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 60 * 60 * 6
    },
    devOptions: {
      enabled: true,
      navigateFallback: '/'
    }
  }
})

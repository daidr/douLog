// https://nuxt.com/docs/api/configuration/nuxt-config
import prismjs from 'vite-plugin-prismjs'

export default defineNuxtConfig({
  typescript: {
    shim: false,
  },
  modules: [
    // '@nuxt/image-edge',
    '@vueuse/nuxt',
    'nuxt-windicss',
    'unplugin-icons/nuxt',
    '@vite-pwa/nuxt',
  ],
  pwa: {
    injectRegister: 'auto',
    includeAssets: [
      'favicon.ico',
      'favicon-16x16.png',
      'favicon-32x32.png',
      '/pwa/apple-touch-icon.png',
      '/pwa/safari-pinned-tab.svg',
    ],
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/vitals\.vercel-analytics\.com\/.*/i,
          handler: 'NetworkOnly',
        },
        {
          urlPattern: /^https:\/\/api\.daidr\.me\/.*/i,
          handler: 'NetworkOnly',
        },
        {
          urlPattern: /^https:\/\/cdn\.daidr\.me\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'cdn-image-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 10,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/i\.loli\.net\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'cdn-image-smms',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    manifest: {
      name: '戴兜的小屋',
      short_name: 'DouLOG',
      description: 'Coding the world.',
      theme_color: '#ffffff',
      icons: [
        {
          src: '/pwa/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/pwa/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
  },
  css: ['~/assets/scss/global.scss', '~/assets/fonts/BEYNO/font.css'],
  runtimeConfig: {
    apiEntry: process.env.NUXT_BLOG_API_ENTRY || 'https://daidr.me',
    openAIKey: process.env.NUXT_BLOG_OPENAI_KEY || '',
  },
  nitro: {
    storage: {
      redis: {
        driver: 'redis',
        port: process.env.NUXT_BLOG_REDIS_PORT || 6379,
        host: process.env.NUXT_BLOG_REDIS_HOST || '127.0.0.1',
        username: process.env.NUXT_BLOG_REDIS_USER || '',
        password: process.env.NUXT_BLOG_REDIS_PASSWORD || '',
        db: process.env.NUXT_BLOG_REDIS_DB || 0,
        tls: {},
      },
      cache: {
        driver: 'redis',
        port: process.env.NUXT_BLOG_REDIS_PORT || 6379,
        host: process.env.NUXT_BLOG_REDIS_HOST || '127.0.0.1',
        username: process.env.NUXT_BLOG_REDIS_USER || '',
        password: process.env.NUXT_BLOG_REDIS_PASSWORD || '',
        db: process.env.NUXT_BLOG_REDIS_DB || 0,
        tls: {},
      },
    },
  },
  vite: {
    plugins: [
      prismjs({
        languages: [
          'javascript',
          'typescript',
          'css',
          'markup',
          'bash',
          'shell',
          'json',
          'php',
        ],
        plugins: ['toolbar', 'copy-to-clipboard', 'show-language'],
        theme: 'okaidia',
        css: true,
      }),
    ],
  },
})

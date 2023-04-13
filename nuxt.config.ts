// https://nuxt.com/docs/api/configuration/nuxt-config
import prismjs from 'vite-plugin-prismjs'

export default defineNuxtConfig({
  typescript: {
    shim: false,
  },
  experimental: {
    renderJsonPayloads: true
  },
  app: {
    rootId: '__daidr_app',
    buildAssetsDir: '/_doulog/',
  },
  modules: [
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
    devOptions: {
      enabled: false,
      type: 'module',
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      runtimeCaching: [
        // 阿里云CDN，缓存优先，存30天
        {
          urlPattern: /^https:\/\/cdn\.daidr\.me\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'cdn-image-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // sm.ms 图床，缓存优先，存30天
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
        // /api/articles 接口，缓存 30 分钟，返回过期数据再重新请求
        {
          urlPattern: /\/api\/articles.*/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'api-articles-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 30,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // /api/article/\d+ 接口，缓存 30 分钟，返回过期数据再重新请求
        {
          urlPattern: /\/api\/article\/\d+.*/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'api-article-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 30,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        // /api/summary 接口，缓存 1 小时，返回过期数据再重新请求
        {
          urlPattern: /\/api\/summary.*/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'api-summary-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60,
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
      scope: '/',
      start_url: '/',
      display: 'standalone',
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
    GithubAPIEntry:
      process.env.NUXT_GITHUB_API_ENTRY || 'https://api.github.com',
    openAIKey: process.env.NUXT_BLOG_OPENAI_KEY || '',
    app: {
      buildAssetsDir: '/_doulog/',
    },
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

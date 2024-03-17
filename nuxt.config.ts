import { currentLocales } from './config/i18n'
import type { BuildInfo } from './types'

export default defineNuxtConfig({
  typescript: {
    shim: false,
  },
  devtools: { enabled: true },
  experimental: {
    appManifest: false,
  },
  app: {
    rootId: '__daidr_app',
    buildAssetsDir: '/_doulog/',
  },
  extends: ['nuxt-umami'],
  appConfig: {
    umami: {
      host:
        process.env.NUXT_PUBLIC_UMAMI_HOST || 'https://analytics.eu.umami.is',
      id: process.env.NUXT_PUBLIC_UMAMI_ID || '',
      version: 2,
      domains: ['im.daidr.me'],
      ignoreLocalhost: true,
    },
  },
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    'unplugin-icons/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    '~/modules/pwa/index',
    '~/modules/purge-comments',
  ],
  colorMode: {
    classSuffix: '',
  },
  routeRules: {
    // Static generation
    '/': { prerender: true },
    '/blog/**': { prerender: false },
    '/manifest.webmanifest': {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    },
  },
  i18n: {
    locales: currentLocales,
    lazy: true,
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
    langDir: 'locales',
    defaultLocale: 'en-US',
    vueI18n: './config/i18n.config.ts',
  },
  imports: {
    imports: [{
      name: 'useI18n',
      from: '~/utils/i18n',
      priority: 100,
    }],
    injectAtEnd: true,
  },
  pwa: {
    scope: '/',
    srcDir: './service-worker',
    filename: 'sw.ts',
    strategies: 'injectManifest',
    injectRegister: false,
    includeManifestIcons: false,
    manifest: false,
    injectManifest: {
      globPatterns: ['**/*.{js,json,css,html,txt,svg,png,ico,webp,woff,woff2,ttf,eot,otf,wasm}'],
      globIgnores: ['manifest**.webmanifest'],
    },
    devOptions: {
      enabled: false,
      type: 'module',
    },
  },
  css: [
    '@unocss/reset/tailwind.css',
    '~/assets/scss/global.scss',
    '~/assets/fonts/BEYNO/font.css',
  ],
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
    prerender: {
      crawlLinks: true,
    },
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
    devStorage: {
      cache: {
        driver: 'memory',
      },
    },
  },
  vite: {
    plugins: [],
    vue: {
      template: {
        compilerOptions: {
        },
      },
    },
    worker: {
      format: 'es',
    },
  },
})

declare module '@nuxt/schema' {
  interface AppConfig {
    env: BuildInfo['env']
    buildInfo: BuildInfo
  }
}

// https://nuxt.com/docs/api/configuration/nuxt-config
import prismjs from 'vite-plugin-prismjs'

export default defineNuxtConfig({
  typescript: {
    shim: false,
  },
  modules: [
    '@nuxt/image-edge',
    '@vueuse/nuxt',
    'nuxt-windicss',
    'unplugin-icons/nuxt',
  ],
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
        ],
        plugins: ['toolbar', 'copy-to-clipboard', 'show-language'],
        theme: 'okaidia',
        css: true,
      }),
    ],
  },
})

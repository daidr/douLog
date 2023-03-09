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

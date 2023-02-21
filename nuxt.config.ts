// https://nuxt.com/docs/api/configuration/nuxt-config
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
})

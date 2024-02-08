export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const i18n = nuxtApp.$i18n as any
    if (!i18n) return
    const browserLocale = i18n.getBrowserLocale()
    i18n.setLocaleCookie(browserLocale || i18n.locale.value)
  })
})

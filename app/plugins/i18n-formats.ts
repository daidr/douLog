import { datetimeFormats, numberFormats, pluralRules } from '~~/config/i18n'

export default defineNuxtPlugin({
  name: 'i18n-formats',
  setup(nuxtApp) {
    const provides = nuxtApp.vueApp._context.provides as Record<symbol, any>
    const i18nSymbol = Object.getOwnPropertySymbols(provides).find(
      s => s.toString() === 'Symbol(vue-i18n)',
    )
    const composer = i18nSymbol ? provides[i18nSymbol]?.global : undefined
    if (!composer) return

    for (const locale in numberFormats) {
      composer.setNumberFormat(locale, numberFormats[locale as keyof typeof numberFormats])
    }
    for (const locale in datetimeFormats) {
      composer.setDateTimeFormat(locale, datetimeFormats[locale as keyof typeof datetimeFormats])
    }
    if (composer.pluralRules) {
      for (const locale in pluralRules) {
        composer.pluralRules[locale] = pluralRules[locale as keyof typeof pluralRules]
      }
    }
  },
})

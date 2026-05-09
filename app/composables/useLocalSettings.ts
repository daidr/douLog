import type { Ref } from 'vue'
import type { LocaleObject } from '@nuxtjs/i18n'

export type ColorMode = 'light' | 'dark' | 'system'

export interface LocalSettings {
  language: string
  colorMode?: ColorMode
}

export function getDefaultLanguage(languages: string[]) {
  if (import.meta.server) {
    return 'en-US'
  }
  return matchLanguages(languages, navigator.languages) || 'en-US'
}

function getDefaultLocalSettings(locales: string[]): LocalSettings {
  return {
    language: getDefaultLanguage(locales),
  }
}

export function useLocalSettings() {
  const { locales } = useNuxtApp().$i18n
  const supportLanguages = (unref(locales) as LocaleObject[]).map(locale => locale.code)
  const settingsStorage = useLocalStorage<LocalSettings>('doulog-local-settings', () => getDefaultLocalSettings(supportLanguages))

  return settingsStorage
}

<script setup lang="ts">
import type { Directions, LocaleObject } from '@nuxtjs/i18n'
import { useDouSlackingStore } from './stores/dou-slacking'
import { SPLASH_IMAGES } from './utils/splash-images'
import { CONFIG } from '@/config/base'

const { randomThemeColorIndex, themeColor } = storeToRefs(useStatesStore())
const colorMode = useColorMode()

const { locale, locales, t } = useI18n()

const localeMap = (locales.value as LocaleObject[]).reduce((acc, l) => {
  acc[l.code!] = l.dir ?? 'ltr'
  return acc
}, {} as Record<string, Directions>)

function unescapeTitleTemplate(titleTemplate: string, replacements: [string, string[]][]) {
  let result = titleTemplate
  for (const [replacement, entities] of replacements) {
    for (const e of entities) {
      result = result.replaceAll(e, replacement)
    }
  }
  return result.trim()
}

useHydratedHead({
  meta: [
    () => ({
      name: 'theme-color',
      content: themeColor.value,
    }),
  ],
  link: [
    () => import.meta.client
      ? {
          key: 'webmanifest',
          rel: 'manifest',
          href: `/manifest-${locale.value}${colorMode.value === 'dark' ? '-dark' : ''}.webmanifest`,
        }
      : {},
  ],
  htmlAttrs: {
    lang: () => locale.value,
    dir: () => localeMap[locale.value] ?? 'ltr',
    class: () => {
      return {
        dark: colorMode.value === 'dark',
      }
    },
  },
})

useHead({
  link: [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: '/favicon-16x16.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      href: '/pwa/apple-touch-icon.png',
    },
    {
      rel: 'mask-icon',
      href: '/pwa/safari-pinned-tab.svg',
      color: '#5d5bd5',
    },
    {
      rel: 'dns-prefetch',
      href: 'https://cdn.daidr.me',
    },
    {
      rel: 'dns-prefetch',
      href: 'https://i.loli.net',
    },
    {
      rel: 'preconnect',
      href: 'https://cdn.daidr.me',
    },
    {
      rel: 'preconnect',
      href: 'https://i.loli.net',
    },
    ...SPLASH_IMAGES,
  ],
  titleTemplate: (title?: string) => {
    let titleTemplate = title ?? ''

    if (titleTemplate.match(/&[a-z0-9#]+;/gi)) {
      titleTemplate = unescapeTitleTemplate(titleTemplate, [
        ['"', ['&#34;', '&quot;']],
        ['&', ['&#38;', '&amp;']],
        ['\'', ['&#39;', '&apos;']],
        ['\u003C', ['&#60;', '&lt;']],
        ['\u003E', ['&#62;', '&gt;']],
      ])
      if (titleTemplate.length > 60) {
        titleTemplate = `${titleTemplate.slice(0, 60)}...${titleTemplate.endsWith('"') ? '"' : ''}`
      }

      if (!titleTemplate.includes('"')) {
        titleTemplate = `"${titleTemplate}"`
      }
    } else if (titleTemplate.length > 60) {
      titleTemplate = `${titleTemplate.slice(0, 60)}...${titleTemplate.endsWith('"') ? '"' : ''}`
    }

    const site_name = t('global.site_name')

    if (titleTemplate.length && site_name.length) {
      titleTemplate += ' | '
      titleTemplate += site_name
    }

    return titleTemplate
  },
  meta: computed(() => [
    {
      hid: 'description',
      name: 'description',
      content: t('global.desc'),
    },
    {
      hid: 'keywords',
      name: 'keywords',
      content: CONFIG.keywords.join(','),
    },
    {
      name: 'viewport',
      content:
        'width=device-width, initial-scale=1.0, viewport-fit=cover, minimum-scale=1, maximum-scale=1.0, user-scalable=0',
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent',
    },
  ]),
})

watch(() => randomThemeColorIndex.value, (index, oldIndex) => {
  if (import.meta.env.SSR) return
  if (oldIndex !== undefined) {
    document.body.classList.remove(`theme-${oldIndex + 1}`)
  }

  document.body.classList.add(`theme-${index + 1}`)
}, {
  immediate: true,
})

const nuxtApp = useNuxtApp()

onMounted(() => {
  useDouSlackingStore()
})
</script>

<template>
  <CommonWappalyzerCheat />
  <NuxtLayout>
    <RouterView v-slot="{ Component }">
      <CommonRouterTransition>
        <Suspense
          @pending="() => {
            nuxtApp.callHook('page:start')
          }" @resolve="() => {
            nextTick(() => nuxtApp.callHook('page:finish'))
          }"
        >
          <component :is="Component" />
        </Suspense>
      </CommonRouterTransition>
    </RouterView>
  </NuxtLayout>
</template>

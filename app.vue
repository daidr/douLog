<script setup lang="ts">
import { useDouSlackingStore } from './stores/dou-slacking'
import { SPLASH_IMAGES } from './utils/splash-images'
import { CONFIG } from '@/config/base'

const { randomThemeColorIndex, themeColor, isDarkMode } = storeToRefs(useStatesStore())

watch(() => randomThemeColorIndex.value, (index, oldIndex) => {
  if (import.meta.env.SSR) return
  if (oldIndex !== undefined) {
    document.body.classList.remove(`theme-${oldIndex + 1}`)
  }

  document.body.classList.add(`theme-${index + 1}`)
}, {
  immediate: true,
})

const { t } = useI18n()

useHead({
  htmlAttrs: {
    lang: 'zh-CN',
    class: computed(() => {
      return {
        dark: isDarkMode,
      }
    }),
  },
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
  titleTemplate: (titleChunk) => {
    return titleChunk
      ? `${titleChunk} - ${t('global.site_name')}`
      : t('global.site_name')
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
      name: 'theme-color',
      content: themeColor.value,
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
  ]),
})

const nuxtApp = useNuxtApp()

onMounted(() => {
  useDouSlackingStore()
})
</script>

<template>
  <CommonWappalyzerCheat />
  <NuxtLayout>
    <VitePwaManifest />
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

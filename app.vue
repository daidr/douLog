<script setup lang="ts">
import { CONFIG } from '@/config/base'

const themeColorList = [
  '#b1dafb',
  '#fcbcb9',
  '#dbb3e3',
  '#c0e3c2',
  '#bcc2e5',
  '#d0c4bf',
  '#c7d2d5',
  '#a6dad5',
]

const randomThemeColorIndex = useState('randomThemeColorIndex', () =>
  Math.floor(Math.random() * themeColorList.length)
)

provide('themeColor', themeColorList[randomThemeColorIndex.value])

useHead({
  htmlAttrs: {
    lang: 'zh-CN',
  },
  bodyAttrs: {
    class: 'theme-' + (randomThemeColorIndex.value + 1),
    'data-prismjs-copy': '复制',
    'data-prismjs-copy-error': '复制出错',
    'data-prismjs-copy-success': '已复制',
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
      crossorigin: 'anonymous',
      href: 'https://cdn.daidr.me',
    },
    {
      rel: 'preconnect',
      crossorigin: 'anonymous',
      href: 'https://i.loli.net',
    },
  ],
  titleTemplate: titleChunk => {
    return titleChunk ? `${titleChunk} - ${CONFIG.siteName}` : CONFIG.siteName
  },
  meta: [
    {
      hid: 'description',
      name: 'description',
      content: CONFIG.description,
    },
    {
      hid: 'keywords',
      name: 'keywords',
      content: CONFIG.keywords.join(','),
    },
    {
      name: 'theme-color',
      content: themeColorList[randomThemeColorIndex.value],
    },
    {
      name: 'viewport',
      content:
        'width=device-width, initial-scale=1.0, viewport-fit=cover, minimum-scale=1, maximum-scale=1.0, user-scalable=0',
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <VitePwaManifest />
    <RouterView v-slot="{ Component }">
      <CommonRouterTransition>
        <component :is="Component" />
      </CommonRouterTransition>
    </RouterView>
  </NuxtLayout>
</template>

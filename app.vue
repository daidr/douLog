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
  bodyAttrs: {
    class: 'theme-' + (randomThemeColorIndex.value + 1),
  },
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico',
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
  ],
})
</script>

<template>
  <NuxtLayout>
    <RouterView v-slot="{ Component }">
      <CommonRouterTransition>
        <component :is="Component" />
      </CommonRouterTransition>
    </RouterView>
  </NuxtLayout>
</template>

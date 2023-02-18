<script setup lang="ts">
import { CONFIG } from '@/config/base'

const themeColorList = [
  '#2196f3',
  '#f44336',
  '#9c27b0',
  '#4caf50',
  '#3f51b5',
  '#795548',
  '#607d8b',
  '#009688',
]

const randomThemeColorIndex = useState('randomThemeColorIndex', () =>
  Math.floor(Math.random() * themeColorList.length)
)

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

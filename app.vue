<script setup lang="ts">
import { CONFIG } from '@/config/base'
useHead({
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

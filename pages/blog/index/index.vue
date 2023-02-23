<script setup lang="ts">
import IconAlarm from '~icons/icon-park-outline/alarm'
import { CONFIG } from '~~/config/base'
</script>

<template>
  <div class="content-wrapper">
    <div class="announcement-item">
      <IconAlarm />
      <p>{{ CONFIG.blogAnnouncement }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content-wrapper {
  @apply w-full flex flex-col items-stretch;

  .announcement-item {
    @apply w-full bg-white px-5 md:px-8 py-4 w-full;
    @apply rounded-4xl;
    @apply shadow-2xl shadow-primary/30;
    @apply flex items-center space-x-4;
    @apply text-lg text-primary-light;

    p {
      @apply text-primary/80;
    }
  }
}
</style>

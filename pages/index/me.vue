<script setup>
import RealtimeActionView from '~/components/common/RealtimeActionView.vue'
import { CONFIG } from '~~/config/base'

useHead({
  title: '我',
})
</script>

<template>
  <UiCardWrapper>
    <div class="wrapper">
      <ClientOnly>
        <div class="action-wrapper">
          <RealtimeActionView />
        </div>
      </ClientOnly>
      <UiMainAvatar />
      <div class="name">
        {{ CONFIG.name }} <span>@{{ CONFIG.enName }}</span>
      </div>
      <div class="motto">{{ CONFIG.description }}</div>
      <UiSocialMediaNav class="socialmedia-wrapper" />
    </div>
  </UiCardWrapper>
</template>

<style scoped lang="scss">
.wrapper {
  @apply flex flex-col items-center;
  @apply pt-8 relative;

  .action-wrapper {
    @apply absolute top-5 right-5 z-10;
  }

  .name {
    @apply text-2xl;
    @apply mt-11;
    @apply text-primary/80 font-bold;

    span {
      @apply text-lg font-normal text-primary/50;
    }
  }

  .motto {
    @apply mt-3;
    @apply font-normal text-primary/50;
  }

  .socialmedia-wrapper {
    @apply mt-13;
  }
}
</style>

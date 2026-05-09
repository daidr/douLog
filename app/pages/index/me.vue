<script setup>
import RealtimeActionView from '~/components/common/RealtimeActionView.vue'

const { t } = useI18n()

useHead({
  title: computed(() => t('main_nav.me')),
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
        {{ t('global.name') }} <span>@{{ t('global.en_name') }}</span>
      </div>
      <div class="motto">
        {{ t('global.desc') }}
      </div>
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
    @apply text-primary font-bold;

    span {
      @apply text-lg font-normal text-primary;
    }
  }

  .motto {
    @apply mt-3;
    @apply font-normal text-primary-4 dark-text-primary-5;
  }

  .socialmedia-wrapper {
    @apply mt-13;
  }
}
</style>

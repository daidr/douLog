<script setup>
import RealtimeActionView from '~/components/common/RealtimeActionView.vue'

const { t } = useI18n()

// 博主信息优先取后端 metadata（server-state 注水），i18n 作为兜底
const metadata = useSiteMetadata()
const bloggerName = computed(() => metadata.value?.profile?.name || t('global.name'))
const bloggerHandle = computed(() => metadata.value?.profile?.handle || t('global.en_name'))
const bloggerMotto = computed(() => metadata.value?.profile?.motto || t('global.desc'))

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
        {{ bloggerName }} <span>@{{ bloggerHandle }}</span>
      </div>
      <div class="motto">
        {{ bloggerMotto }}
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

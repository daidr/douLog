<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const back = useRouter().back

const showBackBtn = ref(false)

onMounted(() => {
  showBackBtn.value = history.length > 1
})

useHead({
  title: '离线中',
})
</script>

<template>
  <div class="notfound-page-wrapper">
    <div class="decoration-wrapper transition-extra-wrapper">
      <UiNotFoundImage />
    </div>
    <div class="transition-page-wrapper">
      <div class="page-container">
        <div class="title">
          离线中
        </div>
        <div class="content">
          <div class="text">
            当前网络不佳，不过好在你可以：
          </div>
          <div class="btn-group">
            <RouterLink to="/" class="link-btn">
              去首页
            </RouterLink>
            <ClientOnly>
              <span v-if="showBackBtn" class="link-btn" @click="back()">
                去上一页
              </span>
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.notfound-page-wrapper {
  @apply w-350px sm:w-400px md:w-760px lg:w-900px h-500px;
  @apply absolute top-1/2 left-1/2 rounded-8;
  @apply transform-gpu -translate-x-1/2 -translate-y-1/2;
  @apply flex justify-between;

  .transition-page-wrapper {
    @apply bg-light dark-bg-dark w-full md:w-400px h-full mt-[env(safe-area-inset-top,0)];
    @apply shadow-2xl general-shadow;
    @apply rounded-8;
    @apply overflow-hidden;

    .page-container {
      @apply w-full h-full flex flex-col items-center justify-center select-none;

      .title {
        @apply text-7xl font-extrabold text-primary-text;
      }

      .content {
        @apply mt-40 text-lg text-primary font-medium;
      }

      .btn-group {
        @apply mt-5 flex space-x-4 justify-center;

        .link-btn {
          @apply text-base whitespace-nowrap;
          @apply text-light dark-text-primary-10 bg-primary-5;
          @apply rounded-full relative;
          @apply cursor-pointer;
          @apply px-3 py-1.5;

          &::before {
            content: '';
            @apply absolute -top-6px -left-6px -right-6px -bottom-6px -z-1;
            @apply rounded-full;
            @apply border-4px border-primary-1 dark-border-primary-3;
            @apply transition;
            @apply transform-gpu scale-50 opacity-0;
            @apply pointer-events-none;
          }

          &:hover::before,
          &:active::before {
            @apply scale-100 opacity-100;
          }
        }
      }
    }
  }

  .decoration-wrapper {
    @apply w-0 md:w-auto flex-grow overflow-hidden;
    @apply md:pr-15 lg:pr-25;
    @apply flex items-center;

    svg {
      @apply opacity-90 w-full;
    }
  }
}
</style>

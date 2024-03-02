<script setup>
import { FriendsList } from '@/config/friends.js'
import { shuffle } from '@/utils/_'
import IconSubway from '~icons/mingcute/train-3-line'

const showTopShadow = ref(false)
const showBottomShadow = ref(true)

function onScroll(e) {
  const { scrollTop, scrollHeight, clientHeight } = e.target
  showTopShadow.value = scrollTop > 3
  showBottomShadow.value = scrollHeight - scrollTop > clientHeight
}

const { t } = useI18n()

useHead({
  title: computed(() => t('main_nav.friends')),
})
</script>

<template>
  <UiCardWrapper>
    <div class="friends-overflow-container">
      <div
        class="friends-container y-scroll-box" :class="{
          'top-shadow': showTopShadow,
          'bottom-shadow': showBottomShadow,
        }" @scroll.passive="onScroll"
      >
        <a href="https://www.travellings.cn/go.html" target="_blank" class="friend-item">
          <div class="avatar avatar-icon">
            <IconSubway />
          </div>
          <div class="detail">
            <div class="name">{{ t('friends.travelling') }}</div>
            <div class="motto">{{ t('friends.travelling_desc') }}</div>
          </div>
        </a>
        <a
          v-for="item of isHydrated ? shuffle(FriendsList) : FriendsList" :key="item.url" class="friend-item" :href="item.url" target="_blank"
          rel="noopener noreferrer"
        >
          <div class="avatar" :style="{ backgroundColor: item.color }">
            <UiLazyImage :src="`/images/friends/${item.avatar}`" :alt="item.name" />
          </div>
          <div class="detail">
            <div class="name">
              {{ item.name }}
            </div>
            <div class="motto">
              {{ item.motto }}
            </div>
          </div>
        </a>
      </div>
    </div>
  </UiCardWrapper>
</template>

<style scoped lang="scss">
.friends-overflow-container {
  @apply h-full overflow-hidden rounded-b-8 relative;
  @apply py-15px px-2;

  .friends-container {
    @apply h-full;
    @apply grid grid-cols-1 gap-3;
    @apply px-3 py-6px;
    --show-top-mask: 0;
    --show-bottom-mask: 0;
    --mask-size: 24px;
    --gradient: linear-gradient(to bottom, transparent 0%, white calc(var(--show-top-mask) * var(--mask-size)), white calc(100% - calc(var(--mask-size)*var(--show-bottom-mask))), transparent 100%);
    -webkit-mask: var(--gradient);
    mask: var(--gradient);

    &.top-shadow {
      --show-top-mask: 1;
    }

    &.bottom-shadow {
      --show-bottom-mask: 1;
    }

    scrollbar-width: thin;
    scrollbar-color: rgba(var(--color-primary), 0.8) rgb(var(--color-primary-1));

    // 滚动条
    &::-webkit-scrollbar {
      @apply w-2;
    }

    &::-webkit-scrollbar-thumb {
      @apply bg-primary-5;
      @apply rounded-full;
    }

    &::-webkit-scrollbar-track {
      @apply bg-primary-1;
      @apply rounded-full;
    }

    .friend-item {
      @apply flex;
      @apply bg-primary-1 dark-bg-primary-3;
      @apply rounded-2xl p-2;
      @apply cursor-pointer relative;

      &::before {
        content: '';
        @apply absolute -top-6px -left-6px -right-6px -bottom-6px -z-1;
        @apply rounded-1.4rem;
        @apply border-4px border-primary-1 dark-border-primary-3;
        @apply transition;
        @apply transform-gpu scale-50 opacity-0;
        @apply pointer-events-none;
      }

      &:hover::before,
      &:active::before {
        @apply scale-100 opacity-100;
      }

      .avatar {
        @apply w-13 h-13 rounded-xl mr-2 select-none;
        @apply flex-shrink-0;

        .lazy-image {
          @apply rounded-xl;

          &:deep(img) {
            @apply rounded-xl;
          }
        }

        &.avatar-icon {
          @apply bg-primary-4 dark-bg-primary-6 text-white dark-text-primary-10 flex items-center justify-center text-3xl;
        }
      }

      .detail {
        @apply text-primary dark-text-primary-10;
        @apply flex flex-col;

        .name {
          @apply text-lg font-bold;
        }

        .motto {
          @apply text-base text-primary-4 dark-text-primary-8;
        }
      }
    }
  }
}
</style>

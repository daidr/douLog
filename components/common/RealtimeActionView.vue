<script setup lang="ts">
import { useTimeAgoOptions } from '~/composables/i18n'
import { useDouSlackingStore } from '~/stores/dou-slacking'
import MusicIcon from '~icons/mingcute/music-2-line'

const { t } = useI18n()

const douSlackingStore = useDouSlackingStore()

const { language } = useNavigatorLanguage()

// 设置国际化时间Option
const localTimeOption: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  // 上海时间
  timeZone: 'Asia/Shanghai',
  timeZoneName: 'short',
}

const localTime = ref('')

const localTimeInterval = setInterval(() => {
  const time = new Date()
  const formattedTime = Intl.DateTimeFormat(
    language.value,
    localTimeOption,
  ).format(time)
  localTime.value = formattedTime
}, 1000)

onUnmounted(() => {
  clearInterval(localTimeInterval)
})
</script>

<template>
  <div v-if="douSlackingStore.connected" class="realtime-wrapper">
    <div v-if="douSlackingStore.stats.media_playing" class="music-icon">
      <MusicIcon />
    </div>
    <div class="icon" :class="[`icon-${douSlackingStore.stats.iconType}`]">
      <Transition name="blur-fade">
        <template v-if="douSlackingStore.stats.icon?.endsWith('.png')">
          <img
            :key="douSlackingStore.stats.icon"
            :src="`https://dou-slacking.daidr.me/public/icons/${douSlackingStore.stats.icon}`"
            :alt="douSlackingStore.stats.text"
          >
        </template>
        <template v-else>
          <div>
            {{ douSlackingStore.stats.icon }}
          </div>
        </template>
      </Transition>
    </div>
    <div class="tips">
      <div class="status-wrapper">
        <p v-if="!douSlackingStore.stats.idle" class="text-sm text-primary">
          {{ t('dou_slacking.doing') }} <b>{{ t(`dou_slacking.status.${douSlackingStore.stats.text}`) }}</b>
        </p>
        <p v-else class="text-xs text-right text-primary">
          {{ t('dou_slacking.resting') }}
        </p>
        <p v-if="isHydrated" class="text-xs text-right text-primary">
          {{ useTimeAgo(() => douSlackingStore.stats.update, useTimeAgoOptions()).value }}
        </p>
      </div>
      <div v-if="douSlackingStore.stats.media_playing" class="split-line" />
      <div v-if="douSlackingStore.stats.media_playing" class="media-wrapper">
        <div class="thumbnail">
          <img
            v-if="douSlackingStore.mediaInfo.thumbnail"
            :src="douSlackingStore.mediaInfo.thumbnail"
          >
          <div v-else>
            <MusicIcon />
          </div>
        </div>
        <div class="media-info">
          <div class="title">
            {{ douSlackingStore.mediaInfo.title }}
          </div>
          <div class="artist">
            {{ douSlackingStore.mediaInfo.artist }}
          </div>
          <div class="time">
            {{ douSlackingStore.stats.media_curr }} /
            {{ douSlackingStore.stats.media_total }}
          </div>
        </div>
      </div>
      <div class="split-line" />
      <div>
        <p class="text-xs text-primary text-right">
          <span class="text-xs">{{ t('dou_slacking.local_time') }}</span>
          <br>
          <b class="important-font-mono">{{ localTime }}</b>
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes shake {
  0% {
    transform: scale(1);
    opacity: 0;
  }
  10% {
    opacity: 0.5;
  }
  50%,
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}
.realtime-wrapper {
  @apply relative;

  .music-icon {
    @apply absolute z-11 -top-1 -right-1;
    @apply flex items-center justify-center;
    @apply w-13px h-13px text-primary-text p-1px;
    @apply bg-light dark-bg-dark rounded-full ring-1 ring-primary-text;
  }

  .icon {
    @apply relative;

    & > img,
    & > div {
      @apply relative z-10 pointer-events-none;
    }

    & > div {
      @apply flex items-center justify-center;
      @apply bg-primary-2 dark-bg-primary-4;
    }

    &::before {
      @apply absolute content-empty top-0 left-0 right-0 bottom-0 ring-1.5 ring-current z-0;
      animation: shake 2s infinite;
    }

    &.icon-rect {
      &,
      img,
      div {
        @apply w-8 h-8;
        @apply rounded-lg;
      }

      &::before {
        @apply rounded-lg text-primary-2 dark-text-primary-7;
      }
    }

    &.icon-circle {
      &,
      img,
      div {
        @apply w-8 h-8;
        @apply rounded-full;
      }

      &::before {
        @apply rounded-full text-primary-2 dark-text-primary-7;
      }
    }

    &.icon-point {
      @apply w-4 h-4;
      @apply rounded-full;
      @apply bg-green-6;

      &::before {
        @apply rounded-full text-green-6;
      }
    }
  }

  .tips {
    @apply pointer-events-none select-none;
    @apply absolute mt-1 right-0 whitespace-nowrap p-2;
    @apply bg-light dark-bg-dark rounded-xl;
    @apply ring-primary-1 dark-ring-primary-4 ring-1;
    @apply shadow-lg general-shadow;
    @apply opacity-0 transform-gpu translate-y-10 scale-140 blur-xl;
    @apply transition-all duration-500;

    .split-line {
      @apply w-full h-2px my-2 rounded-3px;
      @apply bg-primary-1 dark-bg-primary-3;
    }
  }

  &:hover {
    .tips {
      @apply pointer-events-auto;
      @apply opacity-100 scale-100 blur-0 translate-y-0;
    }
  }

  .media-wrapper {
    @apply flex;

    .thumbnail {
      @apply bg-primary-4 text-white;
      @apply rounded-lg;
      @apply border-3 border-primary-1 dark-border-primary-2;
      img {
        @apply rounded-lg;
      }
      div {
        @apply flex items-center justify-center;
        @apply h-full w-full;
      }
      @apply w-3.25em h-3.25em mr-1;
    }

    .media-info {
      @apply flex flex-col items-start pointer-events-none;

      & > * {
        @apply text-xs text-right text-primary max-w-10em;
        @apply whitespace-nowrap overflow-hidden text-ellipsis;
      }

      .title {
        @apply font-bold text-sm;
      }

      .time {
        @apply self-end opacity-50;
      }
    }
  }
}
</style>

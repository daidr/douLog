<script setup lang="ts">
import { useDouSlackingStore } from '~/stores/dou-slacking'

const douSlackingStore = useDouSlackingStore()

const currentTime = ref(0)

setInterval(() => {
  currentTime.value = Date.now()
}, 1000)

const friendTimeString = computed(() => {
  const time = new Date(currentTime.value)
  const prevTime = new Date(douSlackingStore.stats.update)
  const diff = time.getTime() - prevTime.getTime()
  const diffDays = Math.floor(diff / (24 * 3600 * 1000))
  const diffHours = Math.floor(diff / (3600 * 1000))
  const diffMinutes = Math.floor(diff / (60 * 1000))
  const diffSeconds = Math.floor(diff / 1000)
  if (diffDays > 0) {
    return `${diffDays}天前`
  } else if (diffHours > 0) {
    return `${diffHours}小时前`
  } else if (diffMinutes > 0) {
    return `${diffMinutes}分钟前`
  } else if (diffSeconds > 0) {
    return `${diffSeconds}秒前`
  } else {
    return '刚刚'
  }
})
</script>

<template>
  <div v-if="douSlackingStore.connected" class="realtime-wrapper">
    <div class="icon" :class="[`icon-${douSlackingStore.stats.iconType}`]">
      <template v-if="douSlackingStore.stats.icon?.endsWith('.png')">
        <img
          :src="`https://dou-slacking.daidr.me/public/icons/${douSlackingStore.stats.icon}`"
          alt=""
        />
      </template>
      <template v-else>
        <div>
          {{ douSlackingStore.stats.icon }}
        </div>
      </template>
    </div>
    <div class="tips">
      <p v-if="!douSlackingStore.stats.idle" class="text-sm text-primary">
        戴兜正在 <b>{{ douSlackingStore.stats.text }}</b>
      </p>
      <p v-else class="text-xs text-right text-primary">戴兜正在休息</p>
      <p class="text-xs text-right text-primary">
        {{ friendTimeString }}
      </p>
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

  .icon {
    @apply relative;

    & > img,
    & > div {
      @apply relative z-10 pointer-events-none;
    }

    & > div {
      @apply flex items-center justify-center;
      @apply bg-primary-light;
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
        @apply rounded-lg text-primary-light;
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
        @apply rounded-full text-primary-light;
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
    @apply pointer-events-none;
    @apply absolute mt-1 right-0 whitespace-nowrap p-2;
    @apply bg-white rounded-xl;
    @apply ring-primary-extralight ring-1;
    @apply shadow-lg shadow-primary-extralight;
    @apply opacity-0 transform-gpu translate-y-10 scale-140 blur-xl;
    @apply transition-all duration-500;
  }

  &:hover {
    .tips {
      @apply pointer-events-auto;
      @apply opacity-100 scale-100 blur-0 translate-y-0;
    }
  }
}
</style>

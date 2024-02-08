<script setup lang="ts">
defineProps({
  hoverable: {
    type: Boolean,
    default: false,
  },
  size: {
    type: Number,
    default: 152,
  },
  stroke: {
    type: Number,
    default: 10,
  },
})

const sqrt2 = Math.sqrt(2)

function path(d: string) {
  return `path('${d.replace(/\s+/g, ' ').trim()}')`
}

const currentAvatarIndex = useState('avatar-state', () => {
  // random 0 1 2
  return Math.floor(Math.random() * 3)
})

const onClick = useThrottleFn(() => {
  currentAvatarIndex.value = (currentAvatarIndex.value + 1) % 3
}, 500)
</script>

<template>
  <div
    class="avatar"
    :class="{ hoverable }"
    :style="{
      '--custom-size': `${size}px`,
      '--custom-stroke': `${stroke}px`,
      '--custom-clip-path': path(`
        M -30 -${size / 2}
        L -30 ${size / 2 / sqrt2 + size / 2}
        L ${(size / 2) * (1 - 1 / sqrt2)} ${size / 2 / sqrt2 + size / 2}
        A ${size / 2} ${size / 2} 0 0 0 ${
        size - (size / 2) * (1 - 1 / sqrt2)
      } ${size / 2 / sqrt2 + size / 2}
        L ${size + 30} ${size / 2 / sqrt2 + size / 2}
        L ${size + 30} -${size / 2}
        Z`),
    }"
    @click="onClick"
  >
    <svg
      :view-box="`0 0 ${size + 2 * stroke} ${size + 2 * stroke}`"
      :width="`${size + 2 * stroke}px`"
      :height="`${size + 2 * stroke}px`"
    >
      <circle
        :cx="`${size / 2 + stroke}px`"
        :cy="`${size / 2 + stroke}px`"
        :r="size / 2 + stroke / 2"
        :stroke-width="stroke"
        class="stroke-primary-light"
        fill="none"
      />
    </svg>
    <Transition name="blur-fade" :duration="500">
      <div v-if="currentAvatarIndex === 0" class="avatar-0">
        <div class="avatar-image">
          <UiLazyImage src="/images/avatar.png" alt="AVATAR" />
        </div>
        <img
          class="avatar-decoration avatar-decoration-1"
          src="/images/avatar_d1.png"
        >
        <img
          class="avatar-decoration avatar-decoration-2"
          src="/images/avatar_d2.png"
        >
        <img
          class="avatar-decoration avatar-decoration-3"
          src="/images/avatar_d3.png"
        >
        <img
          class="avatar-decoration avatar-decoration-4"
          src="/images/avatar_d4.png"
        >
      </div>
      <div v-else-if="currentAvatarIndex === 1" class="avatar-1">
        <div class="avatar-image">
          <UiLazyImage
            src="/images/extra-avatar/amazed/avatar_d0.png"
            alt="AVATAR"
          />
        </div>
        <img
          class="avatar-decoration avatar-decoration-1"
          src="/images/extra-avatar/amazed/avatar_d1.png"
        >
        <img
          class="avatar-decoration avatar-decoration-2"
          src="/images/extra-avatar/amazed/avatar_d2.png"
        >
        <img
          class="avatar-decoration avatar-decoration-3"
          src="/images/extra-avatar/amazed/avatar_d3.png"
        >
        <img
          class="avatar-decoration avatar-decoration-4"
          src="/images/extra-avatar/amazed/avatar_d4.png"
        >
      </div>
      <div v-else-if="currentAvatarIndex === 2" class="avatar-2">
        <div class="avatar-image">
          <UiLazyImage
            src="/images/extra-avatar/sad/avatar_d0.png"
            alt="AVATAR"
          />
        </div>
        <img
          class="avatar-decoration avatar-decoration-1"
          src="/images/extra-avatar/sad/avatar_d1.png"
        >
        <img
          class="avatar-decoration avatar-decoration-2"
          src="/images/extra-avatar/sad/avatar_d2.png"
        >
        <img
          class="avatar-decoration avatar-decoration-3"
          src="/images/extra-avatar/sad/avatar_d3.png"
        >
        <img
          class="avatar-decoration avatar-decoration-4"
          src="/images/extra-avatar/sad/avatar_d4.png"
        >
      </div>
    </Transition>
  </div>
</template>

<style scoped lang="scss">
.avatar {
  @apply select-none;
  @apply relative;
  @apply w-[var(--custom-size)] h-[var(--custom-size)];

  &.hoverable {
    @apply pointer-events-none;
  }

  svg {
    @apply absolute top-0 left-0;
    @apply transform-gpu pointer-events-none;
    @apply translate-x-[calc(var(--custom-stroke)*-1)] translate-y-[calc(var(--custom-stroke)*-1)];
  }

  .avatar-image {
    @apply w-full h-full overflow-visible;
    clip-path: var(--custom-clip-path);

    :deep(.lazy-image) {
      @apply transform-gpu transition-transform;
      @apply duration-650 pointer-events-none;
      transition-timing-function: cubic-bezier(0.36, 1.1, 0.2, 1.2) !important;
    }
  }

  .avatar-decoration {
    @apply absolute transform-gpu transition duration-650 pointer-events-none;
    transition-timing-function: cubic-bezier(0.36, 1.1, 0.2, 1.2) !important;
  }

  .avatar-0 {
    .avatar-image :deep(.lazy-image) {
      @apply scale-125 translate-y-[calc(-1*var(--custom-size)/15)];
    }

    .avatar-decoration {
      &-1 {
        @apply w-[calc(var(--custom-size)/4)] h-[calc(var(--custom-size)/4)];
        @apply -top-15% -left-15% opacity-0;
      }

      &-2 {
        @apply w-[calc(var(--custom-size)/8)];
        @apply bottom-15% -right-10%;
      }

      &-3 {
        @apply w-[calc(var(--custom-size)/5)];
        @apply -bottom-5% -left-15%;
      }

      &-4 {
        @apply w-[calc(var(--custom-size)/4)];
        @apply -bottom-22% right-0;
      }
    }
  }

  .avatar-1 {
    .avatar-image :deep(.lazy-image) {
      @apply scale-125 translate-y-[calc(-1*var(--custom-size)/10)];
    }

    .avatar-decoration {
      &-1 {
        @apply w-[calc(var(--custom-size)/3)] h-[calc(var(--custom-size)/3)];
        @apply -top-15% -left-15% opacity-0;
      }

      &-2 {
        @apply w-[calc(var(--custom-size)/8)];
        @apply -top-15% -right-15%;
      }

      &-3 {
        @apply w-[calc(var(--custom-size)/7)];
        @apply bottom-5% -left-5%;
      }

      &-4 {
        @apply w-[calc(var(--custom-size)/6)];
        @apply -bottom-5% right-0;
      }
    }
  }

  .avatar-2 {
    .avatar-image :deep(.lazy-image) {
      @apply scale-125 translate-y-[calc(-1*var(--custom-size)/10)];
    }

    .avatar-decoration {
      &-1 {
        @apply w-[calc(var(--custom-size)/7)] h-[calc(var(--custom-size)/7)];
        @apply -top-15% -left-15%;
      }

      &-2 {
        @apply w-[calc(var(--custom-size)/5)];
        @apply -top-25% -right-15% opacity-0;
      }

      &-3 {
        @apply w-[calc(var(--custom-size)/5)];
        @apply bottom-5% -left-15% rotate-[-180deg] duration-1000;
      }

      &-4 {
        @apply w-[calc(var(--custom-size)/6)];
        @apply -bottom-10% right-0 rotate-[-10deg];
      }
    }
  }

  &:hover {
    .avatar-0 {
      :deep(.lazy-image) {
        @apply scale-135 translate-y-[calc(-1*var(--custom-size)/7)];
      }

      .avatar-decoration-1 {
        @apply translate-[-30%] opacity-100;
      }

      .avatar-decoration-2 {
        @apply translate-y-[-30%];
      }

      .avatar-decoration-3 {
        @apply translate-y-[-10%];
      }

      .avatar-decoration-4 {
        @apply translate-y-[-10%];
      }
    }

    .avatar-1 {
      :deep(.lazy-image) {
        @apply scale-135 translate-y-[calc(-1*var(--custom-size)/7)];
      }

      .avatar-decoration-1 {
        @apply translate-[-30%] opacity-100;
      }

      .avatar-decoration-2 {
        @apply translate-y-[-30%];
      }

      .avatar-decoration-3 {
        @apply translate-y-[-10%];
      }

      .avatar-decoration-4 {
        @apply translate-y-[-10%];
      }
    }

    .avatar-2 {
      :deep(.lazy-image) {
        @apply scale-135 translate-y-[calc(-1*var(--custom-size)/7)];
      }

      .avatar-decoration-1 {
        @apply translate-[-30%];
      }

      .avatar-decoration-2 {
        @apply translate-y-[30%] opacity-100;
      }

      .avatar-decoration-3 {
        @apply translate-y-[-10%] rotate-[100deg];
      }

      .avatar-decoration-4 {
        @apply translate-y-[-10%] rotate-[180deg];
      }
    }
  }
}
</style>

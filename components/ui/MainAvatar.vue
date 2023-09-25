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

const path = (d: string) => {
  return `path('${d.replace(/\s+/g, ' ').trim()}')`
}
</script>

<template>
  <div
    class="avatar"
    :class="{ hoverable: hoverable }"
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
      ></circle>
    </svg>
    <div class="avatar-image">
      <UiLazyImage src="/images/avatar.png" alt="AVATAR" />
    </div>
    <img
      class="avatar-decoration avatar-decoration-1"
      src="/images/avatar_d1.png"
    />
    <img
      class="avatar-decoration avatar-decoration-2"
      src="/images/avatar_d2.png"
    />
    <img
      class="avatar-decoration avatar-decoration-3"
      src="/images/avatar_d3.png"
    />
    <img
      class="avatar-decoration avatar-decoration-4"
      src="/images/avatar_d4.png"
    />
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

  .avatar-image {
    @apply w-full h-full overflow-visible;
    clip-path: var(--custom-clip-path);

    :deep(.lazy-image) {
      @apply transform-gpu transition-transform;
      @apply scale-125 translate-y-[calc(-1*var(--custom-size)/15)];
      @apply duration-650 pointer-events-none;
      transition-timing-function: cubic-bezier(0.36, 1.1, 0.2, 1.2) !important;
    }
  }

  svg {
    @apply absolute top-0 left-0;
    @apply transform-gpu pointer-events-none;
    @apply translate-x-[calc(var(--custom-stroke)*-1)] translate-y-[calc(var(--custom-stroke)*-1)];
  }

  .avatar-decoration {
    @apply absolute transform-gpu transition duration-650 pointer-events-none;
    transition-timing-function: cubic-bezier(0.36, 1.1, 0.2, 1.2) !important;

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

  &:hover {
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
}
</style>

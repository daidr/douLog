<script setup lang="ts">
defineProps({
  hoverable: {
    type: Boolean,
    default: false,
  },
  size: {
    type: Number,
    default: 172,
  },
  stroke: {
    type: Number,
    default: 10,
  },
})

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
        M 0 -${size / 2}
        L 0 ${size / 2 - stroke}
        A ${size / 2 - stroke} ${size / 2 - stroke} 0 0 0 ${
        size - stroke * 2
      } ${size / 2 - stroke}
        L ${size - stroke * 2} -${size / 2}
        Z`),
    }"
  >
    <svg
      :view-box="`0 0 ${size} ${size}`"
      :width="`${size}px`"
      :height="`${size}px`"
    >
      <circle
        :cx="`${size / 2}px`"
        :cy="`${size / 2}px`"
        :r="(size - stroke) / 2"
        :stroke-width="stroke"
        class="stroke-primary-light"
        fill="none"
      ></circle>
    </svg>
    <UiLazyImage src="/images/avatar.png" alt="AVATAR" />
  </div>
</template>

<style scoped lang="scss">
.avatar {
  @apply select-none;
  @apply relative;
  --calc-size: calc(var(--custom-size) - 2 * var(--custom-stroke));
  @apply w-[var(--calc-size)] h-[var(--calc-size)];

  &.hoverable {
    @apply pointer-events-none;
  }

  :deep(.lazy-image) {
    @apply w-full h-full overflow-visible;
    clip-path: var(--custom-clip-path);

    img {
      @apply transform-gpu transition-transform;
      //   @apply  scale-130 translate-y-[calc(var(--custom-size)/20)];
      @apply scale-125 translate-y-[calc(-1*var(--custom-size)/15)];
      @apply duration-650 pointer-events-none;
      transition-timing-function: cubic-bezier(0.36, 1.1, 0.2, 1.2);
    }

    &:hover img {
      @apply scale-145;
    }
  }

  svg {
    @apply absolute top-0 left-0;
    @apply transform-gpu pointer-events-none;
    @apply translate-x-[calc(var(--custom-stroke)*-1)] translate-y-[calc(var(--custom-stroke)*-1)];
  }
}
</style>

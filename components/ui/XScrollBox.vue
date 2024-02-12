<script setup>
const showStartShadow = ref(false)
const showEndShadow = ref(true)

function onScroll(e) {
  const { scrollLeft, scrollWidth, clientWidth } = e.target
  showStartShadow.value = scrollLeft > 0
  showEndShadow.value = scrollWidth - scrollLeft > clientWidth
}
</script>

<template>
  <div
    class="x-scroll-container" :class="{
      'start-shadow': showStartShadow,
      'end-shadow': showEndShadow,
    }" @scroll.passive="onScroll"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
.x-scroll-container {
  @apply overflow-x-auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--color-primary), 0.8) rgb(var(--color-primary-1));

  --show-start-mask: 0;
  --show-end-mask: 0;
  --mask-size: 24px;
  --gradient: linear-gradient(to right, transparent 0%, white calc(var(--show-start-mask) * var(--mask-size)), white calc(100% - calc(var(--mask-size)*var(--show-end-mask))), transparent 100%);
  -webkit-mask: var(--gradient);
  mask: var(--gradient);

  &.start-shadow {
    --show-start-mask: 1;
  }

  &.end-shadow {
    --show-end-mask: 1;
  }

  // 滚动条
  &::-webkit-scrollbar {
    @apply h-2;
  }

  &::-webkit-scrollbar-thumb {
    @apply bg-primary-5;
    @apply rounded-full;
  }

  &::-webkit-scrollbar-track {
    @apply bg-primary-1;
    @apply rounded-full;
  }
}
</style>

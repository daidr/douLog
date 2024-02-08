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
  <div class="x-overflow-box">
    <Transition name="fade">
      <div v-if="showStartShadow" class="start-shadow" />
    </Transition>
    <Transition name="fade">
      <div v-if="showEndShadow" class="end-shadow" />
    </Transition>
    <div class="x-scroll-container x-scroll-box" @scroll.passive="onScroll">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.x-overflow-box {
  @apply overflow-hidden relative;

  .start-shadow {
    @apply absolute left-0 top-0 bottom-2 w-6 z-10;
    @apply bg-gradient-to-l from-transparent to-white;
    @apply pointer-events-none;
  }

  .end-shadow {
    @apply absolute right-0 top-0 bottom-2 w-6 z-10;
    @apply bg-gradient-to-r from-transparent to-white;
    @apply pointer-events-none;
  }

  .x-scroll-container {
    @apply overflow-x-auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(var(--color-primary), 0.8)
      rgb(var(--color-primary-light));

    // 滚动条
    &::-webkit-scrollbar {
      @apply h-1.5;
    }

    &::-webkit-scrollbar-thumb {
      @apply bg-primary/80;
      @apply rounded-full;
    }

    &::-webkit-scrollbar-track {
      @apply bg-primary-light;
      @apply rounded-full;
    }
  }
}
</style>

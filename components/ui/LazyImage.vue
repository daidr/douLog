<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'

defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  thumbnail: {
    type: String,
    default: '',
  },
})

const LazyImageContainerEl = ref()

const initTime = Date.now()

const loaded = ref(false)

const noAnimation = ref(false)

const onLoad = () => {
  if (Date.now() - initTime < 10) {
    noAnimation.value = true
  }
  loaded.value = true
}

const targetIsVisible = ref(false)

const { stop } = useIntersectionObserver(
  LazyImageContainerEl,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      targetIsVisible.value = true
      stop()
    }
  },
)
</script>

<template>
  <div ref="LazyImageContainerEl" class="lazy-image">
    <img
      v-if="targetIsVisible"
      class="img"
      :class="{
        loaded,
        'no-animation': noAnimation,
      }"
      :src="src"
      :alt="alt"
      :crossorigin="isDev() ? undefined : 'anonymous'"
      @load="onLoad"
    />
    <img
      v-if="thumbnail && !loaded"
      class="thumbnail"
      :src="thumbnail"
      :alt="alt"
      :crossorigin="isDev() ? undefined : 'anonymous'"
    />
  </div>
</template>

<style scoped lang="scss">
.lazy-image {
  @apply w-full h-full overflow-hidden;

  .img {
    @apply opacity-0 w-full h-full;
    @apply absolute;

    &:not(.no-animation) {
      @apply transition-opacity duration-300;
    }

    &.loaded {
      @apply opacity-100;
      @apply static;
    }

    &.no-animation {
      @apply opacity-100;
    }
  }

  .thumbnail {
    @apply w-full h-full;
  }
}
</style>

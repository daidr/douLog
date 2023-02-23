<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { ref } from 'vue'

defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
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
  }
)
</script>

<template>
  <div ref="LazyImageContainerEl" class="lazy-image">
    <nuxt-img
      v-if="targetIsVisible"
      :class="{
        loaded,
        'no-animation': noAnimation,
      }"
      :src="src"
      :alt="alt"
      @load="onLoad"
    />
  </div>
</template>

<style scoped lang="scss">
.lazy-image {
  @apply w-full h-full overflow-hidden;

  img {
    @apply opacity-0 w-full h-full;

    &.loaded:not(.no-animation) {
      animation: opacity-transition 0.15s ease-in-out forwards;
    }

    &.no-animation {
      @apply opacity-100;
    }
  }
}

@keyframes opacity-transition {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>

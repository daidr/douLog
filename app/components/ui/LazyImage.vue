<script setup lang="ts">
import { useIntersectionObserver } from '@vueuse/core'
import { decode } from 'blurhash'

const props = defineProps({
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
  /** BlurHash 字符串：图片加载前显示的渐进式模糊占位 */
  blurhash: {
    type: String,
    default: '',
  },
})

const LazyImageContainerEl = ref()

const initTime = Date.now()

const loaded = ref(false)

const noAnimation = ref(!!props.thumbnail)

function onLoad() {
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

// BlurHash → data URL：canvas 解码只能在客户端做（SSR 无 canvas），
// 因此占位在 hydrate 后出现；封面本就懒加载，影响可忽略。非法 hash 静默跳过。
const blurDataUrl = ref<string | null>(null)
function computeBlur() {
  if (!props.blurhash || typeof document === 'undefined') {
    return
  }
  try {
    const size = 32
    const pixels = decode(props.blurhash, size, size)
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }
    const imageData = ctx.createImageData(size, size)
    imageData.data.set(pixels)
    ctx.putImageData(imageData, 0, 0)
    blurDataUrl.value = canvas.toDataURL()
  }
  catch {
    // 非法 blurhash：忽略，不显示占位
  }
}
onMounted(computeBlur)
</script>

<template>
  <div ref="LazyImageContainerEl" class="lazy-image">
    <div
      v-if="blurDataUrl && !loaded"
      class="blurhash"
      :style="{ backgroundImage: `url(${blurDataUrl})` }"
    />
    <img
      v-if="targetIsVisible"
      class="img"
      :class="{
        loaded,
        'no-animation': noAnimation,
      }"
      :src="src"
      :alt="alt"
      @load="onLoad"
    >
    <img
      v-if="thumbnail && !loaded"
      class="thumbnail"
      :src="thumbnail"
      :alt="alt"
    >
  </div>
</template>

<style scoped lang="scss">
.lazy-image {
  @apply w-full h-full overflow-hidden relative;

  .blurhash {
    @apply absolute inset-0 w-full h-full pointer-events-none;
    background-size: cover;
    background-position: center;
  }

  .img {
    @apply opacity-0 w-full h-full;
    @apply absolute pointer-events-none;

    &:not(.no-animation) {
      @apply transition-opacity duration-300;
    }

    &.loaded {
      @apply opacity-100;
      @apply static pointer-events-auto;
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

<script setup lang="ts">
import IconArrowUp from '~icons/mingcute/up-fill'

const props = defineProps<{
  showProcess: boolean
  scrollEl: string
  boundingEl?: string
}>()

function toTop() {
  document.querySelector(props.scrollEl)?.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const pathTotalLength = ref(148)
const pathCurrentLength = ref(0)

function setPathTotalLength(length: number) {
  pathTotalLength.value = length
}

const { y: scrollY } = useScroll(
  document.querySelector(props.scrollEl) as HTMLElement,
)

if (props.showProcess && props.boundingEl) {
  const { y, height } = useElementBounding(
    document.querySelector(props.boundingEl) as HTMLElement,
  )

  const scrollThrottle = useThrottleFn((newVal) => {
    const totalHeight = height.value
    const clientHeight
      = document.querySelector(props.scrollEl)?.clientHeight || 0

    pathCurrentLength.value
      = (newVal / (totalHeight - clientHeight) + 1) * pathTotalLength.value
    if (pathCurrentLength.value > pathTotalLength.value - 1) {
      pathCurrentLength.value = pathTotalLength.value - 1
    } else if (pathCurrentLength.value < 0) {
      pathCurrentLength.value = 0
    }
  }, 10)

  watch(y, scrollThrottle, { immediate: true })
}
</script>

<template>
  <Transition name="fade">
    <div v-if="scrollY > 5" class="to-top-wrapper">
      <div class="to-top-button" @click="toTop">
        <svg v-if="showProcess" class="process-bar" view-box="0 0 48 48">
          <UiStrokedRoundedRect
            :class="{ hide: pathCurrentLength >= pathTotalLength - 1 }"
            :style="{
              strokeDashoffset: pathCurrentLength,
              strokeDasharray: `${pathTotalLength}px ${pathTotalLength}px`,
            }"
            :set-path-total-length="setPathTotalLength"
            :width="48"
            :height="48"
            :stroke-width="5"
            :radius="16"
          />
        </svg>
        <IconArrowUp width="1.5rem" height="1.5rem" />
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.to-top-wrapper {
  @apply fixed bottom-8 right-8 w-50px h-50px;
  @apply lg:(bottom-20 right-20);

  .to-top-button {
    @apply relative rounded-2xl bg-light dark-bg-dark w-12 h-12;
    @apply flex items-center justify-center text-2xl text-primary;
    @apply shadow-md general-shadow cursor-pointer;
    @apply transition-all;
    @apply rounded-2xl;
    filter: drop-shadow(0 0 1px rgb(var(--color-primary-light)));

    &:hover {
      @apply shadow-xl general-shadow;
      @apply bg-primary;
      @apply text-primary-1 dark-text-primary-9;

      & .process-bar path {
        @apply stroke-primary-1 dark-stroke-primary-9;
      }
    }

    .process-bar {
      @apply absolute -top-0 left-0;
      @apply w-full h-full;

      path {
        @apply stroke-primary fill-none;
        // path端点圆角
        @apply stroke-cap-round transition-colors;

        &.hide {
          @apply opacity-0;
        }
      }
    }
  }
}
</style>

<script setup lang="ts">
import IconArrowUp from '~icons/uil/arrow-up'

const props = defineProps<{
  showProcess: boolean
  scrollEl: string
  boundingEl?: string
}>()

const toTop = () => {
  document.querySelector(props.scrollEl)?.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const pathTotalLength = 148
const pathThresholdValue = -pathTotalLength + 1
const pathCurrentLength = ref(-148)

const { y: scrollY } = useScroll(
  document.querySelector(props.scrollEl) as HTMLElement
)

if (props.showProcess && props.boundingEl) {
  const { y, height } = useElementBounding(
    document.querySelector(props.boundingEl) as HTMLElement
  )

  const scrollThrottle = useThrottleFn(newVal => {
    const totalHeight = height.value
    const clientHeight =
      document.querySelector(props.scrollEl)?.clientHeight || 0

    pathCurrentLength.value =
      -pathTotalLength +
      (-newVal / (totalHeight - clientHeight)) * pathTotalLength
  }, 10)

  watch(y, scrollThrottle, { immediate: true })
}
</script>

<template>
  <Transition name="fade">
    <div v-if="scrollY > 5" class="to-top-wrapper">
      <div class="to-top-button" @click="toTop">
        <svg v-if="showProcess" class="process-bar" view-box="0 0 48 48">
          <path
            :class="{ hide: pathCurrentLength <= pathThresholdValue }"
            :style="{ strokeDashoffset: pathCurrentLength }"
            d="M45.467,14.3C45.467,11.117 44.203,8.065 41.952,5.815C39.702,3.564 36.649,2.3 33.467,2.3C27.506,2.3 20.323,2.3 14.363,2.3C11.18,2.3 8.128,3.564 5.878,5.815C3.627,8.065 2.363,11.117 2.363,14.3C2.363,20.315 2.363,27.58 2.363,33.596C2.363,36.778 3.627,39.831 5.878,42.081C8.128,44.332 11.18,45.596 14.363,45.596C20.323,45.596 27.506,45.596 33.467,45.596C36.649,45.596 39.702,44.332 41.952,42.081C44.203,39.831 45.467,36.778 45.467,33.596C45.467,27.58 45.467,20.315 45.467,14.3Z"
          />
        </svg>
        <IconArrowUp />
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.to-top-wrapper {
  @apply fixed bottom-8 right-8 w-50px h-50px;
  @apply lg:(bottom-20 right-20);

  .to-top-button {
    @apply relative rounded-2xl bg-white w-12 h-12;
    @apply flex items-center justify-center text-2xl text-primary;
    @apply shadow-md shadow-primary/5 cursor-pointer;
    @apply transition-all;
    @apply rounded-2xl;
    filter: drop-shadow(0 0 0.5px rgb(var(--color-primary-medium)));

    &:hover {
      @apply shadow-xl shadow-primary/15;
      @apply bg-primary;
      @apply text-primary-extralight;

      & .process-bar path {
        @apply stroke-primary-extralight;
      }
    }

    .process-bar {
      @apply absolute -top-0 left-0;
      @apply w-full h-full;

      path {
        @apply stroke-primary stroke-5 fill-none;
        // path端点圆角
        @apply stroke-cap-round transition-colors;
        transform-origin: center;
        transform: rotate(-90deg);
        stroke-dasharray: 200px 148px;

        &.hide {
          @apply opacity-0;
        }
      }
    }
  }
}
</style>

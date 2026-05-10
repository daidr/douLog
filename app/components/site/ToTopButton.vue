<script setup lang="ts">
import IconArrowUp from '~icons/mingcute/up-fill'

const props = defineProps<{
  showProcess: boolean
  scrollEl: string
  boundingEl?: string
}>()

const scrollY = ref(0)
const pathTotalLength = ref(148)
const pathCurrentLength = ref(0)

function setPathTotalLength(length: number) {
  pathTotalLength.value = length
}

let scrollTarget: HTMLElement | null = null
let boundingTarget: HTMLElement | null = null

function refreshScrollY() {
  scrollY.value = scrollTarget?.scrollTop ?? 0
}

function refreshProcess() {
  // 进度环驱动量：boundingEl 相对 viewport 的 top（rect.top）。
  //   - 一开始 boundingEl 还在 scrollTarget 内可见时 → rect.top >= 0 → 整个表达式
  //     大于 1*total → clamp 到 (total - 1) → `.hide` 类隐藏环
  //   - 容器滚动后 boundingEl 顶部移出 viewport → rect.top 变负 → 表达式落到
  //     [0, total-1] 区间 → strokeDashoffset 从大变小，环从无到全
  //   - boundingEl 完全滚过去 → rect.top ≈ -(rect.height - clientHeight) → 表达式
  //     ≈ 0 → 环填满
  // 用 rect.top 而不是 scrollTarget.scrollTop 是因为 boundingEl 通常不是
  // scrollTarget 自身（这里是文章主体容器 .blog-article-wrapper），它在容器内
  // 起始有自己的 offset，不能用整页 scrollTop 替代。
  if (!props.showProcess || !boundingTarget || !scrollTarget) return
  const rect = boundingTarget.getBoundingClientRect()
  const totalHeight = rect.height
  const y = rect.top
  const clientHeight = scrollTarget.clientHeight
  const denom = Math.max(1, totalHeight - clientHeight)
  let next = (y / denom + 1) * pathTotalLength.value
  if (next > pathTotalLength.value - 1) next = pathTotalLength.value - 1
  if (next < 0) next = 0
  pathCurrentLength.value = next
}

function onScroll() {
  refreshScrollY()
  refreshProcess()
}

function toTop() {
  scrollTarget?.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 在 onMounted 里再取 DOM。这是相对原版 setup 阶段直接 querySelector 的关键
 * 修复点：原版假设父级 `.articles-page-wrapper` 在 setup 时就已挂载，但本组件
 * 包在 `<ClientOnly><Teleport to="body">` 里，client hydrate 时间序很微妙——
 * 一旦 querySelector 拿到 null，useScroll 就永远监听不到 scroll，按钮不出现。
 *
 * 这里把订阅推迟到 onMounted（此时父 layout 一定已 hydrate），并用原生
 * `scroll` 事件 + ResizeObserver 兜底，行为简单可控。
 */
onMounted(() => {
  scrollTarget = document.querySelector(props.scrollEl) as HTMLElement | null
  boundingTarget = props.boundingEl
    ? document.querySelector(props.boundingEl) as HTMLElement | null
    : null

  if (!scrollTarget) return

  refreshScrollY()
  refreshProcess()
  scrollTarget.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  scrollTarget?.removeEventListener('scroll', onScroll)
  scrollTarget = null
  boundingTarget = null
})
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
    @apply ring-1 ring-primary/10 dark-ring-primary-10/20;
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

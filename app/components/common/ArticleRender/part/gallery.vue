<script setup lang="ts">
import type { Element, ElementContent, RootContent } from 'hast'
import IconChevronLeft from '~icons/mingcute/left-line'
import IconChevronRight from '~icons/mingcute/right-line'

const props = defineProps<{ node: Element }>()

interface GalleryImage {
  src: string
  alt: string
}

/**
 * 从 hast 子树里收集所有 <img>，按文档顺序排列。
 *
 * markdown-it 默认会把每行单独的 ![](url) 包成 `<p><img></p>`，因此 gallery
 * 容器的直接子节点通常是 `<p>`，而不是 `<img>`。这里递归遍历收集所有图片，
 * 顺便容许作者偶尔在 gallery 内插入说明文字（不渲染，仅取图）。
 */
const images = computed<GalleryImage[]>(() => {
  const collected: GalleryImage[] = []
  const visit = (n: ElementContent | RootContent) => {
    if (n.type !== 'element') return
    if (n.tagName === 'img') {
      const src = (n.properties?.src as string | undefined) || ''
      const alt = (n.properties?.alt as string | undefined) || ''
      if (src) collected.push({ src, alt })
      return
    }
    if (n.children) n.children.forEach(visit)
  }
  props.node.children.forEach(visit)
  return collected
})

const currentIndex = ref(0)

watch(images, () => {
  if (currentIndex.value >= images.value.length) {
    currentIndex.value = 0
  }
})

function setIndex(i: number) {
  if (i < 0 || i >= images.value.length) return
  currentIndex.value = i
}

function step(delta: number) {
  const total = images.value.length
  if (total === 0) return
  // 循环切换：到末尾后跳回首张，更符合"看完一轮"的直觉
  currentIndex.value = (currentIndex.value + delta + total) % total
}

/**
 * 计算每张 slide 相对当前 index 的"位置类型"。
 *
 * 用类型而不是连续位移：active / prev / next / far，让 CSS 用类名直接控制
 * transform，便于离开屏幕的 slide 复用同一份 transform 表达。
 */
function relation(i: number): 'active' | 'prev' | 'next' | 'far' {
  if (i === currentIndex.value) return 'active'
  const total = images.value.length
  // 循环 carousel：当 currentIndex 是首/末时，把另一端视作相邻，让"循环切换"
  // 时也能展示对应方向上的相邻图片
  const distLeft = (currentIndex.value - i + total) % total
  const distRight = (i - currentIndex.value + total) % total
  if (distRight === 1) return 'next'
  if (distLeft === 1) return 'prev'
  return 'far'
}

// ────────────────────────────────────────────────────────────────────────
// stage 高度自适应
// ────────────────────────────────────────────────────────────────────────
//
// 设计意图：
//   - 每张图保持自身宽高比（slide 内 img width:100% + height:auto），各张
//     图实际渲染高度可能不同。
//   - stage 用 `position: relative` 做 absolute 子布局的锚，但本身高度需要
//     由"当前 active slide 的实际渲染高度"撑起来；切换时 height 走 CSS
//     transition，画面无突兀跳变。
//   - 由于 slide 是 absolute 的，stage 自身没有自然高度——必须 JS 测量。
//
// 实现细节：
//   - `stageHeight` 仅在 client 端设值；SSR 阶段 inline style 缺省，避免
//     hydration 比较时 server / client 不一致。
//   - 用 ResizeObserver 监听整个 stage 内部的尺寸变化（包括图片懒加载导致
//     的高度变化），永远以"当前 active slide 的 offsetHeight"为高度源。
const slideEls = ref<HTMLElement[]>([])
const stageEl = ref<HTMLElement | null>(null)
const stageHeight = ref<number | null>(null)

function setSlideRef(i: number) {
  return (el: any) => {
    if (!el) return
    // <Motion> 组件 ref 暴露的可能是组件实例（含 $el），也可能直接是 root
    // element；两种都兼容
    const dom: HTMLElement | null = el.$el ?? (el instanceof HTMLElement ? el : null)
    if (dom) slideEls.value[i] = dom
  }
}

/**
 * 计算每个 slide 在 motion-v 上的 animate 目标。
 *
 * 三个属性都用单值（数字 / percent string），让 motion-v 走自己的 spring
 * mixer（数字插值 + 单位保持），不要把 calc 表达式塞进 transform 字符串
 * ——motion 内部不会逐项解析 calc，那样会退回到 CSS transition。
 *
 * `x` 是 translateX，相对 slide 自身宽度（slide 自身是 stage 宽的 80%）：
 *   - active: -50%（中心对齐 stage 中央）
 *   - prev:   -50% - 19.4% = -69.4%（再向左偏移 19.4% slide-width
 *             ≈ 15.5% stage-width，使 prev 远端贴 stage 内边）
 *   - next:   -50% + 19.4% = -30.6%
 *   - far:    -50%（停在中央，靠 scale + opacity 把它"藏起来"）
 */
function targetVariant(rel: 'active' | 'prev' | 'next' | 'far') {
  switch (rel) {
    case 'active':
      return { x: '-50%', scale: 1, opacity: 1 }
    case 'prev':
      return { x: '-69.4%', scale: 0.85, opacity: 0.45 }
    case 'next':
      return { x: '-30.6%', scale: 0.85, opacity: 0.45 }
    default:
      return { x: '-50%', scale: 0.6, opacity: 0 }
  }
}

/**
 * spring 参数：
 *   - visualDuration 0.45 控制视觉上的"完成时间"（含尾部回弹），让切换有
 *     轻微的物理弹性而不拖沓
 *   - bounce 0.18 给一点轻盈的过冲，避免线性 cubic-bezier 那种死板感
 */
const slideTransition = {
  type: 'spring' as const,
  visualDuration: 0.45,
  bounce: 0.18,
}

function measure() {
  const slide = slideEls.value[currentIndex.value]
  if (!slide) return
  // offsetHeight 不受父容器 transform 影响；slide active 时 scale=1，得到的
  // 就是"原寸"高度，正好赋给 stage
  const h = slide.offsetHeight
  if (h > 0) stageHeight.value = h
}

watch(currentIndex, () => {
  // currentIndex 变化后等 DOM 把新的 .active 类应用上去再测量
  nextTick(measure)
})

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  measure()
  if (typeof ResizeObserver !== 'undefined' && stageEl.value) {
    resizeObserver = new ResizeObserver(() => measure())
    resizeObserver.observe(stageEl.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

function onImgLoad(i: number) {
  // 仅当 active 图片完成解码、得到真实渲染尺寸时刷新 stage 高度。其他图的
  // load 不影响当前展示项的高度（虽然 ResizeObserver 也兜底，这里直接调
  // 让首屏更早稳定）。
  if (i === currentIndex.value) measure()
}
</script>

<template>
  <div v-if="images.length" class="gallery">
    <div
      ref="stageEl"
      class="gallery-stage"
      :style="stageHeight !== null ? { height: `${stageHeight}px` } : {}"
    >
      <!--
        每张图独立挂在 DOM 上（不靠 v-if 切换）：
          - 让浏览器把图片预先 decode 好，切换时无加载抖动
          - 复用 CommonImageZoom 的点击放大能力（与切换按钮位置错开，不冲突）
          - prev / next 的 slide 会以 scale 缩小并透出在容器边缘，构成"叠图"
            视觉，给到当前 slide 前后内容的预览
      -->
      <Motion
        v-for="(img, i) in images"
        :key="img.src"
        :ref="setSlideRef(i)"
        :initial="false"
        :animate="targetVariant(relation(i))"
        :transition="slideTransition"
        class="gallery-slide"
        :class="`gallery-slide--${relation(i)}`"
        :aria-hidden="relation(i) !== 'active'"
      >
        <CommonImageZoom
          :src="img.src"
          :alt="img.alt"
          class="gallery-image"
          @load="onImgLoad(i)"
        />
      </Motion>

      <button
        v-if="images.length > 1"
        type="button"
        class="gallery-nav prev"
        :aria-label="$t('gallery.prev')"
        @click="step(-1)"
      >
        <span class="gallery-nav-icon">
          <IconChevronLeft />
        </span>
      </button>
      <button
        v-if="images.length > 1"
        type="button"
        class="gallery-nav next"
        :aria-label="$t('gallery.next')"
        @click="step(1)"
      >
        <span class="gallery-nav-icon">
          <IconChevronRight />
        </span>
      </button>
    </div>

    <div v-if="images.length > 1" class="gallery-indicators">
      <button
        v-for="(img, i) in images"
        :key="img.src"
        type="button"
        class="gallery-dot"
        :class="{ active: i === currentIndex }"
        :aria-label="$t('gallery.go_to', { index: i + 1 })"
        @click="setIndex(i)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
$transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
$transition-duration: 0.4s;

.gallery {
  @apply my-4;
}

.gallery-stage {
  @apply relative w-full;
  // 容器需要可见溢出？不——超出"prev/next 露出区"之外的部分要裁掉，避免
  // far slide 残留在边缘。设 hidden 即可，靠 prev/next 的 transform 让其
  // 仍然在容器内露出一小条
  @apply overflow-hidden;
  // 兜底：第一次 paint、JS 还没测得高度前给个最小高度，避免内容塌成 0；
  // client 测量后会被 inline `height` 覆盖
  min-height: 18rem;
  transition: height $transition-duration $transition-timing;
}

// ────────────────────────────────────────────────────────────────────────
// Slide 几何参数
// ────────────────────────────────────────────────────────────────────────
//
// 设计目标：让 prev / next slide 的"远端边缘"（朝向 stage 外侧那一侧）完整
// 在 stage 内可见，stage 的 `overflow: hidden` 不再切掉左/右两个圆角。
//
// 推导：
//   - slide 基础宽度        = 80% of stage
//   - prev/next 缩放        = 0.85
//   - prev/next 视觉半宽    = 80% * 0.85 / 2 = 34% (基于 stage 宽)
//   - 远端边缘到 stage 内边留约 0.5% 安全 padding
//   - prev 中心位置         ≈ -50% + 34% + 0.5% = -15.5% (基于 stage 宽)
//   - translateX 系数（相对 slide 自身 80% width） = -15.5% / 80% ≈ -19.4%
//
// 注意：transform 由 motion-v `<Motion>` 的 :animate 接管（spring 物理过渡），
// 这里只声明 width 等 layout 参数。translate / scale / opacity 的目标值在
// 脚本侧 `targetVariant()` 里定义。
$slide-width: 80%;

.gallery-slide {
  @apply absolute top-0 left-1/2;
  width: $slide-width;
  // flex 居中让 slide 内的图片在自身 box 中横竖居中；prev/next 的 box 等于
  // stage 高度，原图过高时 max-height 兜底压到 stage 高度内，原图较矮时
  // 自然垂直居中——这正是"叠加在后面的图片：高 → 缩到 active 高度，矮 →
  // 垂直居中"的实现路径
  @apply flex items-center justify-center;
  // motion-v 接管 transform / opacity 的过渡；但首屏 SSR 阶段 motion 尚未
  // 介入，给 far 一个初值（透明 + 不阻拦点击）让首屏渲染稳定
  pointer-events: none;

  :deep(.gallery-image) {
    @apply block m-0 rounded-2xl select-none;
  }

  // 远端 / 后续叠图：slide 高度撑满 stage（active 测出的高度），内部图片
  // 用 max-width / max-height 自适应在 box 内按比例居中
  &--far,
  &--prev,
  &--next {
    height: 100%;

    :deep(.gallery-image) {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
    }
  }

  // active：slide 高度由 img 自然高度撑起，反过来 stage 高度跟着 active 走
  &--active {
    height: auto;
    pointer-events: auto;
    z-index: 2;

    :deep(.gallery-image) {
      width: 100%;
      height: auto;
    }
  }

  &--prev,
  &--next {
    z-index: 1;
  }
}

// ────────────────────────────────────────────────────────────────────────
// 全高侧边热区按钮
// ────────────────────────────────────────────────────────────────────────
//
// 按钮容器铺满 stage 整个左/右纵向区域，让 hover / 点击在任意垂直高度都能
// 触发；图标用嵌套的 `.gallery-nav-icon` 圆形片，垂直居中显示，hover 时
// 透明度提升。背景透明，避免遮挡 active 图片底色；hover 时叠一层从边缘
// 向内渐隐的浅遮罩，作为"可点击"视觉反馈。
.gallery-nav {
  @apply absolute top-0 bottom-0;
  @apply flex items-center;
  @apply cursor-pointer;
  @apply z-3;
  width: 4.5rem;
  background: transparent;
  border: none;
  padding: 0;
  transition: background-color 0.2s linear;

  &.prev {
    @apply left-0 justify-start pl-2;
    background-image: linear-gradient(to right, rgba(0, 0, 0, 0.12), transparent);
    background-size: 0% 100%;
    background-repeat: no-repeat;
    transition: background-size 0.25s ease;
  }

  &.next {
    @apply right-0 justify-end pr-2;
    background-image: linear-gradient(to left, rgba(0, 0, 0, 0.12), transparent);
    background-size: 0% 100%;
    background-repeat: no-repeat;
    background-position: right;
    transition: background-size 0.25s ease;
  }

  &:hover {
    background-size: 100% 100%;

    .gallery-nav-icon {
      @apply opacity-100 bg-light dark-bg-dark;
    }
  }
}

.gallery-nav-icon {
  @apply w-10 h-10 rounded-full;
  @apply bg-light/85 dark-bg-dark/75;
  @apply text-primary dark-text-primary-7;
  @apply flex items-center justify-center;
  @apply shadow-lg shadow-black/10;
  @apply opacity-80;
  transition: opacity 0.2s linear, background-color 0.2s linear;
  @apply motion-reduce:transition-none;

  svg {
    @apply text-2xl;
  }
}

.gallery-indicators {
  @apply mt-3 flex items-center justify-center gap-2;
}

.gallery-dot {
  @apply w-2 h-2 rounded-full;
  @apply bg-primary-3/50 dark-bg-primary-5/60;
  @apply transition-all;
  @apply motion-reduce:transition-none;

  &:hover {
    @apply bg-primary-4 dark-bg-primary-7;
  }

  &.active {
    @apply w-5 bg-primary dark-bg-primary-8;
  }
}
</style>

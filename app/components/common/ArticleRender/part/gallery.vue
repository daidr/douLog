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
// 尺寸模型
// ────────────────────────────────────────────────────────────────────────
//
// 关键思路：每个 slide 的 box 完全由"对应图片的自然宽高比"决定 —— 而不是
// 用一刀切的 80% × stage_h（早期版本会让 prev/next 这种瘦图片在 80% 宽的
// 槽里有大片空白，transform-origin 锚定的是空白槽边缘而不是图片自身的边
// 缘，scale 视觉错位）。
//
// 步骤：
//   1. 通过 <img> 的 `load` 事件拿到 naturalWidth / naturalHeight，存进
//      `naturalSizes[i]`
//   2. 用 ResizeObserver 拿 stage 容器的当前宽度 `stageWidth`
//   3. `stageHeight` 由 active 那张图的自然比例反算出来：在宽度撑满 80%
//      stage 的前提下，对应的渲染高度
//   4. `slideBox(i)` 给每张图算自己的最终像素 box：
//        - 上限：max-width = 80% stage_w，max-height = stage_h（= active 高）
//        - 在上限里保住自然宽高比，返回 (w, h)
//   5. `targetVariant(rel, i)` 把 slide 的 width / height / x 都用像素值
//      喂给 motion，让 motion 既能正确放置又能在切换时把尺寸一起插值过去
//
// 用像素而不是百分比的原因：prev/next 的 x 位置目标是"slide 外侧边贴 stage
// 内边"，这是一个相对 stage 的绝对位置，与 slide 自身宽度无关；用百分比
// 的话每张图的 slide 宽度不一样，translateX 系数就要随之变，反而麻烦
const stageEl = ref<HTMLElement | null>(null)
const stageWidth = ref(0)
const naturalSizes = ref<Record<number, { w: number, h: number }>>({})

// active slide 占 stage 宽的比例，与 prev/next 缩放系数（见下）配套
const ACTIVE_WIDTH_RATIO = 0.8
// prev/next slide 外侧边缘到 stage 内边留的安全 padding（占 stage 宽）
const SAFE_PADDING_RATIO = 0.005

const activeRatio = computed(() => {
  const s = naturalSizes.value[currentIndex.value]
  return s ? s.w / s.h : null
})

const stageHeight = computed<number | null>(() => {
  const r = activeRatio.value
  if (!r || !stageWidth.value) return null
  return ACTIVE_WIDTH_RATIO * stageWidth.value / r
})

/**
 * 在 (max-width, max-height) 这个边界框里，按 ratio 求"最大且保持比例"的盒
 * 子。两种限制谁先撞死：
 *   - 如果撞 max-width：w = max-w，h = w / ratio
 *   - 否则撞 max-height：h = max-h，w = h * ratio
 */
function slideBox(i: number): { w: number, h: number } | null {
  const sw = stageWidth.value
  const sh = stageHeight.value
  if (!sw || !sh) return null
  const maxW = ACTIVE_WIDTH_RATIO * sw
  const maxH = sh
  const s = naturalSizes.value[i]
  // 还没拿到自然尺寸：退到 active 尺寸（一旦 load 完成会自动 reflow）
  if (!s) return { w: maxW, h: maxH }
  const r = s.w / s.h
  if (maxW / r <= maxH) return { w: maxW, h: maxW / r }
  return { w: maxH * r, h: maxH }
}

/**
 * 计算每个 slide 在 motion-v 上的 animate 目标。x / y / width / height 均
 * 为像素值（motion 把裸 number 当 px 处理），让 motion 在切换时把"位置 +
 * 尺寸 + 缩放 + 透明度"几个量一起 spring 插值，没有 CSS 中转。
 *
 * 垂直方向：所有 slide 一致 `top: 50%` + `y: '-50%'`（自身高度的一半），把
 * slide 中线锚定到 stage 中线。
 *   - active 因为 slide_h = stage_h，结果与"top: 0"一致：slide 顶边贴 stage
 *     顶边、底边贴 stage 底边
 *   - prev/next 高度小于 stage_h 时，slide 在 stage 中线两侧对称展开，自动
 *     垂直居中
 * 统一基准而不是"active 用 top:0、prev/next 用 top:50%"的旧方案——后者切
 * 换时 CSS top 瞬时变化、motion y 只能从 0 插值，会有上下跳变。
 *
 * x 推导（slide CSS 在 `left: 50%` 上）：
 *   - active / far：slide 中线对齐 stage 中线 → x = -box.w / 2
 *   - prev： slide 左边贴 stage 左内 padding → 50% × sw + x = padding × sw
 *            → x = -(0.5 - padding) × sw
 *   - next： slide 右边贴 stage 右内 padding → 50% × sw + x + box.w = (1 - padding) × sw
 *            → x = (0.5 - padding) × sw - box.w
 *
 * 配合 CSS `transform-origin: left/right center`（仅 prev/next），缩放锚点
 * 落在 slide 的外侧边 = 图片自身的外侧边（因为 slide 现在等于图片像素 box），
 * scale 0.85 让近端朝 active 收，远端纹丝不动。
 */
function targetVariant(rel: 'active' | 'prev' | 'next' | 'far', i: number) {
  const scale = rel === 'active' ? 1 : rel === 'far' ? 0.6 : 0.85
  const opacity = rel === 'active' ? 1 : rel === 'far' ? 0 : 0.45

  const box = slideBox(i)
  // 尚未测量到 stage 尺寸：仅给 motion 一个"安全位"，让 CSS fallback 接管
  // 宽高，自身不去写 inline width/height（避免初次 paint 把所有 slide 收
  // 成 0 × 0）。x/y 用 % 让 slide 在 CSS 宽度 / 自然高度下水平 + 垂直居中。
  if (!box) return { x: '-50%', y: '-50%', scale, opacity: rel === 'active' ? opacity : 0 }

  const sw = stageWidth.value
  const halfOffset = (0.5 - SAFE_PADDING_RATIO) * sw
  let x: number
  switch (rel) {
    case 'prev':
      x = -halfOffset
      break
    case 'next':
      x = halfOffset - box.w
      break
    default: // active / far
      x = -box.w / 2
      break
  }

  return { x, y: -box.h / 2, scale, opacity, width: box.w, height: box.h }
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

function measureStage() {
  if (stageEl.value) stageWidth.value = stageEl.value.clientWidth
}

/**
 * 浏览器缓存命中（或 SSR 阶段已 decode 好）的图片，其 `load` 事件在 Vue 把
 * 监听器挂上去之前就已经触发完了 —— 单靠 `@load` 拿不到 naturalSize，进而
 * `activeRatio` 始终为 null、`stageHeight` 退化为 CSS min-height。
 * 这里在挂载时同步把 stage 里所有 `img.gallery-image` 已经 complete 的尺寸
 * 一次性写进 `naturalSizes`，作为 @load 之外的补漏。
 */
function captureCachedSizes() {
  if (!stageEl.value) return
  const imgs = stageEl.value.querySelectorAll<HTMLImageElement>('img.gallery-image')
  const next = { ...naturalSizes.value }
  let changed = false
  imgs.forEach((img, i) => {
    if (img.complete && img.naturalWidth > 0 && !next[i]) {
      next[i] = { w: img.naturalWidth, h: img.naturalHeight }
      changed = true
    }
  })
  if (changed) naturalSizes.value = next
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  measureStage()
  captureCachedSizes()
  if (typeof ResizeObserver !== 'undefined' && stageEl.value) {
    resizeObserver = new ResizeObserver(measureStage)
    resizeObserver.observe(stageEl.value)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

function onImgLoad(i: number, ev: Event) {
  const img = ev.target as HTMLImageElement | null
  if (!img || !img.naturalWidth || !img.naturalHeight) return
  naturalSizes.value = {
    ...naturalSizes.value,
    [i]: { w: img.naturalWidth, h: img.naturalHeight },
  }
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
        :initial="false"
        :animate="targetVariant(relation(i), i)"
        :transition="slideTransition"
        class="gallery-slide"
        :class="`gallery-slide--${relation(i)}`"
        :aria-hidden="relation(i) !== 'active'"
      >
        <CommonImageZoom
          :src="img.src"
          :alt="img.alt"
          class="gallery-image"
          @load="(e: Event) => onImgLoad(i, e)"
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
// Slide 几何
// ────────────────────────────────────────────────────────────────────────
//
// slide 的 width / height 由 motion-v 通过 inline style 写入像素值（脚本侧
// 的 `slideBox(i)` 根据每张图自然比例 + stage 尺寸算出）。CSS 在这里只兜底
// pre-measurement / SSR 状态：给个 80% 宽 + 自适应高度避免首屏塌成 0。
//
// image 永远 width / height 100% slide —— slide 已经是图片像素 box（比例严
// 格等于自然比例），所以 100% × 100% 不会拉伸；同时让 transform-origin 锚定
// 到 slide 边缘就等价于锚定到图片边缘。
.gallery-slide {
  @apply absolute left-1/2;
  top: 50%;
  width: 80%;
  @apply flex items-center justify-center;
  pointer-events: none;

  :deep(.gallery-image) {
    @apply block m-0 rounded-2xl select-none;
    width: 100%;
    // height auto + width 100%：image 高度自然由 image_natural_ratio 推算，
    // 因为 slide 的 box 比例严格等于 image 自然比例（见 slideBox 算法），
    // height: auto 算出来的就是 slide 高度，避免依赖 slide 的 inline 高度
    // （pre-measurement 时 slide 还没拿到 inline px 高度，height: 100% 会
    // 塌成 0）
    height: auto;
  }

  &--active {
    pointer-events: auto;
    z-index: 2;
  }

  &--prev,
  &--next {
    z-index: 1;
  }

  // prev / next：缩放锚点放在朝外侧的边缘，让"远端不动、近端朝 active 收"。
  // 因为 slide 已等于图片像素 box，这里的 left/right center 直接锚定图片的
  // 真实外缘——不会再因为 slide 比图片宽而出现"锚定到空白槽边"。
  &--prev {
    transform-origin: left center;
  }

  &--next {
    transform-origin: right center;
  }
}

// ────────────────────────────────────────────────────────────────────────
// 全高侧边热区按钮
// ────────────────────────────────────────────────────────────────────────
//
// 按钮容器铺满 stage 整个左/右纵向区域，让 hover / 点击在任意垂直高度都能
// 触发；图标用嵌套的 `.gallery-nav-icon` 圆形片，垂直居中显示，hover 时
// 透明度提升。容器自身保持透明，不再叠侧边渐变，避免与 active 图边缘抢
// 视觉。
.gallery-nav {
  @apply absolute top-0 bottom-0;
  @apply flex items-center;
  @apply cursor-pointer;
  @apply z-3;
  width: 4.5rem;
  background: transparent;
  border: none;
  padding: 0;

  &.prev {
    @apply left-0 justify-start pl-2;
  }

  &.next {
    @apply right-0 justify-end pr-2;
  }

  &:hover .gallery-nav-icon {
    @apply opacity-100 bg-light dark-bg-dark;
  }
}

.gallery-nav-icon {
  @apply w-6 h-12 rounded-full;
  @apply bg-light/85 dark-bg-dark/75;
  @apply text-primary dark-text-primary-7;
  @apply flex items-center justify-center;
  @apply border border-black/10 dark-border-white/15;
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

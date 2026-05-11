<script setup lang="ts">
import IconHeartLine from '~icons/mingcute/heart-line'
import IconHeartFill from '~icons/mingcute/heart-fill'

const props = defineProps<{
  postId: number
  /** SSR 渲染时由文章详情接口给出，避免按钮先显示 0 再跳到真实值。 */
  initialCount: number
}>()

const { t } = useI18n()
const config = useRuntimeConfig()
const apiEntry = config.public.apiEntry

interface LikeStatus {
  liked: boolean
  likesCount: number
}

interface ToggleResponse extends LikeStatus {
  /**
   * 后端 2s 防抖窗口内的二次切换：状态没变，按钮按下时给一个"被限流了"
   * 的微反馈即可。失败靠 try/catch 兜，throttled 不是错。
   */
  throttled: boolean
}

const liked = ref(false)
const likesCount = ref(props.initialCount)
const pending = ref(false)
const justThrottled = ref(false)
let throttleHintTimer: ReturnType<typeof setTimeout> | null = null
let unmounted = false

/**
 * 单调递增的请求代际计数。`loadStatus` 与 `toggle` 启动时各 ++ 一次并捕获
 * 自己的 token，请求回来时只有 token 仍是最新值才允许写 liked/likesCount。
 *
 * 这解决两个并发风险：
 *   1. mount 触发的 GET 还没回来时用户已经点了按钮 → POST 已经回写新真值，
 *      旧 GET 不能再覆盖
 *   2. 同一类请求快速重发时（toggle 本身有 pending 守卫，loadStatus 不直接
 *      重发，但未来若加 refresh 会很方便）旧响应不会盖新响应
 */
let stateToken = 0

/**
 * 进页面后拉一次当前身份的点赞状态。
 *   - 登录用户：actorKey = u:<userId>
 *   - 匿名用户：actorKey = g:<sha256(ip+ua+secret)>
 * credentials: 'include' 是为登录场景透传 better-auth 的 session cookie；匿名
 * 场景不依赖 cookie，但加 include 不会破坏匿名身份的 (IP, UA) 派生。
 *
 * SSR 时不发起请求：服务端调用 SV 拿到的 IP 是 nuxt 服务的 IP，跟用户在
 * 浏览器里的真实指纹对不上，liked 状态会失真；只在浏览器侧 onMounted 拉。
 */
async function loadStatus() {
  const myToken = ++stateToken
  try {
    const data = await $fetch<LikeStatus>(
      `${apiEntry}/api/posts/${props.postId}/like`,
      { credentials: 'include' },
    )
    if (unmounted || myToken !== stateToken) return
    liked.value = data.liked
    likesCount.value = data.likesCount
  } catch (error) {
    if (unmounted || myToken !== stateToken) return
    console.error('[like] failed to load status', error)
  }
}

onMounted(loadStatus)

function flashThrottleHint() {
  if (unmounted) return
  justThrottled.value = true
  if (throttleHintTimer) clearTimeout(throttleHintTimer)
  throttleHintTimer = setTimeout(() => {
    justThrottled.value = false
    throttleHintTimer = null
  }, 1500)
}

onBeforeUnmount(() => {
  unmounted = true
  if (throttleHintTimer) {
    clearTimeout(throttleHintTimer)
    throttleHintTimer = null
  }
})

/**
 * 切换点赞。
 *
 * 走乐观更新：先翻按钮 + 计数，再 POST。请求回来：
 *   - 正常：以服务端返回的 likesCount / liked 为准（同一身份并发场景下，
 *     服务端是唯一真值）
 *   - throttled：后端窗口内，状态没变；UI 回退到服务端返回的真值并提示
 *   - 失败：把乐观更新回滚
 *
 * 整段被 stateToken 守住：组件已经卸载、或者其间有更新一代的请求覆盖了
 * 状态，本次响应一律丢弃，避免脏写。
 */
async function toggle() {
  if (pending.value) return
  const myToken = ++stateToken
  const prevLiked = liked.value
  const prevCount = likesCount.value
  liked.value = !prevLiked
  likesCount.value = prevLiked ? Math.max(prevCount - 1, 0) : prevCount + 1
  pending.value = true
  try {
    const data = await $fetch<ToggleResponse>(
      `${apiEntry}/api/posts/${props.postId}/like`,
      { method: 'POST', credentials: 'include' },
    )
    if (unmounted || myToken !== stateToken) return
    liked.value = data.liked
    likesCount.value = data.likesCount
    if (data.throttled) {
      flashThrottleHint()
    }
  } catch (error) {
    if (unmounted || myToken !== stateToken) return
    liked.value = prevLiked
    likesCount.value = prevCount
    console.error('[like] toggle failed', error)
  } finally {
    if (!unmounted) pending.value = false
  }
}
</script>

<template>
  <button
    type="button"
    class="like-button"
    :class="{
      'like-button--liked': liked,
      'like-button--pending': pending,
      'like-button--throttled': justThrottled,
    }"
    :aria-pressed="liked"
    :aria-label="liked ? t('like.unlike_aria') : t('like.like_aria')"
    @click="toggle"
  >
    <span class="like-button__icon">
      <Transition name="like-heart" mode="out-in">
        <IconHeartFill v-if="liked" key="filled" />
        <IconHeartLine v-else key="line" />
      </Transition>
    </span>
    <span class="like-button__count">{{ likesCount }}</span>
    <span class="like-button__label">
      {{ liked ? t('like.liked') : t('like.like') }}
    </span>
  </button>
</template>

<style lang="scss" scoped>
.like-button {
  @apply inline-flex items-center gap-x-2 px-4 py-2 rounded-2xl;
  @apply text-sm font-medium;
  @apply bg-primary-1/60 dark-bg-primary-3/40;
  @apply text-primary dark-text-primary-7;
  @apply transition-all duration-200;
  @apply hover:bg-primary-2/70 dark-hover-bg-primary-4/60;
  @apply active:scale-95;
  @apply motion-reduce:transition-none motion-reduce:active:scale-100;

  &--liked {
    @apply bg-red-100/70 text-red-600 dark-bg-red-900/30 dark-text-red-400;
    @apply hover:bg-red-200/70 dark-hover-bg-red-800/40;
  }

  &--pending {
    @apply opacity-70 cursor-progress;
  }

  &--throttled {
    animation: like-throttle-pulse 0.6s ease-out;
  }
}

.like-button__icon {
  @apply inline-flex w-5 h-5 items-center justify-center;
  @apply text-lg;

  :deep(svg) {
    @apply w-full h-full;
  }
}

.like-button__count {
  @apply font-mono tabular-nums min-w-[1ch];
}

.like-button__label {
  @apply text-xs uppercase tracking-wider opacity-80;
}

.like-heart-enter-active,
.like-heart-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.like-heart-enter-from {
  transform: scale(0.4);
  opacity: 0;
}

.like-heart-leave-to {
  transform: scale(1.6);
  opacity: 0;
}

@keyframes like-throttle-pulse {
  0% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-2px);
  }
  40% {
    transform: translateX(2px);
  }
  60% {
    transform: translateX(-1px);
  }
  80% {
    transform: translateX(1px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>

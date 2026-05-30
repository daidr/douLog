<script setup lang="ts">
import type { ICommentList, IReply, ITopLevelComment } from '~~/types/feed'
import { renderCommentMarkdown } from '~/utils/comment-md'

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
  })[c]!)
}

const props = defineProps<{
  /** 顶层评论（含 repliesPreview / repliesCount）或楼中楼回复。 */
  comment: ITopLevelComment | IReply
  postId: number
}>()

const emit = defineEmits<{
  /**
   * 把"提交了一条新回复"的事件冒泡给最外层 CommentSection，由它统一刷新
   * 父级顶层评论的 repliesPreview / repliesCount。
   */
  replySubmitted: [reply: IReply | null, rootId: number]
}>()

const { t, locale } = useI18n()
const config = useRuntimeConfig()
const apiEntry = config.public.apiEntry

// 顶层评论独有 repliesPreview / repliesCount；用 in 判定既支持 ITopLevelComment
// 又支持 IReply，且让 TS narrowing 正确
const isTopLevel = computed(() => 'repliesPreview' in props.comment)
const topLevel = computed<ITopLevelComment | null>(() =>
  isTopLevel.value ? (props.comment as ITopLevelComment) : null,
)

// 显示用：登录作者 / 游客二选一
const displayName = computed(() =>
  props.comment.author?.name || props.comment.guest?.name || t('comment.anonymous'),
)
const websiteHref = computed(() => {
  const w = props.comment.guest?.website
  if (!w) return null
  // 简单加 protocol；服务端没强制 protocol
  return /^https?:\/\//i.test(w) ? w : `https://${w}`
})
const emailHash = computed(() =>
  props.comment.author?.emailHash || props.comment.guest?.emailHash || '',
)
// 博主徽章：仅登录作者侧 isBlogger 为真时显示
const isBlogger = computed(() => props.comment.author?.isBlogger === true)
// 国内 gravatar 镜像；mp 是 mystery person fallback
const avatarUrl = computed(() =>
  `https://cravatar.cn/avatar/${emailHash.value}?d=mp&s=80`,
)

const formattedTime = computed(() => {
  if (!props.comment.createdAt) return ''
  const formatter = new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Shanghai',
  })
  return formatter.format(new Date(props.comment.createdAt))
})

/**
 * 评论正文最终的 HTML：把"回复 @xxx "前缀（仅二级评论）拼到 markdown 渲
 * 染结果之前。
 *
 * 顺序很重要——
 *   1. parentAuthorName 走 `escapeHtml`，避免恶意昵称里带 `<script>` 之类
 *   2. comment.content 走 markdown 子集渲染（白名单 inline 规则 + 链接
 *      target=_blank + html:false 自动 escape 原始 HTML）
 *   3. 二者通过 v-html 注入到 `.comment-item__content`，CSS 用 `:deep()`
 *      给注入的 reply-tag / link / code 等元素套样式
 */
const contentHtml = computed(() => {
  const body = renderCommentMarkdown(props.comment.content)
  if (!props.comment.parentAuthorName) {
    return body
  }
  const replyLabel = escapeHtml(t('comment.replied_to'))
  const target = escapeHtml(props.comment.parentAuthorName)
  return `<span class="comment-item__reply-tag">${replyLabel} `
    + `<span class="comment-item__reply-target">@${target}</span></span> `
    + body
})

// 回复表单展开状态
const showReplyForm = ref(false)
function toggleReply() {
  showReplyForm.value = !showReplyForm.value
}

// 楼中楼：preview 是头 3 条，超过则按需通过 /api/comments/:id/replies 拉全部
const allReplies = ref<IReply[] | null>(null)
const loadingAllReplies = ref(false)
const showAllReplies = ref(false)

const remainingRepliesCount = computed(() => {
  if (!topLevel.value) return 0
  return Math.max(0, topLevel.value.repliesCount - topLevel.value.repliesPreview.length)
})

const displayedReplies = computed<IReply[]>(() => {
  if (!topLevel.value) return []
  if (showAllReplies.value && allReplies.value) return allReplies.value
  return topLevel.value.repliesPreview
})

async function loadAllReplies() {
  if (!topLevel.value) return
  if (allReplies.value) {
    showAllReplies.value = true
    return
  }
  loadingAllReplies.value = true
  try {
    const result = await $fetch<ICommentList<IReply>>(
      `${apiEntry}/api/comments/${topLevel.value.id}/replies`,
      { query: { size: 50 } },
    )
    allReplies.value = result.list
    showAllReplies.value = true
  } catch {
    /* 加载失败保持原 preview */
  } finally {
    loadingAllReplies.value = false
  }
}

function collapseAllReplies() {
  showAllReplies.value = false
}

/**
 * 子级表单提交：rootId 等于"当前顶层评论的 id"（如果当前是顶层）或
 * "当前回复的 rootId"（如果当前是回复，回复回复时挂在同一根下）。
 * 把这俩一并冒泡给上层 CommentSection 做统一处理。
 */
function onReplySubmitted(reply: IReply | null) {
  showReplyForm.value = false
  // 顶层评论 id 即 root；回复的 rootId 才是 root
  const rootId = topLevel.value
    ? topLevel.value.id
    : (props.comment.rootId ?? props.comment.id)
  emit('replySubmitted', reply, rootId)

  // 如果当前已展开全部回复，把新 reply 直接 push 到本地 list 头/尾让其立即显示
  if (reply && showAllReplies.value && allReplies.value) {
    allReplies.value = [...allReplies.value, reply]
  }
}
</script>

<template>
  <div class="comment-item" :class="{ 'comment-item--reply': !isTopLevel }">
    <img
      :src="avatarUrl"
      :alt="displayName"
      class="comment-item__avatar"
      loading="lazy"
      decoding="async"
      width="40"
      height="40"
    >
    <div class="comment-item__body">
      <div class="comment-item__header">
        <a
          v-if="websiteHref"
          :href="websiteHref"
          target="_blank"
          rel="noopener noreferrer nofollow"
          class="comment-item__author"
        >
          {{ displayName }}
        </a>
        <span v-else class="comment-item__author">{{ displayName }}</span>
        <span v-if="isBlogger" class="comment-item__blogger-badge">{{ t('comment.blogger') }}</span>
        <span class="comment-item__time">{{ formattedTime }}</span>
      </div>
      <!--
        正文走 v-html：
          - 评论支持有限的 markdown（链接 / 加粗 / 斜体 / 删除线 / 行内代码）
          - 链接统一加 target="_blank" + 安全 rel
          - 二级评论的"回复 @xxx"以 inline span 前缀拼在 markdown 输出之前
        渲染细节由 ~/utils/comment-md 的 markdown-it 子集 + escapeHtml
        共同保证：原始 HTML 字符全部被 escape，没有 v-html 注入风险
      -->
      <div class="comment-item__content" v-html="contentHtml" />
      <div class="comment-item__actions">
        <button type="button" class="comment-item__action" @click="toggleReply">
          {{ showReplyForm ? t('comment.cancel') : t('comment.reply') }}
        </button>
      </div>

      <SiteCommentForm
        v-if="showReplyForm"
        class="comment-item__reply-form"
        :post-id="postId"
        :parent-id="comment.id"
        :placeholder="t('comment.reply_to', { name: displayName })"
        :show-cancel="true"
        @submitted="onReplySubmitted"
        @cancel="showReplyForm = false"
      />

      <!-- 楼中楼 preview / 完整回复列表 -->
      <div
        v-if="topLevel && (displayedReplies.length || remainingRepliesCount > 0)"
        class="comment-item__replies"
      >
        <SiteCommentItem
          v-for="reply in displayedReplies"
          :key="reply.id"
          :comment="reply"
          :post-id="postId"
          @reply-submitted="(r, rid) => emit('replySubmitted', r, rid)"
        />
        <button
          v-if="!showAllReplies && remainingRepliesCount > 0"
          type="button"
          class="comment-item__expand"
          :disabled="loadingAllReplies"
          @click="loadAllReplies"
        >
          {{
            loadingAllReplies
              ? t('comment.loading')
              : t('comment.show_more_replies', { count: remainingRepliesCount })
          }}
        </button>
        <button
          v-else-if="showAllReplies && allReplies && allReplies.length > 3"
          type="button"
          class="comment-item__expand"
          @click="collapseAllReplies"
        >
          {{ t('comment.collapse_replies') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.comment-item {
  @apply flex gap-3 py-3;
  @apply border-b border-primary-2/30 dark-border-primary-4/30;

  &:last-child {
    @apply border-b-0;
  }

  &--reply {
    @apply pl-3 py-2;
    @apply border-l-2 border-primary-2/40 dark-border-primary-4/40;
    @apply border-b-0;
    @apply ml-2 mt-2;

    .comment-item__avatar {
      // 二级评论的头像收紧到一行文字的高度（≈ author 行高 1.5em），跟标题
      // 顶端齐平、不再像顶层评论那样占两行高度
      width: 1.5em;
      height: 1.5em;
    }
  }
}

.comment-item__avatar {
  @apply flex-shrink-0 rounded-full;
  @apply w-10 h-10;
  @apply bg-primary-1 dark-bg-primary-2;
  @apply object-cover select-none;
}

.comment-item__body {
  @apply flex-1 min-w-0 flex flex-col gap-1.5;
}

.comment-item__header {
  @apply flex items-baseline gap-2 flex-wrap;
}

.comment-item__author {
  @apply font-semibold text-primary dark-text-primary-7;

  // 当作者带 website 时这是个 <a>；hover 给下划线，纯文本时无 hover 反馈
  &:where(a):hover {
    @apply underline;
  }
}

.comment-item__blogger-badge {
  @apply inline-flex items-center;
  @apply px-1.5 py-0.5 rounded-md;
  @apply text-xs font-medium leading-none;
  @apply text-white bg-primary-4 dark-text-primary-9;
}

.comment-item__time {
  @apply text-xs text-primary-text/70 dark-text-primary-6/70;
}

.comment-item__content {
  @apply text-sm text-dark dark-text-light/85;
  @apply leading-relaxed break-words;
  // markdown 渲染产物 + reply-tag 都通过 v-html 注入，没有 scoped 的
  // [data-v-…] 属性，必须用 :deep() 才能匹配；同时这一段不再需要
  // `whitespace-pre-wrap`——markdown-it 用 breaks:true 已经把换行变成
  // 真正的 <br>，保留 pre-wrap 反而会让 inline 元素之间的空白被异常拉宽
  :deep(.comment-item__reply-tag) {
    @apply text-primary/80 dark-text-primary-7/80;
  }

  :deep(.comment-item__reply-target) {
    @apply font-semibold;
  }

  // markdown subset 样式
  :deep(a) {
    @apply text-primary dark-text-primary-7 underline decoration-primary/40;
    @apply hover:decoration-primary;
    @apply transition-colors;
  }

  :deep(strong) {
    @apply font-bold text-primary dark-text-primary-7;
  }

  :deep(em) {
    @apply italic;
  }

  :deep(del) {
    @apply line-through opacity-70;
  }

  :deep(code) {
    @apply px-1.5 py-0.5 rounded text-xs;
    @apply bg-primary-1/60 dark-bg-primary-2/60;
    @apply text-primary-7 dark-text-primary-8;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  }
}

.comment-item__actions {
  @apply flex items-center gap-2 mt-1;
}

.comment-item__action {
  @apply text-xs text-primary dark-text-primary-7;
  @apply hover:underline;
}

.comment-item__reply-form {
  @apply mt-2;
}

.comment-item__replies {
  @apply mt-2 flex flex-col;
}

.comment-item__expand {
  @apply self-start mt-2 ml-3 px-3 py-1 rounded-lg;
  @apply text-xs text-primary dark-text-primary-7;
  @apply hover:bg-primary-2/30 dark-hover-bg-primary-4/30;
  @apply transition-colors;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>

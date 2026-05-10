<script setup lang="ts">
import type { ICommentList, IReply, ITopLevelComment } from '~~/types/feed'

const props = defineProps<{
  postId: number
}>()

const { t } = useI18n()
const config = useRuntimeConfig()
const apiEntry = config.public.apiEntry

const PAGE_SIZE = 10

const comments = shallowRef<ITopLevelComment[]>([])
const total = ref(0)
const hasNext = ref(false)
const page = ref(1)
const loading = ref(false)
const loaded = ref(false)
const submittedHint = ref<'pending' | 'approved' | ''>('')
let hintTimer: ReturnType<typeof setTimeout> | null = null

async function loadPage(targetPage: number, append: boolean) {
  loading.value = true
  try {
    const result = await $fetch<ICommentList<ITopLevelComment>>(
      `${apiEntry}/api/posts/${props.postId}/comments`,
      { query: { page: targetPage, size: PAGE_SIZE } },
    )
    comments.value = append ? [...comments.value, ...result.list] : result.list
    total.value = result.total
    hasNext.value = result.hasNext
    page.value = targetPage
    triggerRef(comments)
  } catch (error) {
    console.error('[comments] failed to load', error)
  } finally {
    loading.value = false
    loaded.value = true
  }
}

// 评论区不阻塞 SSR，hydrate 后再拉；进文章页时 article 详情已是阻塞 useFetch
// 数据，评论作为补充信息异步加载即可，避免详情页首字节延迟
onMounted(() => loadPage(1, false))

async function loadMore() {
  if (!hasNext.value || loading.value) return
  await loadPage(page.value + 1, true)
}

function showHint(kind: 'pending' | 'approved') {
  submittedHint.value = kind
  if (hintTimer) clearTimeout(hintTimer)
  hintTimer = setTimeout(() => {
    submittedHint.value = ''
    hintTimer = null
  }, 5000)
}

onBeforeUnmount(() => {
  if (hintTimer) clearTimeout(hintTimer)
})

/**
 * 顶层评论提交回调。
 *  - reply 非空：approved，把它当作 ITopLevelComment 直接 unshift 到列表头，
 *    repliesCount=0 / repliesPreview=[]
 *  - reply 为 null：pending（首次匿名 / 蜜罐 / 关键词触发），列表不动，提示
 *    "已提交，待审核"
 */
function onTopLevelSubmitted(reply: IReply | null) {
  if (reply) {
    const fresh: ITopLevelComment = {
      ...reply,
      pinned: false,
      repliesCount: 0,
      repliesPreview: [],
    }
    comments.value = [fresh, ...comments.value]
    total.value += 1
    triggerRef(comments)
    showHint('approved')
  } else {
    showHint('pending')
  }
}

/**
 * 楼中楼回复提交回调。CommentItem 把 (reply, rootId) 一起冒泡上来，这里直接
 * 找到对应顶层评论更新 repliesCount / repliesPreview（preview 满 3 条就只
 * 增计数，新回复仍能在"展开全部回复"时看到——CommentItem 内部的 allReplies
 * 缓存自己已经 push 过了）。
 */
function onReplySubmitted(reply: IReply | null, rootId: number) {
  if (!reply) {
    showHint('pending')
    return
  }
  const idx = comments.value.findIndex(c => c.id === rootId)
  if (idx < 0) {
    // 罕见：reply 命中的根 id 不在当前页（被分页隔开）。给 hint 即可
    showHint('approved')
    return
  }
  const target = comments.value[idx]!
  const updated: ITopLevelComment = {
    ...target,
    repliesCount: target.repliesCount + 1,
    repliesPreview: target.repliesPreview.length < 3
      ? [...target.repliesPreview, reply]
      : target.repliesPreview,
  }
  comments.value = [
    ...comments.value.slice(0, idx),
    updated,
    ...comments.value.slice(idx + 1),
  ]
  triggerRef(comments)
  showHint('approved')
}
</script>

<template>
  <section class="comment-section">
    <h3 class="comment-section__title">
      {{ t('comment.title') }}
      <span v-if="loaded" class="comment-section__count">{{ total }}</span>
    </h3>

    <SiteCommentForm
      class="comment-section__form"
      :post-id="postId"
      @submitted="onTopLevelSubmitted"
    />

    <Transition name="fade">
      <div
        v-if="submittedHint"
        class="comment-section__hint"
        :class="{ 'comment-section__hint--ok': submittedHint === 'approved' }"
      >
        {{
          submittedHint === 'pending'
            ? t('comment.hint_pending')
            : t('comment.hint_approved')
        }}
      </div>
    </Transition>

    <div v-if="!loaded" class="comment-section__placeholder">
      {{ t('comment.loading') }}
    </div>
    <div v-else-if="!comments.length" class="comment-section__placeholder">
      {{ t('comment.empty') }}
    </div>
    <div v-else class="comment-section__list">
      <SiteCommentItem
        v-for="comment in comments"
        :key="comment.id"
        :comment="comment"
        :post-id="postId"
        @reply-submitted="onReplySubmitted"
      />
    </div>

    <button
      v-if="hasNext"
      type="button"
      class="comment-section__more"
      :disabled="loading"
      @click="loadMore"
    >
      {{ loading ? t('global.loading') : t('global.load_more') }}
    </button>
  </section>
</template>

<style lang="scss" scoped>
.comment-section {
  @apply flex flex-col gap-4;
}

.comment-section__title {
  @apply text-xl font-bold text-primary dark-text-primary-7;
  @apply flex items-baseline gap-2;
}

.comment-section__count {
  @apply text-sm font-normal text-primary-text/70 dark-text-primary-6;
}

.comment-section__form {
  @apply mb-1;
}

.comment-section__hint {
  @apply text-sm px-3 py-2 rounded-xl;
  @apply bg-primary-1/50 dark-bg-primary-2/50;
  @apply text-primary-text dark-text-primary-7;

  &--ok {
    @apply bg-primary-2/40 dark-bg-primary-4/40;
  }
}

.comment-section__placeholder {
  @apply text-center py-8 text-primary-text/70 dark-text-primary-6;
}

.comment-section__list {
  @apply flex flex-col;
}

.comment-section__more {
  @apply self-center mt-2 px-5 py-2 rounded-xl;
  @apply text-sm text-primary dark-text-primary-7;
  @apply bg-primary-1/70 dark-bg-primary-5/40;
  @apply hover:bg-primary-2/70 dark-hover-bg-primary-5/70;
  @apply transition-colors;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

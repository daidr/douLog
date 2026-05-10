<script setup lang="ts">
import type { IFlowItem, IPostDetail } from '~~/types/feed'
import IconAlarm from '~icons/mingcute/notification-line'

preloadRouteComponents('/blog/[id]')

definePageMeta({
  isInArticlePage: false,
})

interface FlowResponse {
  list: IFlowItem[]
  total: number
  hasNext: boolean
}

const PAGE_SIZE = 10

const isFetching = ref(false)
const isEnded = ref(false)

async function fetchPage(page: number = 1): Promise<IFlowItem[]> {
  isFetching.value = true
  try {
    const res = await $fetch<FlowResponse>('/api/flow', {
      query: { page },
    })
    if (!res.hasNext || res.list.length < PAGE_SIZE) {
      isEnded.value = true
    }
    return res.list
  } finally {
    isFetching.value = false
  }
}

const articles = shallowRef<IFlowItem[]>(await fetchPage())

async function requestFetch() {
  if (isEnded.value || isFetching.value) return
  const nextPage = Math.floor(articles.value.length / PAGE_SIZE) + 1
  const nextItems = await fetchPage(nextPage)
  articles.value.push(...nextItems)
  triggerRef(articles)
}

const throttleRequestFetch = useThrottleFn(requestFetch, 100)

const loadMoreRef = ref(null) as Ref<HTMLDivElement | null>

useIntersectionObserver(loadMoreRef, async ([{ isIntersecting }]) => {
  if (isIntersecting) throttleRequestFetch()
})

const toPrevTop = inject('toPrevTop') as () => void
const setArticleScrollTop = inject('setArticleScrollTop') as () => void

onMounted(async () => {
  requestAnimationFrame(() => {
    toPrevTop()
  })
})

onActivated(async () => {
  requestAnimationFrame(() => {
    toPrevTop()
  })
})

const isPrefetching = ref(false)
const ArticleCacheId = inject('ArticleCacheId') as Ref<number>
const ArticleCache = inject('ArticleCache') as Ref<IPostDetail>
const ArticleSummaryCache = inject('ArticleSummaryCache') as Ref<string>

async function onArticleItemClick(postId: number) {
  if (ArticleCacheId.value !== postId) {
    const timer = setTimeout(() => {
      isPrefetching.value = true
    }, 100)

    const detail = await $fetch<IPostDetail>(
      `/api/post/${postId}`,
    )
    if (!detail) {
      clearTimeout(timer)
      isPrefetching.value = false
      navigateTo('/404', { replace: false })
      return
    }
    // story-verse 没有"只查不生成"的 ai-summary 端点；点击列表项时不再预请求摘要，
    // 真正进文章页后由 ArticleAISummary 一次性 lazy fetch（命中缓存时仍是常数延时）。
    ArticleSummaryCache.value = ''
    ArticleCacheId.value = postId
    ArticleCache.value = detail
    clearTimeout(timer)
    isPrefetching.value = false
  }
  await nextTick()

  setArticleScrollTop()
  navigateTo(`/blog/${postId}`)
}

const { t } = useI18n()
</script>

<template>
  <div class="content-wrapper">
    <Teleport v-if="isHydrated" to="body">
      <Transition name="fade">
        <template v-if="isPrefetching">
          <div class="loading-mask">
            <div class="loading">
              <UiLoadingIcon />
            </div>
          </div>
        </template>
      </Transition>
    </Teleport>
    <div class="announcement-item">
      <IconAlarm />
      <p>{{ t('global.blog_announcement') }}</p>
    </div>
    <div class="article-list">
      <SiteArticleItem
        v-for="article of articles" :key="article.id"
        :article="article" @click.prevent="onArticleItemClick(article.id)"
      />
      <div v-if="!isEnded && isHydrated" ref="loadMoreRef" class="load-more" :class="{ disabled: isFetching }" @click="requestFetch">
        {{ isFetching ? t('global.loading') : t('global.load_more') }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading-mask {
  @apply fixed top-0 left-0 right-0 bottom-0;
  @apply z-9997;
  @apply bg-light/50 dark-bg-dark/50;
  @apply flex items-center justify-center;

  .loading {
    @apply w-100px h-100px rounded-100px;
    @apply bg-light dark-bg-dark;
    @apply transform-gpu translate-z-200vh;
    @apply pointer-events-none;
    @apply flex items-center justify-center;
    @apply border-1 border-primary-2 dark-border-primary-6;
  }
}

.content-wrapper {
  @apply w-full flex flex-col items-stretch gap-y-3;

  .announcement-item {
    @apply w-full bg-light dark-bg-dark px-5 md:px-8 py-4 w-full;
    @apply sm:rounded-8;
    @apply sm:shadow-2xl general-shadow;
    @apply flex items-center gap-x-4;
    @apply text-lg text-primary-text;
    view-transition-name: main-announcement;

    p {
      @apply text-primary-text;
    }
  }

  .article-list {
    @apply w-full bg-light dark-bg-dark w-full;
    @apply px-5 py-5 sm:(px-8 py-8);
    @apply sm:rounded-8;
    @apply sm:shadow-2xl general-shadow;
    @apply flex flex-col gap-y-4;
    view-transition-name: main-wrapper;
  }

  .load-more {
    @apply w-full text-center text-base text-primary dark-text-primary-9;
    @apply cursor-pointer bg-primary-1/70 dark-bg-primary-5/50;
    @apply py-2 transition-colors rounded-xl;

    &:hover {
      @apply bg-primary-2/50 dark-bg-primary-5/80;
    }

    &.disabled {
      @apply pointer-events-none;
    }
  }
}
</style>

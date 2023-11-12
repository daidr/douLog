<script setup lang="ts">
import { IArticleItem } from '~/server/api/article/[id]'
import IconAlarm from '~icons/icon-park-outline/alarm'

preloadRouteComponents('/blog/[id]')

definePageMeta({
  isInArticlePage: false,
})

const isFetching = ref(false)
const isEnded = ref(false)

const fetchList = async (page: number = 1) => {
  isFetching.value = true
  const { data: _articleList } = await useFetch('/api/articles', {
    query: {
      page,
    },
  })
  isFetching.value = false

  return _articleList.value!
}

const articles = await fetchList()

if (articles.length < 10) {
  isEnded.value = true
}

const requestFetch = async () => {
  if (isEnded.value || isFetching.value) return
  const _articleList = await fetchList(articles.length / 10 + 1)
  if (_articleList.length < 10) {
    isEnded.value = true
  }
  articles.push(..._articleList)
}

const loadMoreRef = ref(null) as Ref<HTMLDivElement | null>

useIntersectionObserver(loadMoreRef, async ([{ isIntersecting }]) => {
  if (isIntersecting) requestFetch()
})

const toTop = inject('toTop') as () => void
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
const ArticleCache = inject('ArticleCache') as Ref<IArticleItem>
const ArticleSummaryCache = inject('ArticleSummaryCache') as Ref<string>

const onArticleItemClick = async (postId: number) => {
  if (ArticleCacheId.value !== postId) {
    const timer = setTimeout(() => {
      isPrefetching.value = true
    }, 100)

    const { data: article } = await useFetch<IArticleItem>(
      `/api/article/${postId}`,
    )
    if (!article.value) {
      clearTimeout(timer)
      isPrefetching.value = false
      navigateTo('/404', { replace: false })
      return
    }
    const { data: summary } = await useFetch<string>(`/api/summary/${postId}`, {
      query: { cacheonly: '1' },
    })
    ArticleSummaryCache.value = summary.value || 'no cache'
    ArticleCacheId.value = postId
    ArticleCache.value = article.value
    clearTimeout(timer)
    isPrefetching.value = false
  }
  await nextTick()

  setArticleScrollTop()
  // toTop()
  navigateTo(`/blog/${postId}`)
}

const { t } = useI18n()
</script>

<template>
  <div class="content-wrapper">
    <ClientOnly>
      <Teleport to="body">
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
    </ClientOnly>
    <div class="announcement-item">
      <IconAlarm />
      <p>{{ t('global.blog_announcement') }}</p>
    </div>
    <div class="article-list">
      <SiteArticleItem
        v-for="article of articles.filter(i => i.format === 'standard')"
        :key="article.id"
        :article="article"
        @click.prevent="onArticleItemClick(article.id)"
      />
      <div
        v-if="!isEnded"
        ref="loadMoreRef"
        class="load-more"
        :class="{ disabled: isFetching }"
        @click="requestFetch"
      >
        {{ isFetching ? '加载中...' : '加载更多' }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading-mask {
  @apply fixed top-0 left-0 right-0 bottom-0;
  @apply z-9998;
  @apply bg-white/50;
  @apply flex items-center justify-center;

  .loading {
    @apply w-100px h-100px rounded-100px;
    @apply bg-white;
    @apply transform-gpu translate-z-200vh;
    @apply pointer-events-none;
    @apply flex items-center justify-center;
    @apply border-1 border-primary-light;
  }
}
.content-wrapper {
  @apply w-full flex flex-col items-stretch space-y-3;

  .announcement-item {
    @apply w-full bg-white px-5 md:px-8 py-4 w-full;
    @apply rounded-8;
    @apply shadow-2xl shadow-primary/30;
    @apply flex items-center space-x-4;
    @apply text-lg text-primary-light;
    view-transition-name: main-announcement;

    p {
      @apply text-primary/80;
    }
  }

  .article-list {
    @apply w-full bg-white w-full;
    @apply px-5 py-5 sm:(px-8 py-8);
    @apply rounded-8;
    @apply shadow-2xl shadow-primary/30;
    @apply flex flex-col space-y-4;
    view-transition-name: main-wrapper;
  }

  .load-more {
    @apply w-full text-center text-base text-primary/90;
    @apply cursor-pointer bg-primary-extralight/50;
    @apply py-2 transition-colors rounded-xl;

    &:hover {
      @apply bg-primary-extralight/80;
    }

    &.disabled {
      @apply pointer-events-none;
    }
  }
}
</style>

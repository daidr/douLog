<script setup lang="ts">
import IconAlarm from '~icons/icon-park-outline/alarm'
import { CONFIG } from '~~/config/base'

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
  toPrevTop()
})

onActivated(async () => {
  await nextTick()
  toPrevTop()
})

const onArticleItemClick = () => {
  setArticleScrollTop()
  toTop()
}
</script>

<template>
  <div class="content-wrapper">
    <div class="announcement-item">
      <IconAlarm />
      <p>{{ CONFIG.blogAnnouncement }}</p>
    </div>
    <div class="article-list">
      <SiteArticleItem
        v-for="article of articles.filter(i => i.format === 'standard')"
        :key="article.id"
        :article="article"
        @click="onArticleItemClick"
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
.content-wrapper {
  @apply w-full flex flex-col items-stretch space-y-3;

  .announcement-item {
    @apply w-full bg-white px-5 md:px-8 py-4 w-full;
    @apply rounded-4xl;
    @apply shadow-2xl shadow-primary/30;
    @apply flex items-center space-x-4;
    @apply text-lg text-primary-light;

    p {
      @apply text-primary/80;
    }
  }

  .article-list {
    @apply w-full bg-white w-full;
    @apply px-5 py-5 sm:(px-8 py-8);
    @apply rounded-4xl;
    @apply shadow-2xl shadow-primary/30;
    @apply flex flex-col space-y-4;
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

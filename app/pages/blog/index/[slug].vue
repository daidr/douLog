<script setup lang="ts">
import type { IPostDetail } from '~~/types/feed'
import { formatPublishedDate } from '~/utils/date'
import IconTime from '~icons/mingcute/calendar-2-line'

definePageMeta({
  isInArticlePage: true,
})

const slug = useRoute().params.slug as string

if (!/^\d+$/.test(slug)) {
  navigateTo('/404', { replace: true })
}

const ArticleCacheId = inject('ArticleCacheId') as Ref<number>
const ArticleCache = inject('ArticleCache') as Ref<IPostDetail>
const ArticleSummaryCache = inject('ArticleSummaryCache') as Ref<string>

const article = ref<IPostDetail | null>(null)

if (`${ArticleCacheId.value}` === slug) {
  article.value = ArticleCache.value
} else {
  const { data: _article } = await useFetch<IPostDetail>(
    `/api/post/${slug}`,
  )

  if (!_article.value) {
    navigateTo('/404', { replace: true })
  }

  if (_article.value && typeof _article.value === 'object') {
    article.value = _article.value
  }
}

if (article.value && typeof article.value === 'object') {
  const post = article.value
  const _metas: { hid: string, property: string, content: string }[] = []
  _metas.push({ hid: 'og:title', property: 'og:title', content: post.title })
  _metas.push({ hid: 'twitter:creator', property: 'twitter:creator', content: '@imdaidr' })
  _metas.push({ hid: 'twitter:title', property: 'twitter:title', content: post.title })
  _metas.push({ hid: 'og:type', property: 'og:type', content: 'article' })
  _metas.push({ hid: 'og:url', property: 'og:url', content: `https://im.daidr.me/blog/${post.id}` })
  if (post.categoryName) {
    _metas.push({ hid: 'og:category', property: 'og:category', content: post.categoryName })
  }
  _metas.push({ hid: 'og:author', property: 'og:author', content: '戴兜' })
  _metas.push({ hid: 'og:published_time', property: 'og:published_time', content: post.publishedAt })
  _metas.push({ hid: 'og:site_name', property: 'og:site_name', content: '戴兜的小屋' })
  if (post.tags.length) {
    const joined = post.tags.join(',')
    _metas.push({ hid: 'keywords', property: 'keywords', content: joined })
    _metas.push({ hid: 'og:tag', property: 'og:tag', content: joined })
  }
  if (post.heroUrl) {
    _metas.push({ hid: 'og:image', property: 'og:image', content: post.heroUrl })
    _metas.push({ hid: 'twitter:image', property: 'twitter:image', content: post.heroUrl })
    _metas.push({ hid: 'twitter:card', property: 'twitter:card', content: 'summary_large_image' })
  }
  if (post.summary) {
    _metas.push({ hid: 'description', property: 'description', content: post.summary })
    _metas.push({ hid: 'og:description', property: 'og:description', content: post.summary })
    _metas.push({ hid: 'twitter:description', property: 'twitter:description', content: post.summary })
  }

  useHead({
    title: post.title,
    meta: _metas,
  })
}

const toTop = inject('toTop') as () => void

onMounted(async () => {
  if (!window) return
  const _hash = location.hash
  location.hash = ''
  await nextTick()
  location.hash = _hash
  toTop()
})

const catalogList = computed(() => {
  return article.value?.titleList || []
})

const activeTitleId = ref('')
function setActiveTitle(title: string | null) {
  activeTitleId.value = title || ''
}

const showSidebar = computed(() => catalogList.value.length > 0)

const formattedDate = computed(() => formatPublishedDate(article.value?.publishedAt))
</script>

<script lang="ts">
export default {
  name: 'ArticlePage',
}
</script>

<template>
  <div v-if="article && typeof article === 'object'" class="content-wrapper">
    <main :class="{ 'sidebar-limit': showSidebar }">
      <div class="article-wrapper" :class="{ 'sidebar-limit': showSidebar }">
        <div class="header">
          <div class="title">
            {{ article.title }}
          </div>
          <div class="details">
            <div class="time">
              <IconTime />
              {{ formattedDate }}
            </div>
          </div>
        </div>
        <UiArticleAISummary
          :article-id="article.id"
          :article-type="article.type"
          :cached-summary="ArticleSummaryCache"
        />
        <div v-if="article.heroUrl" class="article-image">
          <img :src="article.heroUrl">
        </div>
        <CommonArticleRender :article="article.content" @active-title="setActiveTitle" />
      </div>
      <div class="comments-wrapper">
        留言功能还在努力开发中
      </div>
    </main>

    <div v-if="showSidebar" class="sidebar">
      <CommonArticleCatalog v-if="catalogList.length" :catalog="catalogList" :active-title="activeTitleId" />
    </div>

    <ClientOnly>
      <Teleport to="body">
        <SiteToTopButton :show-process="true" scroll-el=".articles-page-wrapper" bounding-el=".blog-article-wrapper" />
      </Teleport>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.content-wrapper {
  @apply w-full flex;
  @apply text-dark dark-text-light;

  main {
    @apply w-full flex flex-col sm:gap-y-5 <sm:mb-8;

    .sidebar-limit {
      @apply max-w-856px;
    }
  }

  .comments-wrapper {
    @apply bg-light dark-bg-dark px-5 py-5 md:px-8 md:py-8 w-full;
    @apply sm:rounded-8 space-y-5;
    @apply sm:shadow-2xl general-shadow;
    view-transition-name: article-comments;
  }

  .article-wrapper {
    @apply bg-light dark-bg-dark px-5 py-5 md:px-8 md:py-8 w-full;
    @apply sm:rounded-8 gap-y-5 flex flex-col;
    @apply sm:shadow-2xl general-shadow;
    view-transition-name: main-wrapper;

    word-wrap: break-word;

    .title {
      @apply text-3xl md:text-4xl font-extrabold;
      @apply text-primary dark-text-primary-7;
      @apply mb-4;
      view-transition-name: article-title;
    }

    .details {
      @apply flex items-center gap-x-2;
      @apply text-sm text-primary/50 dark-text-primary-7/70;
      @apply mb-4;
      view-transition-name: article-details;

      .time {
        @apply flex items-center;

        svg {
          @apply mr-1;
        }
      }

      .origin:hover {
        @apply text-primary dark-text-primary-7;
      }
    }

    .article-image {
      @apply w-full rounded-2xl;

      img {
        view-transition-name: article-hero;
        @apply w-full rounded-2xl;
      }
      // &,
      // :deep(img) {
      //   view-transition-name: article-hero;
      //   @apply w-full rounded-2xl;
      // }
    }
  }

  .sidebar {
    @apply pl-4 flex-shrink-0 w-80;
    @apply block;
    view-transition-name: article-sidebar;
  }

  @media (max-width: 1200px) {
    .sidebar {
      @apply hidden;
    }

    .article-wrapper {
      @apply important-max-w-unset;
    }
  }
}
</style>

<script setup lang="ts">
import type { IArticleItem } from '~~/server/api/article/[id]'
// import { isDev } from '~/utils/_'
import IconTime from '~icons/icon-park-outline/time'

definePageMeta({
  isInArticlePage: true,
})

const slug = useRoute().params.slug as string

if (!/^\d+$/.test(slug)) {
  navigateTo('/404', { replace: true })
}

const ArticleCacheId = inject('ArticleCacheId') as Ref<number>
const ArticleCache = inject('ArticleCache') as Ref<IArticleItem>
const ArticleSummaryCache = inject('ArticleSummaryCache') as Ref<string>

const article = ref<IArticleItem | null>(null)

if (`${ArticleCacheId.value}` == slug) {
  article.value = ArticleCache.value
} else {
  const { data: _article } = await useFetch<IArticleItem>(
    `/api/article/${slug}`,
  )

  if (!_article.value) {
    navigateTo('/404', { replace: true })
  }

  if (_article.value && typeof _article.value === 'object') {
    article.value = _article.value
  }
}

if (article.value && typeof article.value === 'object') {
  const _metas = []
  _metas.push({
    hid: 'og:title',
    property: 'og:title',
    content: article.value.title,
  })
  _metas.push({
    hid: 'twitter:creator',
    property: 'twitter:creator',
    content: '@imdaidr',
  })
  _metas.push({
    hid: 'twitter:title',
    property: 'twitter:title',
    content: article.value.title,
  })
  _metas.push({
    hid: 'og:type',
    property: 'og:type',
    content: 'article',
  })
  _metas.push({
    hid: 'og:url',
    property: 'og:url',
    content: `https://im.daidr.me/blog/${article.value.id}`,
  })
  _metas.push({
    hid: 'og:category',
    property: 'og:category',
    content: article.value.categoryName,
  })
  _metas.push({
    hid: 'og:author',
    property: 'og:author',
    content: '戴兜',
  })
  _metas.push({
    hid: 'og:published_time',
    property: 'og:published_time',
    content: article.value.date,
  })
  _metas.push({
    hid: 'og:site_name',
    property: 'og:site_name',
    content: '戴兜的小屋',
  })
  if (article.value.tags) {
    _metas.push({
      hid: 'keywords',
      property: 'keywords',
      content: article.value.tags.join(','),
    })
    _metas.push({
      hid: 'og:tag',
      property: 'og:tag',
      content: article.value.tags.join(','),
    })
  }
  if (article.value.image) {
    _metas.push({
      hid: 'og:image',
      property: 'og:image',
      content: article.value.image,
    })
    _metas.push({
      hid: 'twitter:image',
      property: 'twitter:image',
      content: article.value.image,
    })
    _metas.push({
      hid: 'twitter:card',
      property: 'twitter:card',
      content: 'summary_large_image',
    })
  }
  if (article.value.excerpt) {
    _metas.push({
      hid: 'description',
      property: 'description',
      content: article.value.excerpt,
    })
    _metas.push({
      hid: 'og:description',
      property: 'og:description',
      content: article.value.excerpt,
    })
    _metas.push({
      hid: 'twitter:description',
      property: 'twitter:description',
      content: article.value.excerpt,
    })
  }

  useHead({
    title: article.value.title,
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
const setActiveTitle = (title: string | null) => {
  activeTitleId.value = title || ''
}

const showSidebar = computed(() => catalogList.value.length > 0)
</script>

<template>
  <div v-if="article && typeof article === 'object'" class="content-wrapper">
    <main :class="{ 'sidebar-limit': showSidebar }">
      <div class="article-wrapper" :class="{ 'sidebar-limit': showSidebar }">
        <div class="header">
          <div class="title">{{ article.title }}</div>
          <div class="details">
            <div class="time">
              <IconTime />
              {{ article.date }}
            </div>
            <div class="origin">
              <a :href="article.link" target="_blank">阅读原文</a>
            </div>
          </div>
        </div>
        <UiArticleAISummary
          :article-id="article.id"
          :cached-summary="ArticleSummaryCache"
        />
        <div v-if="article.image" class="article-image">
          <UiLazyImage :src="article.image" :thumbnail="article.thumbnail" />
        </div>
        <CommonArticleRender
          :article-html="article.content"
          @active-title="setActiveTitle"
        />
      </div>
      <div class="comments-wrapper">
        留言功能还在努力开发中，你可以前往<a
          :href="`${article.link}#respond`"
          target="_blank"
          class="text-primary hover:underline"
          >旧版博客</a
        >留下评论
      </div>
    </main>

    <div v-if="showSidebar" class="sidebar">
      <CommonArticleCatalog
        v-if="catalogList.length"
        :catalog="catalogList"
        :active-title="activeTitleId"
      />
    </div>

    <ClientOnly>
      <Teleport to="body">
        <SiteToTopButton
          :show-process="true"
          scroll-el=".articles-page-wrapper"
          bounding-el=".blog-article-wrapper"
        />
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ArticlePage',
}
</script>

<style lang="scss" scoped>
.content-wrapper {
  @apply w-full flex;

  main {
    @apply w-full sm:space-y-5 <sm:mb-8;

    .sidebar-limit {
      @apply max-w-856px;
    }
  }

  .comments-wrapper {
    @apply bg-white px-5 py-5 md:px-8 md:py-8 w-full;
    @apply sm:rounded-8 space-y-5;
    @apply sm:shadow-2xl shadow-primary/30;
    view-transition-name: article-comments;
  }

  .article-wrapper {
    @apply bg-white px-5 py-5 md:px-8 md:py-8 w-full;
    @apply sm:rounded-8 space-y-5;
    @apply sm:shadow-2xl shadow-primary/30;
    view-transition-name: main-wrapper;

    word-wrap: break-word;

    .title {
      @apply text-3xl md:text-4xl font-extrabold;
      @apply text-primary;
      @apply mb-4;
      view-transition-name: article-title;
    }

    .details {
      @apply flex items-center space-x-2;
      @apply text-sm text-primary-light;
      @apply mb-4;
      view-transition-name: article-details;

      .time {
        @apply flex items-center;

        svg {
          @apply mr-1;
        }
      }

      .origin:hover {
        @apply text-primary;
      }
    }

    .article-image {
      view-transition-name: article-hero;

      &,
      :deep(img) {
        @apply w-full rounded-2xl;
      }
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

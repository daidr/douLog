<script setup lang="ts">
import type { IArticleItem } from '~~/server/api/article/[id]'
import IconTime from '~icons/icon-park-outline/time'
import { ICatalogItem } from '~~/components/common/ArticleRender.vue'

const slug = useRoute().params.slug as string

if (!/^\d+$/.test(slug)) {
  navigateTo('/404', { replace: true })
}

const { data: article } = await useFetch<IArticleItem | string>(
  `/api/article/${slug}`
)

if (article.value === 'not found') {
  navigateTo('/404', { replace: true })
}

const setIsInArticlePage = inject('setIsInArticlePage') as (
  value: boolean
) => void

onMounted(() => {
  setIsInArticlePage(true)
})

onActivated(async () => {
  await nextTick()
  setIsInArticlePage(true)
})

const catalogList = ref([] as ICatalogItem[])
const generateCatalog = (payload: ICatalogItem[]) => {
  catalogList.value = payload
}

const activeTitleId = ref('')
const setActiveTitle = (title: string | null) => {
  activeTitleId.value = title || ''
}

const showSidebar = computed(() => catalogList.value.length > 0)
</script>

<template>
  <div v-if="article && typeof article === 'object'" class="content-wrapper">
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
      <UiArticleAISummary :article-id="article.id" />
      <div v-if="article.image" class="article-image">
        <UiLazyImage :src="article.image" />
      </div>
      <CommonArticleRender
        :article-html="article.content"
        @generate-catalog="generateCatalog"
        @active-title="setActiveTitle"
      />
    </div>

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

  .article-wrapper {
    @apply w-full bg-white px-5 py-5 md:px-8 md:py-8 w-full;
    @apply rounded-4xl space-y-5;
    @apply shadow-2xl shadow-primary/30;

    word-wrap: break-word;

    &.sidebar-limit {
      @apply max-w-856px;
    }

    .title {
      @apply text-3xl md:text-4xl font-extrabold;
      @apply text-primary;
      @apply mb-4;
    }

    .details {
      @apply flex items-center space-x-2;
      @apply text-sm text-primary-light;
      @apply mb-4;

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
      &,
      :deep(img) {
        @apply w-full rounded-2xl;
      }
    }
  }

  .sidebar {
    @apply pl-4 flex-shrink-0 w-80;
    @apply block;
  }

  @media (max-width: 1200px) {
    .sidebar {
      @apply hidden;
    }

    .article-wrapper {
      @apply max-w-[unset] !important;
    }
  }
}
</style>

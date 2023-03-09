<script setup lang="ts">
import type { IArticleItem } from '~~/server/api/article/[id]'
import IconTime from '~icons/icon-park-outline/time'

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
</script>

<template>
  <div v-if="article && typeof article === 'object'" class="content-wrapper">
    <div class="article-wrapper">
      <div class="header">
        <div class="title">{{ article.title }}</div>
        <div class="details">
          <div class="time">
            <IconTime />
            {{ article.date }}
          </div>
        </div>
      </div>
      <!-- <UiArticleAISummary /> -->
      <div v-if="article.image" class="article-image">
        <UiLazyImage :src="article.image" />
      </div>
      <CommonArticleRender :article-html="article.content" />
    </div>

    <div class="sidebar">
      <nav class="side-catalog">
        <div class="side-catalog-title">目录</div>
        <div class="side-catalog-list"></div>
      </nav>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content-wrapper {
  @apply w-full flex;

  .article-wrapper {
    @apply w-full bg-white px-5 py-5 md:px-8 md:py-8 w-full;
    @apply rounded-4xl space-y-5;
    @apply shadow-2xl shadow-primary/30;

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
    @apply hidden lg:block;
    .side-catalog {
      @apply w-full bg-white px-5 md:px-8 py-4 w-full sticky top-4;
      @apply rounded-4xl;
      @apply shadow-2xl shadow-primary/30;
    }
  }
}
</style>
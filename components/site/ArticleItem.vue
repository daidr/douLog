<script setup lang="ts">
import type { IArticleListItem } from '~~/server/api/articles'
import IconEye from '~icons/icon-park-outline/preview-open'
import IconComment from '~icons/icon-park-outline/comment'

defineProps<{ article: IArticleListItem }>()
</script>

<template>
  <NuxtLink class="article-item" :to="`/blog/${article.id}`">
    <div class="left">
      <h3 class="title">{{ article.title }}</h3>
      <div class="details">
        <div class="detail-item">{{ article.date }}</div>
        <div v-if="article.tags.length" class="detail-item">
          <span
            v-for="tag of article.tags.slice(0, 1)"
            :key="tag"
            class="tag-item"
            >#{{ tag }}</span
          >
        </div>
        <div class="detail-item">
          <IconEye />
          <span>{{ article.viewCount }}</span>
        </div>
        <div class="detail-item">
          <IconComment />
          <span>{{ article.commentCount }}</span>
        </div>
      </div>
      <div class="summary" v-html="article.excerpt"></div>
    </div>
    <div v-if="article.image" class="right">
      <UiLazyImage :src="article.image" />
    </div>
  </NuxtLink>
</template>

<style lang="scss" scoped>
.article-item {
  @apply flex-col md:flex-row flex justify-between rounded-2xl p-2;
  @apply duration-500 transition transform;
  transition-timing-function: cubic-bezier(0.36, 1.1, 0.2, 1.2);

  &:hover {
    @apply -translate-y-2;
    @apply bg-primary-extralight/50;
    @apply shadow-lg shadow-primary/10;
  }

  .left {
    @apply z-1;

    .title {
      @apply text-2xl font-bold text-primary;
    }

    .details {
      @apply flex items-center text-primary-medium/80 text-sm space-x-3;

      .detail-item {
        @apply flex items-center space-x-1;
      }
    }
    .summary {
      @apply mt-2 overflow-hidden overflow-ellipsis text-primary-medium/90;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
  }

  .right {
    @apply flex-grow-0 flex-shrink-0;
    @apply lg:ml-2;
    @apply w-240px h-163px;

    @screen <md {
      @apply mt-2 w-full;
    }

    :deep(img) {
      @apply rounded-xl object-cover;
    }
  }
}
</style>

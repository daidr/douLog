<script setup lang="ts">
import type { IArticleListItem } from '~~/server/api/articles'
import IconEye from '~icons/icon-park-outline/preview-open'
import IconComment from '~icons/icon-park-outline/comment'

defineProps<{ article: IArticleListItem }>()
</script>

<template>
  <a class="article-item" :href="`/blog/${article.id}`">
    <div class="left">
      <h3 class="title">{{ article.title }}</h3>
      <div class="details">
        <div class="detail-item">{{ article.date }}</div>
        <div v-if="article.tags.length" class="detail-item">
          <span
            v-for="tag of article.tags.slice(0, 1)"
            :key="tag"
            class="tag-item"
          >#{{ tag }}</span>
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
      <div class="summary">{{ article.excerpt }}</div>
    </div>
    <div v-if="article.image" class="right">
      <UiLazyImage :src="article.image" />
    </div>
  </a>
</template>

<style lang="scss" scoped>
.article-item {
  @apply flex-col md:flex-row flex justify-between rounded-2xl p-2;
  @apply border-gray-200/60 border-1;
  transition:
    border 0.5s linear,
    background-position-x 0.5s ease-out;
  @apply motion-reduce:transition-none;

  background-image: linear-gradient(
    90deg,
    rgba(var(--color-primary-extralight), 0.5) 0%,
    rgba(var(--color-primary-extralight), 0.5) 45%,
    transparent 65%,
    transparent 100%
  );

  background-size: 300% 100%;
  background-position-x: 100%;

  &:hover {
    @apply border-primary-light/80;
    background-position-x: 0%;
  }

  &.transition-active {
    .title {
      view-transition-name: article-title;
    }
    .details {
      view-transition-name: article-details;
    }
    .right {
      view-transition-name: article-hero;
    }
    .summary {
      view-transition-name: article-summary;
    }
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

        // .tag-item {
        //   @apply ml-2 !important;

        //   &:first-child {
        //     @apply ml-0 !important;
        //   }
        // }
      }
    }
    .summary {
      @apply mt-2 overflow-hidden text-ellipsis text-primary-medium/90;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
  }

  .right {
    @apply flex-grow-0 flex-shrink-0;
    @apply lg:ml-2;
    @apply w-240px h-163px;

    @screen lt-md {
      @apply mt-2 w-full;
    }

    :deep(img) {
      @apply rounded-xl object-cover;
    }
  }
}
</style>

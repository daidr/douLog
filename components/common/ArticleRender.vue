<script setup lang="ts">
defineProps<{
  articleHtml: string
}>()
</script>

<template>
  <article class="blog-article-wrapper" v-html="articleHtml"></article>
</template>

<style lang="scss" scoped>
article.blog-article-wrapper {
  @apply bg-white;

  :deep(blockquote) {
    @apply ml-0 pl-4 relative;
    @apply text-primary-medium;

    &:before {
      @apply absolute top-0 left-0 bottom-0 w-1.5;
      @apply bg-primary-medium rounded-full;
      content: '';
    }
  }

  :deep(p) {
    @apply my-3 leading-32px;
  }

  :deep(h2) {
    @apply text-3xl font-bold;
    @apply my-7;
  }

  :deep(h3) {
    @apply text-2xl font-bold;
    @apply my-7;
  }

  :deep(h4) {
    @apply text-xl font-bold;
    @apply my-7;
  }

  :deep(a) {
    @apply text-primary-medium;
    @apply underline;
  }

  :deep(mark) {
    @apply text-primary-medium;
  }
}
</style>

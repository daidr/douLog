<script setup lang="ts">
import type { Element } from 'hast'
import LoadingIcon from '~icons/mingcute/loading-3-line'
import ErrorIcon from '~icons/mingcute/forbid-circle-line'
import LinkIcon from '~icons/mingcute/external-link-line'
import StarIcon from '~icons/mingcute/star-fill'
import ForkIcon from '~icons/mingcute/git-branch-line'
import GitHubIcon from '~icons/mingcute/github-line'

const props = defineProps<{ node: Element }>()

const author = computed(() => {
  const author = props.node.properties?.dataMdxgithuba
  return author
})

const repo = computed(() => {
  const repo = props.node.properties?.dataMdxgithubp
  return repo
})

const link = computed(() => {
  const link = `https://github.com/${author.value}/${repo.value}`
  return link
})

const { pending, data: result, error } = useFetch(`/api/github/${author.value}/${repo.value}`, {
  lazy: true,
})
</script>

<template>
  <div class="github-card">
    <div class="badge">
      <GitHubIcon />
      GitHub
    </div>
    <div
      v-if="pending || error || !result"
      class="flex gap-1 sm-gap-2 flex-col sm-flex-row justify-center items-center text-lg"
    >
      <template v-if="error || !result">
        <ErrorIcon />
        加载失败
      </template>

      <template v-else-if="pending">
        <LoadingIcon class="animate-spin" />
        加载中
      </template>
    </div>
    <div v-else class="w-full flex flex-col items-start justify-start px-5 py-5 md:(px-5 py-5) gap-1">
      <div class="path">
        <p>
          <a rel="noopener noreferrer" target="_blank" :href="result.owner.url">{{ result.owner.login }}</a>/<a
            rel="noopener noreferrer" target="_blank" :href="result.link"
          >{{ result.name }}</a>
        </p>
      </div>
      <div v-if="result.description" class="description">
        {{ result.description }}
      </div>
      <div v-if="result.homepage" class="homepage">
        <a rel="noopener noreferrer" target="_blank" :href="result.homepage">{{ result.homepage }}</a>
      </div>
      <div class="stats">
        <div class="stats-item">
          <StarIcon />
          {{ result.stars }}
        </div>
        <div class="stats-item">
          <ForkIcon />
          {{ result.forks }}
        </div>
      </div>
    </div>
    <div class="link">
      <a rel="noopener noreferrer" target="_blank" :href="link">
        <LinkIcon />
      </a>
    </div>
  </div>
</template>

<style scoped lang="scss">
.github-card {
  @apply bg-[#414141] dark-bg-[#313131] min-h-110px rounded-xl;
  @apply flex flex-col items-center justify-center my-3;
  @apply text-white/80 relative;

  .badge {
    @apply absolute top-0 right-0 select-none;
    @apply flex items-center text-sm sm-text-base gap-0.5 sm-gap-1;
    @apply bg-white/15 text-white/60;
    @apply px-1 md-(px-2 py-0.5) rounded-tr-xl rounded-bl-xl;
  }

  .path {
    @apply flex items-center text-2xl sm:text-3xl text-white/50;

    p {
      @apply my-0;
    }

    a {
      @apply relative important-text-white/90;
      @apply underline-transparent;
      transition: text-decoration 0.15s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        @apply underline-current;
      }

      &:nth-child(1) {
        @apply text-white/50;
      }

      &:nth-child(2) {
        @apply font-bold;
      }
    }
  }

  .description {
    @apply text-base md:text-lg text-white/90;
    @apply mt-2;
  }

  .homepage a {
    @apply relative important-text-white/90;
    @apply underline-transparent;

    &:hover {
      @apply underline-current;
    }
  }

  .stats {
    @apply text-sm md:text-base text-white/70 select-none;
    @apply flex items-center gap-x-3;
    @apply mt-6;

    .stats-item {
      @apply flex items-center gap-1;
    }
  }

  .link a {
    @apply absolute bottom-5 right-5 select-none text-lg md:text-xl;
    @apply important-text-white/30;

    &:hover {
      @apply important-text-white/50;
    }
  }
}
</style>

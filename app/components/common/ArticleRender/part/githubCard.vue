<script setup lang="ts">
import type { Element, ElementContent, RootContent } from 'hast'
import LoadingIcon from '~icons/mingcute/loading-3-line'
import ErrorIcon from '~icons/mingcute/forbid-circle-line'
import LinkIcon from '~icons/mingcute/external-link-line'
import StarIcon from '~icons/mingcute/star-fill'
import ForkIcon from '~icons/mingcute/git-branch-line'
import GitHubIcon from '~icons/mingcute/github-line'

const props = defineProps<{ node: Element }>()

/**
 * 从 hast 子树里递归找第一个 `<a>` 节点的 href。
 *
 * `:::github` 容器内通常是一行 GitHub 仓库 URL，markdown-it 的 linkify 会
 * 把它解析为 `<p><a href="..."></a></p>`；这里走通用的递归而不是只看
 * 直接子节点，是为了顺手兼容作者把 URL 写成显式 markdown 链接 `[txt](url)`
 * 等情况。
 */
function findFirstAnchorHref(node: Element): string | null {
  let found: string | null = null
  const visit = (n: ElementContent | RootContent): void => {
    if (found || n.type !== 'element') return
    if (n.tagName === 'a' && typeof n.properties?.href === 'string') {
      found = n.properties.href
      return
    }
    if (n.children) n.children.forEach(visit)
  }
  node.children.forEach(visit)
  return found
}

// 解析容器内的仓库地址；不合法 / 找不到时各 computed 都退化为 null，模板里走 error 分支
const repoHref = computed(() => findFirstAnchorHref(props.node))

const ownerRepo = computed<{ owner: string, repo: string } | null>(() => {
  const href = repoHref.value
  if (!href) return null
  // 锚定 github.com 域名，避免任何 a[href] 都被识别成 github 仓库
  const match = href.match(/^https?:\/\/github\.com\/([^/?#]+)\/([^/?#]+)/i)
  if (!match) return null
  return { owner: match[1]!, repo: match[2]!.replace(/\.git$/i, '') }
})

const link = computed(() => ownerRepo.value
  ? `https://github.com/${ownerRepo.value.owner}/${ownerRepo.value.repo}`
  : repoHref.value || '#')

// 用 useFetch 让 SSR 阶段也能拉到数据（GitHub API 速率限制充裕，且 doulog 后端
// 已对该响应做 SWR 缓存 10 分钟）。无效仓库 URL 时跳过请求，模板渲染 error 卡片。
const { pending, data: result, error } = useFetch(
  () => ownerRepo.value
    ? `/api/github/${ownerRepo.value.owner}/${ownerRepo.value.repo}`
    : '',
  {
    lazy: true,
    immediate: computed(() => !!ownerRepo.value).value,
    server: true,
  },
)
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

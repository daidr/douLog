<script setup lang="ts">
import type { ContentType, IAiSummary } from '~~/types/feed'
import IconLightbulb from '~icons/mingcute/bulb-line'
import IconInfo from '~icons/mingcute/information-line'

const props = defineProps<{
  articleId: number
  articleType: ContentType
  cachedSummary?: string
}>()

const isLoading = ref(false)
const { t } = useI18n()

const summary = ref('')

if (props.cachedSummary) {
  // 列表→详情切换时复用上次拉到的内容，避免闪烁
  summary.value = props.cachedSummary
} else if (import.meta.client) {
  // 仅在浏览器端发请求：story-verse `/api/ai-summary` 后端已做并发去重 + 命中即返，
  // 一次 fetch 足够。SSR 阶段不发请求，让服务端始终输出 "加载中..." 占位，client
  // hydrate 时同样初始 isLoading=true，避免 Vue Hydration text mismatch；mount 后
  // 再异步替换为真实摘要。
  isLoading.value = true
  ;(async () => {
    try {
      const data = await $fetch<IAiSummary>(`/api/summary/${props.articleId}`, {
        query: { type: props.articleType },
      })
      summary.value = data?.content || t('ai_summary.no_summary')
    } catch {
      summary.value = t('ai_summary.no_summary')
    } finally {
      isLoading.value = false
    }
  })()
} else {
  // SSR 阶段：保持 loading 占位形态
  isLoading.value = true
}
</script>

<template>
  <div class="summary-block">
    <div class="block-title">
      <IconLightbulb />
      <span>{{ $t('ai_summary.title') }}</span>
    </div>
    <div class="block-content">
      <div v-if="isLoading">
        {{ $t('ai_summary.loading') }}
      </div>
      <div v-else>
        {{ summary }}
      </div>
    </div>
    <div class="tips">
      <div class="icon">
        <IconInfo />
      </div>
      <div class="content">
        <div>
          {{ $t('ai_summary.inspired_by') }}
          <a href="https://xlog.app/" target="_blank">
            <IconsXlog />xLog
          </a>
        </div>
        <div>
          {{ $t('ai_summary.based_on') }}
          <a href="https://chat.openai.com/" target="_blank">
            <IconsOpenai />ChatGPT
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.summary-block {
  @apply rounded-xl p-4 space-y-2;
  @apply relative;
  @apply border-1 border-gray-200 dark-border-gray-700;

  .tips {
    @apply absolute top-2 right-2;
    @apply text-sm;
    margin: 0 !important;

    .icon {
      @apply text-gray-500;
      @apply bg-gray-200/0 dark-bg-gray-800/0 p-1 rounded-md;
      @apply transition-colors;
    }

    .content {
      @apply absolute whitespace-nowrap right-0 top-7;
      @apply flex flex-col;
      @apply py-2 px-5 bg-light dark-bg-dark shadow-lg shadow-black/5 dark-shadow-white/5 rounded-lg;
      @apply pointer-events-none opacity-0 transform-gpu transition duration-500 translate-y-1;
      @apply text-dark dark-text-gray-300;
      @apply border-1 border-gray-200 dark-border-gray-700;

      &::after {
        @apply content-[''] absolute -top-1 w-full h-2 right-0;
      }

      a {
        @apply font-bold w-48px;

        &:hover {
          @apply underline;
        }

        svg {
          @apply w-1em h-1em mr-1 flex-shrink-0 inline-block mb-1px;
        }
      }
    }

    &:hover {
      .icon {
        @apply bg-gray-200/100 dark-bg-gray-800/100;
      }

      .content {
        @apply opacity-100 pointer-events-auto transform-gpu translate-y-0;
      }
    }
  }

  .block-title {
    @apply font-bold text-dark/80 dark-text-light/70 flex items-center;

    svg {
      @apply mr-2;
    }
  }

  .block-content {
    @apply text-dark/60 dark-text-light/50 leading-loose text-sm;
    view-transition-name: article-summary;
  }
}
</style>

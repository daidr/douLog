<script setup lang="ts">
import IconLightbulb from '~icons/mingcute/bulb-line'
import IconInfo from '~icons/mingcute/information-line'

const props = defineProps<{
  articleId: number
  cachedSummary?: string
}>()

const isLoading = ref(false)
const { t } = useI18n()

const summary = ref('')

if (props.cachedSummary) {
  summary.value = props.cachedSummary
} else {
  const { data: _summary } = await useFetch<string>(
    `/api/summary/${props.articleId}`,
    {
      query: { cacheonly: '1' },
    },
  )
  summary.value = _summary.value || 'no cache'
}

if (summary.value === 'no cache') {
  isLoading.value = true
  const { pending, data: _summary } = useLazyFetch<string>(
    `/api/summary/${props.articleId}`,
  )

  watchEffect(() => {
    isLoading.value = pending.value

    if (!pending.value) {
      summary.value = _summary.value || t('ai_summary.no_summary')
    }
  })
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
  @apply rounded-xl mt-4 p-4 space-y-2;
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

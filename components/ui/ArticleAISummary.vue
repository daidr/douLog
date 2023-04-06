<script setup lang="ts">
import IconLightbulb from '~icons/uil/lightbulb-alt'
import IconInfo from '~icons/uil/info-circle'

const props = defineProps<{
  articleId: number
}>()

const isLoading = ref(false)

const { data: summary } = await useFetch<string>(
  `/api/summary/${props.articleId}`,
  {
    query: { cacheonly: '1' },
  }
)

if (summary.value === 'no cache') {
  isLoading.value = true
  const { pending, data: _summary } = useLazyFetch<string>(
    `/api/summary/${props.articleId}`
  )

  watchEffect(() => {
    isLoading.value = pending.value

    if (!pending.value) {
      summary.value = _summary.value || '暂无摘要'
    }
  })
}
</script>

<template>
  <div class="summary-block">
    <div class="block-title">
      <IconLightbulb />
      <span>AI 文章摘要</span>
    </div>
    <div class="block-content">
      <div v-if="isLoading">加载中...</div>
      <div v-else>{{ summary }}</div>
    </div>
    <div class="tips">
      <div class="icon">
        <IconInfo />
      </div>
      <div class="content">
        灵感来自
        <a href="https://xlog.app/" target="_blank"
          ><img src="@/assets/images/xlog.svg" /> xLog</a
        >
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.summary-block {
  @apply border rounded-xl mt-4 p-4 space-y-2;
  @apply relative;

  .tips {
    @apply absolute top-2 right-2;
    @apply text-sm;
    margin: 0 !important;

    .icon {
      @apply text-zinc-500;
      @apply bg-[#f1f1f1] p-1 rounded-md bg-opacity-0;
      @apply transition-colors;
    }

    .content {
      @apply absolute whitespace-nowrap right-0 top-7;
      @apply flex;
      @apply py-2 px-5 bg-white shadow-lg shadow-black/5 border-1 rounded-lg;
      @apply pointer-events-none opacity-0 transform-gpu transition duration-500 translate-y-1;

      &::after {
        @apply content-[''] absolute -top-1 w-full h-2 right-0;
      }

      a {
        @apply font-bold inline-flex items-center ml-2 w-48px;

        &:hover {
          @apply underline;
        }

        img {
          @apply w-0.8em h-0.8em mr-1;
        }
      }
    }

    &:hover {
      .icon {
        @apply bg-opacity-100;
      }

      .content {
        @apply opacity-100 pointer-events-auto transform-gpu translate-y-0;
      }
    }
  }

  .block-title {
    @apply font-bold text-zinc-700 flex items-center;

    svg {
      @apply mr-2;
    }
  }

  .block-content {
    @apply text-zinc-500 leading-loose text-sm;
  }
}
</style>

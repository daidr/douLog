<script setup lang="ts">
import IconLightbulb from '~icons/uil/lightbulb-alt'

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
  </div>
</template>

<style lang="scss" scoped>
.summary-block {
  @apply border rounded-xl mt-4 p-4 space-y-2;

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

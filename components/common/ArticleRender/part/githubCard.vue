<script setup lang="ts">
import type { Element } from 'hast'

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
</script>

<template>
  <div class="github-card">
    GitHub卡片正在迭代中
    <br>
    预计24年3月5日上线
    <br>
    <a :href="link" target="_blank" rel="noopener noreferrer">{{ link }}</a>
  </div>
</template>

<style scoped lang="scss">
.github-card {
    @apply bg-[#414141] min-h-110px rounded-xl;
    @apply flex flex-col items-center justify-center my-3;
    @apply text-white/80;
}
</style>

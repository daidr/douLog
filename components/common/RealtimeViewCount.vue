<script setup lang="ts">
import { useDouSlackingStore } from '~/stores/dou-slacking'

const douSlackingStore = useDouSlackingStore()
</script>

<template>
  <p v-if="douSlackingStore.connected">
    <span>{{ douSlackingStore.connectionCount }}</span> 个人正在做客
  </p>
</template>

<style lang="scss" scoped>
p {
  @apply text-sm text-right opacity-70;

  span {
    @apply font-bold;
  }
}
</style>

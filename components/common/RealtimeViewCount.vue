<script setup lang="ts">
import { useDouSlackingStore } from '~/stores/dou-slacking'

const douSlackingStore = useDouSlackingStore()

const { t } = useI18n()
</script>

<template>
  <p v-if="douSlackingStore.connected">
    <span>{{ douSlackingStore.connectionCount }}</span>
    {{ t('dou_slacking.tips') }}
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

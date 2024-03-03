<script setup lang="ts">
import type { Element } from 'hast'

defineProps<{ node: Element }>()
</script>

<template>
  <CommonImageZoom v-bind="normalizeProperties(node.properties)" />
</template>

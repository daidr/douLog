<script setup lang="ts">
import type { Element } from 'hast'

defineProps<{ node: Element }>()
</script>

<template>
  <component
    :is="node.tagName"
    v-bind="normalizeProperties(node.properties)"
  >
    <CommonArticleRenderPartEntry v-if="node.children" :nodes="node.children" />
  </component>
</template>

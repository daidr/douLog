<script setup lang="ts">
import type { Element } from 'hast'

defineProps<{ node: Element }>()
</script>

<template>
  <component
    :is="node.tagName" v-bind="{
      ...node.properties,
      class: node.properties?.className,
    }"
  >
    <CommonArticleRenderPartEntry v-if="node.children" :nodes="node.children" />
  </component>
</template>

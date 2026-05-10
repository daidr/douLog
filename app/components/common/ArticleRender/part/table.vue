<script setup lang="ts">
import type { Element } from 'hast'

defineProps<{ node: Element }>()
</script>

<template>
  <!--
    包一层 .table-container：
      - ArticleRender index.vue 里 :deep(.table-container) 已经定义好了
        圆角、外边框、tbody hover、滚动条收敛等样式
      - 把表格本身放进容器内，让宽表在窄屏可以横向滚动
  -->
  <div class="table-container">
    <table v-bind="normalizeProperties(node.properties)">
      <CommonArticleRenderPartEntry v-if="node.children" :nodes="node.children" />
    </table>
  </div>
</template>

<style lang="scss" scoped>
.table-container {
  @apply overflow-x-auto;
}
</style>

import type { Element, RootContent, Text } from 'hast'

import PartElement from './element.vue'
import PartCodeBlock from './codeBlock.vue'
import PartImage from './image.vue'
import PartGithubCard from './githubCard.vue'
import PartTable from './table.vue'
import PartGallery from './gallery.vue'

function classNameIncludes(node: Element, className: string) {
  return typeof node.properties?.className === 'object' && node.properties?.className?.includes(className)
}

/**
 * 选择渲染该 hast 节点的 Vue 组件。
 *
 * 派发顺序按"特异性"由窄到宽：
 *   1. `<pre>` —— markdown-it 渲染代码块默认产物；codeBlock 组件内部按
 *      code.className 取语言并走 shiki 高亮
 *   2. `<table>` —— 套一层 `.table-container` 让现有横向滚动 + 圆角样式生效
 *   3. `<img>` —— 单图走 ImageZoom（点击放大）
 *   4. `<div class="custom-block-gallery">` —— `:::gallery` 容器，渲染轮播
 *   5. `<div class="wp-block-mdx-github">` —— 兼容历史 WP 短代码（markdown
 *      内容里通常不会出现，保留是为了文本化迁移时不破图）
 *   6. 其他 —— PartElement，按 hast 透传
 */
function switchComponent(node: Element) {
  if (node.tagName === 'pre') {
    return PartCodeBlock
  }
  if (node.tagName === 'table') {
    return PartTable
  }
  if (node.tagName === 'img') {
    return PartImage
  }
  if (node.tagName === 'div' && classNameIncludes(node, 'custom-block-gallery')) {
    return PartGallery
  }
  if (node.tagName === 'div' && classNameIncludes(node, 'custom-block-github')) {
    return PartGithubCard
  }
  return PartElement
}

export default defineComponent((props) => {
  const filteredNodes = computed(() => {
    return props.nodes.filter(node => node.type === 'element' || node.type === 'text') as (Element | Text)[]
  })
  return () => {
    return filteredNodes.value.map((node) => {
      if (node.type === 'text') return node.value
      const Comp = switchComponent(node)
      return h(Comp, { node })
    })
  }
}, {
  props: {
    nodes: {
      type: Array as PropType<RootContent[]>,
      required: true,
    },
  },
})

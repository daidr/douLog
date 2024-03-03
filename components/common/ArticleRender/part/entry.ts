import type { Element, RootContent, Text } from 'hast'

import PartElement from './element.vue'
import PartCodeBlock from './codeBlock.vue'
import PartImage from './image.vue'
import PartGithubCard from './githubCard.vue'

function classNameIncludes(node: Element, className: string) {
  return typeof node.properties?.className === 'object' && node.properties?.className?.includes(className)
}

function switchComponent(node: Element) {
  // 代码块
  if (node.tagName === 'pre' && classNameIncludes(node, 'wp-block-code')) {
    return PartCodeBlock
  }
  if (node.tagName === 'img') {
    return PartImage
  }
  if (node.tagName === 'div' && classNameIncludes(node, 'wp-block-mdx-github')) {
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

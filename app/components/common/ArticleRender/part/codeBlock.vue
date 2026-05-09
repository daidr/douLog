<script setup lang="ts">
import type { Element, Text } from 'hast'
import './shiki.scss'

const props = defineProps<{ node: Element }>()

function langTransform(lang: string) {
  switch (lang) {
    case 'markup':
      return 'html'
    default:
      return lang
  }
}

function getLang(node: Element) {
  try {
    const codeNode = node.children[0] as Element
    const classNameList = codeNode.properties?.className as string[]
    const lang = classNameList.find(item => item.startsWith('language-'))
    return langTransform(lang?.replace('language-', '') || 'text')
  } catch (error) {
    return 'text'
  }
}

function getCode(node: Element) {
  try {
    const codeNode = node.children[0] as Element
    let text = ''

    for (const child of codeNode.children) {
      if (child.type === 'text') {
        text += child.value
      } else if (child.type === 'element' && child.tagName === 'br') {
        if (text[text.length - 1] !== '\n') text += '\n'
      }
    }

    return text
  } catch (error) {
    return ''
  }
}

const { t } = useI18n()

const lang = computed(() => getLang(props.node))
const code = computed(() => getCode(props.node))

const { processing, html } = useCodeHighlight({ lang, code })

const copyStats = ref<0 | 1 | 2>(0)
const copyTips = computed(() => {
  switch (copyStats.value) {
    case 0:
      return t('code_block.copy')
    case 1:
      return t('code_block.copy_success')
    case 2:
      return t('code_block.copy_failure')
  }
})

const ShikiCodeBlockRef = ref<HTMLElement | null>(null)
async function richCopy() {
  try {
    if (!ShikiCodeBlockRef.value) return false
    const text = ShikiCodeBlockRef.value.textContent || ''
    const codeEl = ShikiCodeBlockRef.value.querySelector('code')!
    let html = codeEl.innerHTML
    html = html.replaceAll(/--shiki-dark:#[A-Za-z0-9]{3,8}/g, '')
    const style = 'font-family: Consolas, Monaco, \'Courier New\', \'PingFang SC\', monospace, Consolas, \'Courier New\', monospace;font-weight: normal;font-size: 16px;line-height: 22px;white-space: pre;'
    html = html.split('\n').join(`</div><div>`)
    html = `<div style="${style}"><div>${html}</div></div>`
    const data = [new ClipboardItem({
      'text/plain': new Blob([text], { type: 'text/plain' }),
      'text/html': new Blob([html], { type: 'text/html' }),
    })]
    await navigator.clipboard.write(data)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

let copyTimer: NodeJS.Timeout
async function onCopyClick() {
  clearTimeout(copyTimer)
  if (await richCopy()) {
    copyStats.value = 1
  } else {
    copyStats.value = 2
  }
  copyTimer = setTimeout(() => {
    copyStats.value = 0
  }, 1000)
}
</script>

<template>
  <div class="shiki-toolbar-wrapper">
    <pre v-if="!processing" ref="ShikiCodeBlockRef" class="shiki" v-html="html" />
    <pre v-else ref="ShikiCodeBlockRef" class="shiki"><code>{{ code }}</code></pre>
    <div class="code-toolbar">
      <div class="code-copy-btn" @click="onCopyClick">
        {{ copyTips }}
      </div>
      <div class="code-lang-text">
        {{ lang || '❌' }}
      </div>
    </div>
  </div>
</template>

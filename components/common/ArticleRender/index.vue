<script setup lang="ts">
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.min.css'
import { initMdxGitCards } from '~~/article-gadgets/mdx-github-card'
import '~~/article-gadgets/mdx-github-card/style.scss'
import './hljs-light.scss'

const props = defineProps<{
  articleHtml: string
}>()

const WARN_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" class="mdui-icon" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 16a1 1 0 1 0 1 1a1 1 0 0 0-1-1Zm10.67 1.47l-8.05-14a3 3 0 0 0-5.24 0l-8 14A3 3 0 0 0 3.94 22h16.12a3 3 0 0 0 2.61-4.53Zm-1.73 2a1 1 0 0 1-.88.51H3.94a1 1 0 0 1-.88-.51a1 1 0 0 1 0-1l8-14a1 1 0 0 1 1.78 0l8.05 14a1 1 0 0 1 .05 1.02ZM12 8a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V9a1 1 0 0 0-1-1Z"/></svg>'

const _articleHtml = computed(() => {
  return (
    props.articleHtml
      // 替换警告图标
      .replaceAll(
        '<i class="mdui-icon material-icons">warning</i><br>',
        WARN_ICON
      )
  )
})

const emit = defineEmits<{
  (event: 'active-title', payload: string | null): void
}>()

const onScroll = throttleAndDebounce(checkActiveTitle, 100)

const ArticleContentWrapperRef = ref<HTMLElement | null>(null)

onMounted(() => {
  // 文章滚动容器
  const articlePageWrapper = document.querySelector('.articles-page-wrapper')

  // 判断当前激活的标题
  requestAnimationFrame(checkActiveTitle)

  // 监听滚动事件
  articlePageWrapper!.addEventListener('scroll', onScroll)

  // 解析并注入 iframe 等短代码
  injectElement()

  // 绑定灯箱
  bindImageViewer()

  injectCustomPlugins()

  injectCodeToolbar()
})

function injectCodeToolbar() {
  if (typeof window === 'undefined') return
  const codeBlocks = document.querySelectorAll('.hljs-toolbar-wrapper')
  codeBlocks.forEach(item => {
    const toolbar = document.createElement('div')
    toolbar.className = 'code-toolbar'
    const copyBtn = document.createElement('div')
    copyBtn.className = 'code-copy-btn'
    copyBtn.innerText = '复制'
    let timer: NodeJS.Timeout
    copyBtn.addEventListener('click', () => {
      const text = item.children[0].textContent || ''
      navigator.clipboard.writeText(text)
      clearTimeout(timer)
      copyBtn.innerText = '已复制'
      timer = setTimeout(() => {
        copyBtn.innerText = '复制'
      }, 1000)
    })
    const codeLangText = document.createElement('div')
    codeLangText.className = 'code-lang-text'
    codeLangText.innerText = item.children[0].getAttribute('lang') || '❌'
    toolbar.append(copyBtn)
    toolbar.append(codeLangText)
    item.append(toolbar)
  })
}

function injectCustomPlugins() {
  if (typeof window === 'undefined') return

  // 解析 Github 卡片短代码
  initMdxGitCards()
}

function injectElement() {
  if (typeof window === 'undefined') return
  const elements = document.querySelectorAll('blog-dynamic-inject')
  elements.forEach(item => {
    const element = item.getAttribute('data-element')
    item.append(document.createRange().createContextualFragment(element!))
    item.remove()
  })
}

onUnmounted(() => {
  const articlePageWrapper = document.querySelector('.articles-page-wrapper')
  articlePageWrapper!.removeEventListener('scroll', onScroll)
})

let titles = [] as HTMLHeadingElement[]

function checkActiveTitle() {
  if (!ArticleContentWrapperRef.value) return
  const articlePageWrapper = document.querySelector('.articles-page-wrapper')
  if (titles.length === 0) {
    titles = [
      ...ArticleContentWrapperRef.value.querySelectorAll(
        'h1, h2, h3, h4, h5, h6'
      ),
    ] as HTMLHeadingElement[]
  }
  const scrollY = articlePageWrapper?.scrollTop || 0
  const innerHeight = articlePageWrapper!.clientHeight
  const offsetHeight = articlePageWrapper!.scrollHeight
  const isBottom = Math.abs(scrollY + innerHeight - offsetHeight) < 1
  if (titles.length && isBottom) {
    emit('active-title', titles[titles.length - 1].id)
    return
  }
  for (let i = 0; i < titles.length; i++) {
    const title = titles[i]
    const nextTitle = titles[i + 1]
    const [isActive, id] = isTitleActive(i, title, nextTitle)
    if (isActive) {
      emit('active-title', id)
      return
    }
  }
}
function getTitleTop(title: HTMLHeadingElement): number {
  return title.offsetTop + 130
}
function isTitleActive(
  index: number,
  title: HTMLHeadingElement,
  nextTitle: HTMLHeadingElement | undefined
): [boolean, string | null] {
  const articlePageWrapper = document.querySelector('.articles-page-wrapper')
  const scrollTop = articlePageWrapper?.scrollTop || 0
  if (index === 0 && scrollTop === 0) {
    return [true, null]
  }
  if (scrollTop < getTitleTop(title)) {
    return [false, null]
  }
  if (!nextTitle || scrollTop < getTitleTop(nextTitle)) {
    return [true, title.id]
  }
  return [false, null]
}

function bindImageViewer() {
  if (typeof window === 'undefined') return
  {
    // 如果img标签外层有a标签，则去除a标签
    const images = document.querySelectorAll('.blog-article-wrapper img')
    images.forEach(img => {
      if (img.parentElement?.tagName.toLowerCase() === 'a') {
        img.parentElement.replaceWith(img)
      }
    })
  }

  {
    new Viewer(document.querySelector('.blog-article-wrapper')!, {
      inline: false,
      fullscreen: false,
      filter: (image: HTMLImageElement) => {
        return !image.classList.contains('wp-smiley')
      },
    })
  }
}
</script>

<template>
  <article
    ref="ArticleContentWrapperRef"
    class="blog-article-wrapper"
    v-html="_articleHtml"
  ></article>
</template>

<style lang="scss" scoped>
article.blog-article-wrapper {
  @apply bg-white;

  :deep(blockquote) {
    @apply ml-0 pl-4 relative;
    @apply text-primary-medium;

    &:before {
      @apply absolute top-0 left-0 bottom-0 w-1.5;
      @apply bg-primary-medium rounded-full;
      content: '';
    }

    .mdui-icon {
      @apply text-xl;
    }
  }

  :deep(blockquote.mdx-warning) {
    @apply text-red-700/80;
    &:before {
      @apply bg-red-700/80;
    }
  }

  :deep(p) {
    @apply my-3 leading-32px;
  }

  :deep(h2) {
    @apply text-3xl font-bold;
    @apply my-7;
  }

  :deep(h3) {
    @apply text-2xl font-bold;
    @apply my-7;
  }

  :deep(h4) {
    @apply text-xl font-bold;
    @apply my-7;
  }

  :deep(a) {
    @apply text-primary-medium;
    @apply underline;
  }

  :deep(mark) {
    @apply text-primary-medium;
  }

  :deep(code:not([class='hljs-code'])) {
    @apply bg-primary/10 px-1 rounded-md text-primary;
  }

  :deep(.table-container),
  :deep(.mdui-table-fluid) {
    @apply border-2 border-primary-light my-3;
    @apply rounded-8px overflow-y-hidden;

    table {
      @apply mx-0 border-none border-separate;
      @apply relative w-full bg-white;
      border-spacing: 0;

      thead {
        @apply bg-primary-extralight/80;
      }

      td,
      th {
        @apply relative box-border;
        @apply px-28px py-12px;
        @apply text-left align-middle;
      }

      th {
        @apply text-primary font-bold text-sm leading-32px;
        @apply overflow-hidden whitespace-nowrap overflow-ellipsis;
      }

      td:first-child,
      th:first-child {
        @apply pr-0 pl-24px;
      }

      tbody td,
      tbody th,
      thead th {
        @apply border-b-2 border-primary-light;
      }

      tbody tr {
        @apply transition-colors relative;
      }

      tbody tr:hover {
        @apply bg-primary-extralight/50;
      }

      tbody tr:last-child td,
      tbody tr:last-child th {
        @apply border-none;
      }
    }
  }

  :deep(.cp_embed_wrapper) {
    @apply my-3;
  }

  :deep(img) {
    @apply my-3;
    @apply rounded-2xl;
  }

  :deep(img:not(.wp-smiley)) {
    @apply cursor-pointer;
  }

  :deep(figure) {
    @apply m-0;

    img {
      @apply m-0;
    }
  }

  :deep(.wp-block-gallery.has-nested-images) {
    @apply flex gap-2 flex-col sm:flex-row;
  }
}
</style>

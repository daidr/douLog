<script setup lang="ts">
import Prism from 'prismjs'
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.min.css'

export interface ICatalogItem {
  key: string
  title: string
  level: number
}

const props = defineProps<{
  articleHtml: string
}>()

const WARN_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" class="mdui-icon" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 16a1 1 0 1 0 1 1a1 1 0 0 0-1-1Zm10.67 1.47l-8.05-14a3 3 0 0 0-5.24 0l-8 14A3 3 0 0 0 3.94 22h16.12a3 3 0 0 0 2.61-4.53Zm-1.73 2a1 1 0 0 1-.88.51H3.94a1 1 0 0 1-.88-.51a1 1 0 0 1 0-1l8-14a1 1 0 0 1 1.78 0l8.05 14a1 1 0 0 1 .05 1.02ZM12 8a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V9a1 1 0 0 0-1-1Z"/></svg>'

const encodeHtmlAttr = (str: string) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const _articleHtml = computed(() => {
  let headingIndex = 0
  return (
    props.articleHtml
      // 替换警告图标
      .replaceAll(
        '<i class="mdui-icon material-icons">warning</i> <br/>',
        WARN_ICON
      )
      // 让表格包裹一个容器
      .replaceAll(
        /(<table id="tablepress-\d+" class="tablepress tablepress-id-\d+">[\s\S]*<\/table>)/g,
        (_: any, p1: any) => {
          return `<div class="table-container">${p1}</div>`
        }
      )
      // 将所有script标签替换为blog-dynamic-inject标签
      .replaceAll(/(<script[\s\S]*?<\/script>)/g, (_: any, p1: any) => {
        return `<blog-dynamic-inject data-element="${encodeHtmlAttr(
          p1
        )}"></blog-dynamic-inject>`
      })
      // 为所有heading标签添加id
      .replaceAll(
        /(<h(\d) ([\s\S]*?)>([\s\S]*?)<\/h\d>)/g,
        (_: any, _p1: any, p2: any, p3: any, p4: any) => {
          return `<h${p2} id="ah-${headingIndex++}" ${p3}>${p4}</h${p2}>`
        }
      )
  )
})

const emit = defineEmits<{
  (event: 'generate-catalog', payload: ICatalogItem[]): void
  (event: 'active-title', payload: string | null): void
}>()

const onScroll = throttleAndDebounce(checkActiveTitle, 100)

onMounted(() => {
  const articleContent = document.querySelector('.blog-article-wrapper')
  const articlePageWrapper = document.querySelector('.articles-page-wrapper')
  let minTitleLevel = 6
  if (articleContent) {
    const title = articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const titleList: ICatalogItem[] = []
    title.forEach(item => {
      const level = Number(item.tagName.replace('H', ''))
      if (level < minTitleLevel) minTitleLevel = level
    })
    let tagIndex = 0
    title.forEach(item => {
      const level = Number(item.tagName.replace('H', ''))
      const titleItem: ICatalogItem = {
        key: (item.id = `ah-${tagIndex++}`),
        title: (item as HTMLElement).innerText,
        level: level - minTitleLevel,
      }
      titleList.push(titleItem)
    })
    emit('generate-catalog', titleList)
    requestAnimationFrame(checkActiveTitle)
    articlePageWrapper!.addEventListener('scroll', onScroll)
  }
  Prism.highlightAll()
  injectElement()
  bindImageViewer()
})

function injectElement() {
  if (typeof window === 'undefined') return
  const elements = document.querySelectorAll('blog-dynamic-inject')
  elements.forEach(item => {
    const element = item.getAttribute('data-element')
    console.log(element)
    item.append(document.createRange().createContextualFragment(element!))
    item.remove()
  })
}

onUnmounted(() => {
  const articlePageWrapper = document.querySelector('.articles-page-wrapper')
  articlePageWrapper!.removeEventListener('scroll', onScroll)
})

function checkActiveTitle() {
  const articleContent = document.querySelector('.blog-article-wrapper')
  const articlePageWrapper = document.querySelector('.articles-page-wrapper')
  if (articleContent) {
    const titles = [
      ...articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6'),
    ] as HTMLHeadingElement[]
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
    const viewer = new Viewer(
      document.querySelector('.blog-article-wrapper')!,
      {
        inline: false,
        fullscreen: false,
        viewed() {
          viewer.zoomTo(1)
        },
        filter: (image: HTMLImageElement) => {
          return !image.classList.contains('wp-smiley')
        },
      }
    )
  }
}
</script>

<template>
  <article class="blog-article-wrapper" v-html="_articleHtml"></article>
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

  :deep(.wp-block-code) {
    @apply rounded-2xl;
  }

  :deep(code:not([class*='language-'])) {
    @apply bg-primary/10 px-1 rounded-md text-primary;
  }

  :deep(.toolbar) {
    @apply top-[0.5em] right-[0.5em] text-base;
    @apply flex items-start justify-end space-x-1;

    .toolbar-item {
      @apply flex items-start select-none;

      & > span {
        @apply pointer-events-none;
      }

      & > * {
        @apply bg-white shadow-none text-primary-medium/80;

        &:hover,
        &:focus {
          @apply text-primary;
        }
      }
    }

    .copy-to-clipboard-button {
      @apply cursor-pointer text-base;
    }
  }

  :deep(.wp-block-code) {
    @apply bg-primary-dark;
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

  :deep(img) {
    @apply my-3;
  }

  :deep(img:not(.wp-smiley)) {
    @apply cursor-pointer;
  }
}
</style>

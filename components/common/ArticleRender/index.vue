<script setup lang="ts">
import type { Root } from 'hast'
import './wp-block-gallery.scss'

defineProps<{
  article: Root
}>()

const emit = defineEmits<{
  (event: 'activeTitle', payload: string | null): void
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
  // injectElement()
})

function injectElement() {
  if (typeof window === 'undefined') return
  const elements = document.querySelectorAll('blog-dynamic-inject')
  elements.forEach((item) => {
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
        'h1, h2, h3, h4, h5, h6',
      ),
    ] as HTMLHeadingElement[]
  }
  const scrollY = articlePageWrapper?.scrollTop || 0
  const innerHeight = articlePageWrapper!.clientHeight
  const offsetHeight = articlePageWrapper!.scrollHeight
  const isBottom = Math.abs(scrollY + innerHeight - offsetHeight) < 1
  if (titles.length && isBottom) {
    emit('activeTitle', titles[titles.length - 1].id)
    return
  }
  for (let i = 0; i < titles.length; i++) {
    const title = titles[i]
    const nextTitle = titles[i + 1]
    const [isActive, id] = isTitleActive(i, title, nextTitle)
    if (isActive) {
      emit('activeTitle', id)
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
  nextTitle: HTMLHeadingElement | undefined,
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
</script>

<template>
  <article ref="ArticleContentWrapperRef" class="blog-article-wrapper">
    <CommonArticleRenderPartEntry :nodes="article.children" />
  </article>
</template>

<style lang="scss" scoped>
article.blog-article-wrapper {
  @apply bg-light dark-bg-dark;
  @apply text-dark dark-text-light/80;

  :deep(blockquote) {
    @apply ml-0 pl-4 relative;
    @apply text-primary-4 dark-text-primary-7;

    &:before {
      @apply absolute top-0 left-0 bottom-0 w-1.5;
      @apply bg-primary-4 dark-bg-primary-7 rounded-full;
      content: '';
    }

    .mdui-icon {
      @apply text-xl;
    }
  }

  :deep(blockquote.mdx-warning) {
    @apply text-red-700/80 dark-text-red-500/80;
    &:before {
      @apply bg-red-700/80 dark-text-red-500/80;
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
    @apply text-primary-4 dark-text-primary-7;
    @apply underline;
  }

  :deep(mark) {
    @apply text-primary-4 dark-text-primary-7;
  }

  :deep(code:not(.shiki code)) {
    @apply bg-primary-1/70 dark-bg-primary-2 px-1 rounded-md text-primary-7 dark-text-primary-8;
  }

  :deep(.table-container),
  :deep(.mdui-table-fluid) {
    @apply border-2 border-primary-2 dark-border-primary-4 my-3;
    @apply rounded-8px overflow-y-hidden;

    table {
      @apply mx-0 border-none border-separate;
      @apply relative w-full bg-light dark-bg-dark;
      border-spacing: 0;

      thead {
        @apply bg-primary-1/80;
      }

      td,
      th {
        @apply relative box-border;
        @apply px-28px py-12px;
        @apply text-left align-middle;
      }

      th {
        @apply text-primary-text font-bold text-sm leading-32px;
        @apply overflow-hidden whitespace-nowrap text-ellipsis;
      }

      td:first-child,
      th:first-child {
        @apply pr-0 pl-24px;
      }

      tbody td,
      tbody th,
      thead th {
        @apply border-b-2 border-primary-2 dark-border-primary-4;
      }

      tbody tr {
        @apply transition-colors relative;
      }

      tbody tr:hover {
        @apply bg-primary-1/50 dark-bg-primary-2/50;
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

  :deep(.wp-block-gallery .wp-block-image) {
    @apply m-0;

    img {
      @apply m-0;
    }
  }

  :deep(ol) {
    @apply ml-3.5rem relative space-y-2 my-8;
    counter-reset: ol-step-counter;

    & > li {
      counter-increment: ol-step-counter;
      &::before {
        @apply bg-primary-1/70 dark-bg-primary-2 text-primary-7 dark-text-primary-8 rounded-full absolute;
        @apply inline-flex flex-shrink-0 h-1.5rem w-1.5rem justify-center;
        @apply -ml-2.5rem mr-1rem;
        content: counter(ol-step-counter);
        transform: translateY(0.1875rem);
      }
    }
  }

  :deep(ul) {
    @apply ml-3.5rem relative space-y-2 my-8;

    & > li {
      &::before {
        @apply h-0.5rem w-0.5rem inline-flex content-empty;
        @apply bg-primary dark-bg-primary-8 rounded-full absolute;
        @apply -ml-1.5rem mr-0.5rem;
        transform: translateY(0.625rem);
      }
    }
  }
}
</style>

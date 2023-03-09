<script setup lang="ts">
export interface ICatalogItem {
  key: string
  title: string
  level: number
}

defineProps<{
  articleHtml: string
}>()
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
})

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
  return title.offsetTop - 10
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
</script>

<template>
  <article class="blog-article-wrapper" v-html="articleHtml"></article>
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
}
</style>

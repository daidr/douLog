import { useRouter } from '#app/composables/router'
import { defineNuxtPlugin } from '#app/nuxt'

// import { wait } from '~~/utils/_'

function getNavigationType(fromName: string, toName: string) {
  if (fromName === 'blog-index-slug' && toName === 'blog-index') {
    return 'post-page-to-list'
  }

  if (fromName === 'blog-index' && toName === 'blog-index-slug') {
    return 'list-to-post-page'
  }

  return 'other'
}

export default defineNuxtPlugin((nuxtApp) => {
  //   // TODO: 暂时禁用
  //   // TODO: 由于整个过渡的触发时机有问题，导致用户体验不是很好
  //   return
  if (!document.startViewTransition) {
    return
  }

  let finishTransition: undefined | (() => void)
  let abortTransition: undefined | (() => void)

  const router = useRouter()

  router.beforeResolve((to, from) => {
    const navigationType = getNavigationType(
      from.name as string,
      to.name as string,
    )

    if (navigationType === 'other') {
      return
    }

    if (
      to === from
      || to.matched.every(
        (comp, index) =>
          comp.components
          && comp.components?.default === from.matched[index]?.components?.default,
      )
    ) {
      return
    }
    const promise = new Promise<void>((resolve, reject) => {
      finishTransition = resolve
      abortTransition = reject
    })

    let changeRoute: () => void
    const ready = new Promise<void>(resolve => (changeRoute = resolve))

    let targetArticleItem: Element

    if (navigationType === 'list-to-post-page') {
      const slug = to.params.slug
      const _targetArticleItem = document.querySelector(
        `a.article-item[href='/blog/${slug}']`,
      )
      document.querySelector('html')!.classList.add('list-to-post-page')

      if (_targetArticleItem) {
        _targetArticleItem.classList.add('transition-active')
        targetArticleItem = _targetArticleItem
      }
    }

    const transition = document.startViewTransition!(() => {
      changeRoute()
      promise.then(() => {
        if (navigationType === 'post-page-to-list') {
          const slug = from.params.slug
          const _targetArticleItem
            = document.querySelector(`a.article-item[href='/blog/${slug}']`)
            || document.querySelector(`a.article-item`)
          document.querySelector('html')!.classList.add('post-page-to-list')
          if (_targetArticleItem) {
            _targetArticleItem.classList.add('transition-active')
            targetArticleItem = _targetArticleItem
          }
        }
      })
      return promise
    })

    transition.finished.then(() => {
      abortTransition = undefined
      finishTransition = undefined
    })

    transition.finished.finally(() => {
      targetArticleItem?.classList.remove('transition-active')
      document.querySelector('html')!.classList.remove('post-page-to-list')
      document.querySelector('html')!.classList.remove('list-to-post-page')
    })

    return ready
  })

  nuxtApp.hook('vue:error', () => {
    abortTransition?.()
    abortTransition = undefined
  })

  nuxtApp.hook('page:finish', async () => {
    await wait(100)
    finishTransition?.()
    finishTransition = undefined
  })
})

declare global {
  interface Document {
    startViewTransition?: (callback: () => Promise<void> | void) => {
      finished: Promise<void>
      updateCallbackDone: Promise<void>
      ready: Promise<void>
    }
  }
}

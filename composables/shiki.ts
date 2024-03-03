import ShikiWorker from '~/workers/shiki?worker'

export interface UseCodeHighlightProps {
  lang: MaybeRefOrGetter<string>
  code: MaybeRefOrGetter<string>
}

export interface UseCodeHighlightReturn {
  processing: Ref<boolean>
  html: Ref<string>
}

export function useCodeHighlight(props: UseCodeHighlightProps): UseCodeHighlightReturn {
  const processing = ref(true)
  const html = ref('')
  if (import.meta.env.SSR) {
    return {
      processing,
      html,
    }
  }

  let worker: Worker | undefined

  const lang = computed(() => toValue(props.lang))
  const code = computed(() => toValue(props.code))

  watch([lang, code], async () => {
    processing.value = true
    if (worker) {
      worker.terminate()
    }
    worker = new ShikiWorker()
    worker.addEventListener('message', (event) => {
      html.value = event.data
      processing.value = false
      worker?.terminate()
    })
    worker.postMessage({ lang: lang.value, code: code.value })
  }, {
    immediate: true,
  })

  onScopeDispose(() => {
    worker?.terminate()
  })

  return {
    processing,
    html,
  }
}

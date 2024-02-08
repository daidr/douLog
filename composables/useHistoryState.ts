export function useHistoryState() {
  // ignore SSR
  if (typeof window === 'undefined') {
    return
  }
  const router = useRouter()
  const history = shallowRef<History['state']>(window.history.state)

  watch(router.currentRoute, () => {
    history.value = {
      ...window.history.state,
    }
  })

  return history
}

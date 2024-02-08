export function useHistory() {
  const history = shallowRef<History>(window.history)
  const handler = () => {
    history.value = window.history
  }
  window.addEventListener('popstate', handler)

  onScopeDispose(() => {
    window.removeEventListener('popstate', handler)
  })
}

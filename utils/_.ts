export function forceReflow() {
  return document.body.offsetHeight
}

export function shuffle(arr: any[]) {
  const newArr = [...arr]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
  }
  return newArr
}

export function throttleAndDebounce(fn: Function, delay: number) {
  let timeoutId: number
  let called = false

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    if (!called) {
      fn()
      called = true
      setTimeout(() => {
        called = false
      }, delay)
    } else {
      timeoutId = setTimeout(fn, delay)
    }
  }
}

export function isDev() {
  return process.env.NODE_ENV === 'development'
}

export const wait = (ms: number) => new Promise(r => setTimeout(r, ms))

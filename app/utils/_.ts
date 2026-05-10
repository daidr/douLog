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

export function normalizeProperties(properties: Record<string, any> | null | undefined) {
  const normalized: Record<string, any> = {}
  if (!properties) return normalized
  for (const [k, v] of Object.entries(properties)) {
    if (k === 'className') {
      // hast 用 className（数组），DOM 上写 class（空格分隔字符串）
      normalized.class = Array.isArray(v) ? v.join(' ') : v
    } else if (Array.isArray(v)) {
      // hast 把 list-typed HTML 属性（rel / accept / itemProp / sandbox …）存为
      // string[]，但浏览器期望空格分隔的字符串。Vue 透传 array 时会用 toString
      // 默认行为得到逗号分隔的值（浏览器不识别），最终 attribute 直接消失——
      // 必须在这里 join 一次让 setAttribute 能正确生效。
      normalized[k] = v.join(' ')
    } else {
      normalized[k] = v
    }
  }
  return normalized
}

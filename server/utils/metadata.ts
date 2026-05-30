import type { SiteMetadata } from '~~/types/metadata'

/**
 * 站点 metadata 的服务端状态（server state）。
 *
 * 模块级内存缓存在整个 Nitro 进程内存活。访问策略（见 getSiteMetadata）：
 *   - 有缓存：立即返回当前缓存，后台异步刷新（不阻塞本次请求）
 *   - 冷启动（缓存为空）：同步等待首次拉取，避免首屏空数据
 *
 * 这样「每次访问返回 state 里的值，并顺手请求 metadata 接口更新 state」，
 * 浏览器全程只经 DouLog 自身的 /api/metadata（SSR 注水），不直接打 story-verse。
 */
let cache: SiteMetadata | null = null
let refreshing: Promise<void> | null = null

function refresh(apiEntry: string): Promise<void> {
  // 并发去抖：同一时刻只允许一个在途刷新
  if (refreshing) {
    return refreshing
  }
  refreshing = (async () => {
    try {
      cache = await $fetch<SiteMetadata>('/api/metadata', { baseURL: apiEntry })
    }
    catch {
      // 拉取失败保留旧值，不把缓存打回 null
    }
    finally {
      refreshing = null
    }
  })()
  return refreshing
}

export async function getSiteMetadata(apiEntry: string): Promise<SiteMetadata | null> {
  if (cache === null) {
    await refresh(apiEntry)
    return cache
  }
  void refresh(apiEntry)
  return cache
}

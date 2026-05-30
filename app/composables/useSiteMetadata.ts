import type { SiteMetadata } from '~~/types/metadata'

/**
 * 站点 metadata 的全局只读访问。基于 useAsyncData + 固定 key 共享：
 *   - SSR 期间在服务端调用 DouLog 的 /api/metadata（命中 server-state 缓存）
 *   - 结果序列化进 payload，浏览器注水时直接复用，不再发起请求
 *   - 多个组件调用本 composable 共享同一份数据（按 key 去重）
 */
export function useSiteMetadata() {
  const { data } = useAsyncData<SiteMetadata | null>(
    'site-metadata',
    () => $fetch<SiteMetadata>('/api/metadata').catch(() => null),
    { default: () => null },
  )
  return data
}

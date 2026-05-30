/**
 * DouLog 自身的 metadata 端点。读 server-state 缓存并触发后台刷新（见
 * server/utils/metadata.ts）。仅由 app 在 SSR 期间经 useAsyncData 调用，
 * 结果随 payload 注水到浏览器——浏览器不会直接请求它，更不会直连 story-verse。
 */
export default defineEventHandler(async () => {
  const { apiEntry } = useRuntimeConfig()
  return await getSiteMetadata(apiEntry)
})

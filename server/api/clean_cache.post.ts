import { Buffer } from 'node:buffer'
import { timingSafeEqual } from 'node:crypto'

/**
 * 清空 Nitro handler 缓存。
 *
 * 会打穿整站缓存、让所有请求回源 story-verse，所以必须鉴权：
 *   POST /api/clean_cache
 *   Authorization: Bearer <NUXT_CACHE_PURGE_TOKEN>
 *
 * 未配置 NUXT_CACHE_PURGE_TOKEN 时接口视为关闭（404），避免空 token 被当成有效凭据。
 */
function tokenMatches(provided: string, expected: string) {
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export default defineEventHandler(async (event) => {
  const { cachePurgeToken } = useRuntimeConfig(event)
  if (!cachePurgeToken) {
    throw createError({ statusCode: 404 })
  }

  const header = getHeader(event, 'authorization') ?? ''
  const provided = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : ''
  if (!provided || !tokenMatches(provided, cachePurgeToken)) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const storage = useStorage()
  const cacheKeys = await storage.getKeys('cache:nitro:handlers:')
  for (const cacheKey of cacheKeys) {
    await storage.removeItem(cacheKey)
  }
  return { cleared: cacheKeys.length }
})

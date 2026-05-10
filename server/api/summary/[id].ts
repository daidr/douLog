import type { IAiSummary } from '~~/types/feed'
import type { SvAiSummaryResponse } from '../../utils/sv'

const { apiEntry } = useRuntimeConfig()

const VALID_TYPES = new Set(['post', 'note', 'page'])

/**
 * AI 摘要 thin proxy。
 *
 * 直接转发到 story-verse `/api/ai-summary`，后者负责：
 *   - 同 (refType, refId, locale) 并发请求去重
 *   - 命中已存在且 createdAt >= post.updatedAt 的摘要直接返回
 *   - 全局串行队列控制 LLM 调用频率
 *   - 站长禁用 / 缺 key / 不存在等错误的 4xx 映射
 *
 * 请求形态：`GET /api/summary/:id?type=post|note`，type 默认为 `post`，因为
 * douLog 历史链接（旧 WordPress 时代）只指向博客文章。失败 / 后端不可达统一
 * 退化为 `{ content: '' }`，让前端按"暂无摘要"渲染。
 */
export default defineEventHandler(async (event): Promise<IAiSummary> => {
  const id = (getRouterParam(event, 'id') as unknown as number) - 0
  const typeParam = getQuery(event).type?.toString() || 'post'
  const refType: 'post' | 'note' | 'page' = VALID_TYPES.has(typeParam)
    ? typeParam as 'post' | 'note' | 'page'
    : 'post'

  // 与 story-verse locale 归一化对齐（lowercase + underscore）
  const locale = 'zh_cn'

  const empty: IAiSummary = {
    refType,
    refId: id,
    lang: locale,
    content: '',
    createdAt: null,
  }

  if (Number.isNaN(id)) {
    return empty
  }

  try {
    const result = await $fetch<SvAiSummaryResponse>('/api/ai-summary', {
      baseURL: apiEntry,
      query: {
        refType,
        refId: id,
        locale,
      },
    })

    return {
      refType: result.refType,
      refId: result.refId,
      lang: result.lang,
      content: result.content,
      createdAt: result.createdAt,
    }
  } catch (error) {
    console.error(error)
    return empty
  }
})

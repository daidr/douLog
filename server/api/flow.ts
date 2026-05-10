import type { IFlowItem } from '~~/types/feed'
import type { SvPostListItem } from '../utils/sv'
import { buildMediaUrl } from '../utils/sv'

const { apiEntry } = useRuntimeConfig()

/** 与 story-verse `FlowQueryDTO` 的 size 上限保持一致；douLog 暂时按 10 条/页滚动。 */
const PAGE_SIZE = 10

interface FlowResponse {
  list: SvPostListItem[]
  total: number
  hasNext: boolean
  nextCursor?: number
}

function mapFlowItem(item: SvPostListItem): IFlowItem {
  // listPublic 强制 status='published' 隐含 publishedAt 非空；createdAt 仅作兜底
  const publishedAt = item.publishedAt || item.createdAt

  const heroUrl = item.heroId
    ? buildMediaUrl(apiEntry, item.heroId, { webp: true, etag: item.heroEtag })
    : null

  return {
    id: item.id,
    type: item.type,
    title: item.title,
    summary: item.summary || '',
    slug: item.slug,
    tags: item.tags || [],
    categoryName: item.categoryName || '',
    commentsCount: item.commentsCount,
    viewsCount: item.viewsCount,
    heroUrl,
    mood: item.mood,
    weather: item.weather,
    publishedAt,
  }
}

/**
 * 公开内容流 —— 直接代理到 story-verse `/api/flow`，返回 post + note 按
 * `publishedAt DESC, id DESC` 混合后的时间线。
 *
 * 选择 page+size 而非 cursor 是为了对齐前端 `page = list.length / size + 1`
 * 的滚动加载语义；服务端仍是同一组数据，只是使用 offset 分页。
 *
 * SWR 5 秒沿用旧版策略：流的 head 区域允许略微陈旧以换取列表请求被 nitro
 * 在站点内统一缓存。
 */
export default cachedEventHandler(
  async (event) => {
    let page
      = ((getQuery(event).page?.toString() || '1') as unknown as number) - 0

    if (Number.isNaN(page) || page < 1) {
      page = 1
    }

    const result = await $fetch<FlowResponse>('/api/flow', {
      baseURL: apiEntry,
      query: {
        page,
        size: PAGE_SIZE,
      },
    })

    return {
      list: result.list.map(mapFlowItem),
      total: result.total,
      hasNext: result.hasNext,
    }
  },
  {
    swr: true,
    maxAge: 5,
  },
)

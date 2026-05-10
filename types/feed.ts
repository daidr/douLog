import type { Root } from 'hast'

/**
 * 内容亚型——与 story-verse 后端 `posts.type` 字段同义。`page` 不会出现在
 * 列表 / 详情接口里（flow 仅返回 post + note；详情走 /api/post/:id 也只用于
 * 文章页），但保留在类型里以便日后 page 接入时无需再开类型缝。
 */
export type ContentType = 'post' | 'note' | 'page'

/**
 * 列表项——对应 douLog `/api/flow` 接口形态，与 story-verse 后端同名字段
 * 直接保持一致，避免双套名词（excerpt/summary、viewCount/viewsCount）造成
 * 心智负担。
 *
 * 字段语义：
 *   - `summary`：可能为空字符串，render 端再决定是否兜底从 content 截取
 *   - `categoryName`：分类被解除关联（categoryId=null）时为空字符串
 *   - `tags`：始终是数组，无标签时为 []
 *   - `heroUrl`：服务端预拼好的 `/api/media/raw/...` URL，含 etag 破坏参数
 *   - `mood` / `weather`：仅 `type === 'note'` 可能携带，其余为 null
 *   - `publishedAt`：ISO 8601 字符串；仅 published 内容会出现在 flow，故必有值
 */
export interface IFlowItem {
  id: number
  type: ContentType
  title: string
  summary: string
  slug: string | null
  tags: string[]
  categoryName: string
  commentsCount: number
  viewsCount: number
  heroUrl: string | null
  mood: string | null
  weather: string | null
  publishedAt: string
}

/**
 * 文章正文目录条目。生成自 hast 的 h1~h6 节点，`key` 是 slug 后的元素 id。
 */
export interface ICatalogItem {
  key: string
  title: string
  level: number
}

/**
 * 详情形态——`/api/post/:id` 接口返回。在 IFlowItem 基础上加入正文 hast、
 * 目录、缩略图与渲染耗时统计。
 */
export interface IPostDetail extends IFlowItem {
  content: Root
  titleList: ICatalogItem[]
  heroThumbnailUrl: string | null
  duration?: Record<string, number>
}

/**
 * AI 摘要响应——透传 story-verse `/api/ai-summary` 的字段形态。
 *
 * 失败 / 缺失时返回 `{ content: '' }` 形态，调用方据此决定是否兜底渲染
 * "暂无摘要"等文案。
 */
export interface IAiSummary {
  refType: ContentType
  refId: number
  lang: string
  content: string
  createdAt: string | null
}

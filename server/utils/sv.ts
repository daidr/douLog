/**
 * story-verse 后端的字段类型与媒体 URL 助手。
 *
 * 后端公开接口（`/api/posts`、`/api/posts/:id`、`/api/ai-summary` 等）的形态在这里
 * 集中描述，避免每个 server route 各写一份零散的 any。字段集合按 PostService 的
 * select 形态对齐：列表项与详情比详情多了 `content`、`imageIds`、`relatedPostIds`，
 * 其余字段共享。
 */

export interface SvPostListItem {
  id: number
  title: string
  type: 'post' | 'note' | 'page'
  summary: string | null
  slug: string | null
  pin: boolean
  tags: string[] | null
  categoryId: number | null
  commentsCount: number
  likesCount: number
  viewsCount: number
  heroId: number | null
  mood: string | null
  weather: string | null
  allowComments: boolean
  authorId: number
  status: 'draft' | 'published'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  categoryName: string | null
  categorySlug: string | null
  authorName: string | null
  heroEtag: string | null
  /** 封面图的 BlurHash 字符串（用于列表封面的渐进式模糊占位）；无封面时为 null */
  heroBlurHash: string | null
}

export interface SvPostDetail extends SvPostListItem {
  content: string
  imageIds: number[] | null
  relatedPostIds: number[] | null
}

export interface SvPostListResponse {
  list: SvPostListItem[]
  total: number
  hasNext: boolean
  nextCursor?: number
}

export interface SvAiSummaryResponse {
  refType: 'post' | 'note' | 'page'
  refId: number
  lang: string
  content: string
  createdAt: string
}

/**
 * 公开端点 `/api/friend-links` 的形态——已在 story-verse 侧把 email 替换为
 * sha256 hash，原文邮箱不下发；列表一次性返回全量（无分页包裹）。
 */
export interface SvFriendLink {
  id: number
  name: string
  description: string | null
  url: string
  emailHash: string | null
  createdAt: string
  updatedAt: string
}

/**
 * 公开端点 `/api/projects` 的形态——一次性全量数组（按 id 倒序）。
 *
 * 字段含义对齐 story-verse `ProjectService.listAllPublic` 的 select：
 *   - `categoryTitle`：从 project_categories 表 left-join 出的分类名；项目
 *     未分配分类（projectCategoryId=null）或分类已被删除（cascade set null）
 *     时为 null
 *   - `imageEtag`：封面图的 etag，用于拼 `?v=` 缓存破坏参数；imageId 为
 *     null（未设置封面）时本字段同样为 null
 */
export interface SvProject {
  id: number
  title: string
  description: string | null
  projectCategoryId: number | null
  imageId: number | null
  repoLink: string | null
  homepageLink: string | null
  createdAt: string
  updatedAt: string
  categoryTitle: string | null
  imageEtag: string | null
}

/**
 * 公开端点 `/api/project-categories` 的形态——一次性全量数组（按 id 升序）。
 */
export interface SvProjectCategory {
  id: number
  title: string
  description: string | null
  slug: string
  createdAt: string
  updatedAt: string
}

/**
 * 由媒体 id 拼出公开访问 URL。
 *
 * story-verse 的图片走 `/api/media/raw/:id`，可附加 `?webp=true` 取衍生品 / `?thumbnail=true`
 * 取 192 方图。`heroEtag` 不参与路径但作为缓存破坏参数挂在 query 上——后端的
 * `Cache-Control: immutable` 是按 etag 命名的文件给出的，etag 变化时同 id 的 URL
 * 不变会被 CDN / 浏览器误命中旧缓存，加 `?v=` 把这种情况显式打掉。
 */
export function buildMediaUrl(
  apiEntry: string,
  id: number,
  opts: { webp?: boolean, thumbnail?: boolean, etag?: string | null } = {},
): string {
  const params = new URLSearchParams()
  if (opts.webp) params.set('webp', 'true')
  if (opts.thumbnail) params.set('thumbnail', 'true')
  if (opts.etag) params.set('v', opts.etag)
  const qs = params.toString()
  return `${apiEntry.replace(/\/+$/, '')}/api/media/raw/${id}${qs ? `?${qs}` : ''}`
}

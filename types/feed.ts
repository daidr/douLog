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
  likesCount: number
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
 * 友链项 —— `/api/friends` 的返回形态。story-verse `friend_links.email` 在
 * douLog 服务端 proxy 里被 sha256 后拼成 gravatar URL，浏览器侧只看到 URL，
 * 拿不到原文邮箱。`avatarUrl` 一定是字符串：邮箱缺失时仍指向 cravatar 空 hash，
 * 由远端返回 mystery person 占位。
 */
export interface IFriendItem {
  id: number
  name: string
  description: string
  url: string
  avatarUrl: string
}

/**
 * 单个项目展示形态——`/api/projects` 在 douLog 服务端聚合后的产物。
 *
 * - `repoLink` / `homepageLink`：两条独立的外链，模板里各对应一个图标按钮。
 *   两者都为 null 的项目仍会出现在列表里（保留 hover 视觉），只是没有可点
 *   击的入口
 * - `imageUrl`：媒体 raw URL（带 etag 破坏参数）；项目未设置封面时为 null，
 *   渲染端展示占位
 */
export interface IProjectItem {
  id: number
  title: string
  description: string
  imageUrl: string | null
  repoLink: string | null
  homepageLink: string | null
}

/**
 * 项目页一行分组——对应一个项目分类，含该分类下按 id 倒序排列的项目。
 *
 * 由 douLog 服务端把 story-verse 的两份全量数据（projects + categories）做
 * 内存 group-by 而来；只输出至少含一条可展示项目的分类。
 */
export interface IProjectSection {
  id: number
  title: string
  projects: IProjectItem[]
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

// ───────────────────────────────────────────────────────────────────────
// 评论
// ───────────────────────────────────────────────────────────────────────
//
// 直接对齐 story-verse `/api/posts/:id/comments` / `/api/comments/*` 公开端
// 点的形态，无 douLog 侧的字段重命名。
// 字段语义：
//   - `author` / `guest` 二选一：登录用户走 author（含 id / username），匿
//     名用户走 guest（仅 name + 可选 website + 邮箱 hash 用作 gravatar）
//   - `emailHash`：sha256(lowercase(email))，用于拼 gravatar URL；服务端不
//     回原文邮箱
//   - `parentAuthorName`：仅在回复时非 null，表示"@ 谁"
//   - `repliesPreview`：顶层评论自带的前 3 条回复，超出走 `/api/comments/:id/
//     replies` 分页拉取

export interface ICommentAuthor {
  id: number
  name: string
  emailHash: string | null
  username: string | null
}

export interface ICommentGuest {
  name: string
  emailHash: string | null
  website: string | null
}

export interface IReply {
  id: number
  content: string
  refType: ContentType
  postId: number
  rootId: number | null
  parentId: number | null
  parentAuthorName: string | null
  author: ICommentAuthor | null
  guest: ICommentGuest | null
  createdAt: string
}

export interface ITopLevelComment extends IReply {
  pinned: boolean
  repliesCount: number
  repliesPreview: IReply[]
}

export interface ICommentList<T> {
  list: T[]
  total: number
  hasNext: boolean
  nextCursor?: number
}

export interface ICreateCommentBody {
  postId: number
  content: string
  parentId?: number
  guestName?: string
  guestEmail?: string
  guestWebsite?: string
  /** 蜜罐字段，前端表单不渲染，只在提交体里塞空字符串。 */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  website_url?: string
}

/**
 * 提交评论的响应。
 *
 * 当评论被直接 approved（admin / 已登录 / 同邮箱白名单）时 `data` 携带新评
 * 论本体；当落入 pending（首次匿名等）时 `data` 缺失，前端据此提示"已提
 * 交待审核"。蜜罐触发时也返 `success: true` 但 `data` 缺失，看起来跟
 * pending 一致——这是故意的，机器人无法据响应区分。
 */
export interface ICreateCommentResponse {
  success: boolean
  data?: IReply
}

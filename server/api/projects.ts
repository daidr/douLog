import type { IProjectItem, IProjectSection } from '~~/types/feed'
import type { SvProject, SvProjectCategory } from '../utils/sv'
import { buildMediaUrl } from '../utils/sv'

const { apiEntry } = useRuntimeConfig()

function mapProject(p: SvProject): IProjectItem {
  return {
    id: p.id,
    title: p.title,
    description: p.description ?? '',
    imageUrl: p.imageId
      ? buildMediaUrl(apiEntry, p.imageId, { webp: true, etag: p.imageEtag })
      : null,
    repoLink: p.repoLink,
    homepageLink: p.homepageLink,
  }
}

/**
 * 项目页数据 —— 把 story-verse 的两份全量 (projects + project-categories) 在
 * 服务端做内存级 group-by 后下发。
 *
 * 接口形态选这一层聚合是因为：浏览器最终需要"按分类分组的项目列表"，story-
 * verse 公开端点给的是平铺的两个数组。聚合的成本完全可在服务端摊掉，浏览
 * 器拿到的就是渲染就绪结构，少一轮客户端 reduce / Map.set 样板。
 *
 * 过滤规则：
 *   - 没分类的项目不展示（categoryId 为 null）—— 用"分配分类"作为"是否上线"
 *     的隐式信号，跟 admin 的工作流契合
 *   - 没项目的分类整段不输出 —— 避免空 section 占用滚动条
 *
 * 注意：repoLink / homepageLink 都缺失的项目仍会出现在列表里，仅在浏览器侧
 * 不渲染图标按钮。卡片本身不再是 `<a>`，"没链接但有卡片"的形态在 UI 上是
 * 合理的。
 *
 * SWR 60s 与其它公开列表一致，落到 nitro cache 之后浏览器侧每页一次请求。
 */
export default cachedEventHandler(
  async () => {
    const [projects, categories] = await Promise.all([
      $fetch<SvProject[]>('/api/projects', { baseURL: apiEntry }),
      $fetch<SvProjectCategory[]>('/api/project-categories', { baseURL: apiEntry }),
    ])

    // projects 已按 id 倒序——分组时直接 push 即可，无需重新排序
    const grouped = new Map<number, IProjectItem[]>()
    for (const p of projects) {
      if (p.projectCategoryId === null) continue
      const bucket = grouped.get(p.projectCategoryId)
      if (bucket) {
        bucket.push(mapProject(p))
      }
      else {
        grouped.set(p.projectCategoryId, [mapProject(p)])
      }
    }

    const sections: IProjectSection[] = []
    for (const c of categories) {
      const items = grouped.get(c.id)
      if (!items || items.length === 0) continue
      sections.push({ id: c.id, title: c.title, projects: items })
    }
    return sections
  },
  {
    swr: true,
    maxAge: 60,
  },
)

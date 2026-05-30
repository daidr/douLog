/**
 * story-verse 公开 metadata 接口（`/api/metadata`）的形态。server / app 共用。
 * social[].icon 是后端已解析好的完整 `<svg>` 字符串，直接 v-html 渲染。
 */
export interface SiteMetadataSocial {
  url: string
  label: string
  icon: string
}

export interface SiteMetadata {
  profile: {
    name: string
    enName: string
    motto: string
  }
  social: SiteMetadataSocial[]
  site: {
    title: string
    description: string
    keywords: string[]
  }
  icp: string
}

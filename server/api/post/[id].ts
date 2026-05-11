import type { Element, ElementContent, Root, RootContent } from 'hast'
import { pinyin } from '@napi-rs/pinyin'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import slugify from 'slug'
import type { ICatalogItem, IPostDetail } from '~~/types/feed'
import { renderMarkdown } from '../../utils/markdown'
import type { SvPostDetail } from '../../utils/sv'
import { buildMediaUrl } from '../../utils/sv'
import { defineCountableCachedEventHandler } from '../utils/countable-cache-handler'

const WARN_ICON
  = '<svg xmlns="http://www.w3.org/2000/svg" class="mdui-icon" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 16a1 1 0 1 0 1 1a1 1 0 0 0-1-1Zm10.67 1.47l-8.05-14a3 3 0 0 0-5.24 0l-8 14A3 3 0 0 0 3.94 22h16.12a3 3 0 0 0 2.61-4.53Zm-1.73 2a1 1 0 0 1-.88.51H3.94a1 1 0 0 1-.88-.51a1 1 0 0 1 0-1l8-14a1 1 0 0 1 1.78 0l8.05 14a1 1 0 0 1 .05 1.02ZM12 8a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V9a1 1 0 0 0-1-1Z"/></svg>'

const { apiEntry } = useRuntimeConfig()

function encodeHtmlAttr(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * 对渲染后的 HTML 做几条 douLog 历史保留下来的 patch。
 *
 * 这些规则原本是为旧 WP HTML 设计（短代码、TablePress、md-icon），story-verse
 * 的 markdown 通常不会触发它们；保留是为了：
 *   - 作者在 markdown 中手写 <table> / <script> 时仍按既定方式包装
 *   - 兼容历史富文本片段（迁移时直接粘贴 HTML 也能正常呈现）
 */
function preHandleArticleContent(html: string) {
  return (
    html
      // 把 <script> 包到自定义元素里延迟挂载，避免 SSR 直接执行
      .replaceAll(/(<script[\s\S]*?<\/script>)/g, (_: any, p1: any) => {
        return `<blog-dynamic-inject data-element="${encodeHtmlAttr(
          p1,
        )}"></blog-dynamic-inject>`
      })
      // TablePress 风格的表格外包一层容器（如果作者贴了原 HTML）
      .replaceAll(
        /(<table id="tablepress-\d+" class="tablepress tablepress-id-\d+">[\s\S]*<\/table>)/g,
        (_: any, p1: any) => {
          return `<div class="table-container">${p1}</div>`
        },
      )
      // 兼容旧文章里 mdui 的 warning 图标语法
      .replaceAll(
        '<i class="mdui-icon material-icons">warning</i><br>',
        WARN_ICON,
      )
  )
}

function handleArticleHeading(root: Root) {
  const titleNodes: Element[] = []
  let minTitleLevel = 6
  const traverse = (node: ElementContent | RootContent) => {
    if (node.type !== 'element') return
    if (node.tagName === 'h1' || node.tagName === 'h2' || node.tagName === 'h3' || node.tagName === 'h4' || node.tagName === 'h5' || node.tagName === 'h6') {
      const level = Number(node.tagName.replace('h', ''))
      if (level < minTitleLevel) minTitleLevel = level
      titleNodes.push(node)
    }
    if (node.children) {
      node.children.forEach(traverse)
    }
  }
  root.children.forEach(traverse)
  const titleList: ICatalogItem[] = []
  const conflictingSlugMap = new Map<string, number>()

  for (const title of titleNodes) {
    const level = Number(title.tagName.replace('h', ''))
    const content = hastToPureText(title)
    let slug = slugify(pinyin(content).join('-'))
    const conflictingSlugCount = conflictingSlugMap.get(slug) || 0
    conflictingSlugMap.set(slug, conflictingSlugCount + 1)
    if (conflictingSlugCount > 0) {
      slug = `${slug}-${conflictingSlugCount}`
    }

    const titleItem: ICatalogItem = {
      key: (title.properties.id = `h-${slug}`),
      title: content,
      level: level - minTitleLevel,
    }
    titleList.push(titleItem)
  }

  return titleList
}

// 移除图片外层的 a 标签（让点击图片走预览，不被锚跳走）
function handleExtraImageLink(root: Root) {
  const traverse = (node: ElementContent | RootContent) => {
    if (node.type !== 'element') return
    if (node.tagName === 'a' && node.children.length === 1 && node.children[0].type === 'element' && node.children[0].tagName === 'img') {
      const img = node.children[0] as Element
      node.properties = img.properties
      node.children = img.children
      node.tagName = img.tagName
      return
    }
    if (node.children) {
      node.children.forEach(traverse)
    }
  }
  root.children.forEach(traverse)
}

/**
 * 详情代理 —— 调 story-verse `/api/posts/:id`，把 markdown 正文转成 hast，
 * 再附上 TOC 和媒体 URL。后端的 getPublic 已强制 status='published' 且非
 * private，404 / draft / private 都被它吞成 404，这边直接捕获并抛 400。
 */
export default defineCountableCachedEventHandler(
  async (event) => {
    const id = (getRouterParam(event, 'id') as unknown as number) - 0
    if (Number.isNaN(id)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID should be an integer',
      })
    }

    const { record, recordAsync, getRecords } = createRecord()

    try {
      const result = await recordAsync('fetch', () => $fetch<SvPostDetail>(
        `/api/posts/${id}`,
        {
          baseURL: apiEntry,
        },
      ))

      const renderedHtml = record('renderMarkdown', () => renderMarkdown(result.content, { apiEntry }))
      const preHandledHtml = record('preHandle', () => preHandleArticleContent(renderedHtml))
      const parseAst = record('parseTree', () => fromHtmlIsomorphic(preHandledHtml, { fragment: true }))
      const titleList = record('toc', () => handleArticleHeading(parseAst))
      record('extraImageLink', () => handleExtraImageLink(parseAst))

      const publishedAt = result.publishedAt || result.createdAt
      const heroUrl = result.heroId
        ? buildMediaUrl(apiEntry, result.heroId, { webp: true, etag: result.heroEtag })
        : null
      const heroThumbnailUrl = result.heroId
        ? buildMediaUrl(apiEntry, result.heroId, { thumbnail: true, etag: result.heroEtag })
        : null

      const detail: IPostDetail = {
        id: result.id,
        type: result.type,
        title: result.title,
        summary: result.summary || '',
        slug: result.slug,
        tags: result.tags || [],
        categoryName: result.categoryName || '',
        commentsCount: result.commentsCount,
        likesCount: result.likesCount,
        viewsCount: result.viewsCount,
        heroUrl,
        heroThumbnailUrl,
        mood: result.mood,
        weather: result.weather,
        publishedAt,
        content: parseAst,
        titleList,
        duration: getRecords(),
      }

      return detail
    } catch (e) {
      console.error(e)
      throw createError({
        statusCode: 400,
        statusMessage: 'not found',
      })
    }
  },
  {
    swr: true,
    maxAge: 60,
  },
)

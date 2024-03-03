import qs from 'qs'

import { decode } from 'html-entities'
import slugify from 'slug'

import type { Element, ElementContent, Root, RootContent } from 'hast'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import { pinyin } from '@napi-rs/pinyin'
import { defineCountableCachedEventHandler } from '../utils/countable-cache-handler'
import { replaceMediaCDN } from '~~/utils/mediaCDN'

const WARN_ICON
  = '<svg xmlns="http://www.w3.org/2000/svg" class="mdui-icon" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 16a1 1 0 1 0 1 1a1 1 0 0 0-1-1Zm10.67 1.47l-8.05-14a3 3 0 0 0-5.24 0l-8 14A3 3 0 0 0 3.94 22h16.12a3 3 0 0 0 2.61-4.53Zm-1.73 2a1 1 0 0 1-.88.51H3.94a1 1 0 0 1-.88-.51a1 1 0 0 1 0-1l8-14a1 1 0 0 1 1.78 0l8.05 14a1 1 0 0 1 .05 1.02ZM12 8a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V9a1 1 0 0 0-1-1Z"/></svg>'

const { apiEntry } = useRuntimeConfig()

export interface ICatalogItem {
  key: string
  title: string
  level: number
}

export interface IArticleItem {
  id: number
  link: string
  title: string
  content: Root
  excerpt: string
  titleList: ICatalogItem[]
  image?: string
  thumbnail?: string
  commentCount: number
  viewCount: number
  categoryName: string
  previousPostId: number | null
  previousPostTitle: number | null
  nextPostId: number | null
  nextPostTitle: number | null
  tags: string[]
  format: string
  date: string
  duration?: Record<string, number>
}

function encodeHtmlAttr(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function preHandleArticleContent(html: string) {
  return (
    html
      // 修改script标签
      .replaceAll(/(<script[\s\S]*?<\/script>)/g, (_: any, p1: any) => {
        return `<blog-dynamic-inject data-element="${encodeHtmlAttr(
          p1,
        )}"></blog-dynamic-inject>`
      })
      // 让表格包裹一个容器
      .replaceAll(
        /(<table id="tablepress-\d+" class="tablepress tablepress-id-\d+">[\s\S]*<\/table>)/g,
        (_: any, p1: any) => {
          return `<div class="table-container">${p1}</div>`
        },
      )
      // 替换警告图标
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

// 移除图片外层的a标签
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

export default defineCountableCachedEventHandler(
  async (event) => {
    const articleID = (getRouterParam(event, 'id') as unknown as number) - 0
    if (Number.isNaN(articleID)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID should be an integer',
      })
    }

    const { record, recordAsync, getRecords } = createRecord()

    const query = qs.stringify(
      {
        _fields: [
          'id',
          'link',
          'title',
          'excerpt',
          'content',
          'post_full_image',
          'post_medium_image',
          'post_date',
          'category_name',
          'pageviews',
          'previous_post_id',
          'previous_post_title',
          'next_post_id',
          'next_post_title',
          'total_comments',
          '_links.wp:term',
          '_links.wp:featuredmedia',
          'format',
        ],
        _embed: ['wp:term'],
      },
      { encodeValuesOnly: true },
    )

    try {
      const result = await recordAsync('fetch', () => $fetch(
        `/wp-json/wp/v2/posts/${articleID}?${query}`,
        {
          baseURL: apiEntry,
        },
      )) as any

      const preHandledHtml = record('preHandle', () => preHandleArticleContent(result.content.rendered))

      const parseAst = record('parseTree', () => fromHtmlIsomorphic(preHandledHtml, { fragment: true }))

      const titleList = record('toc', () => handleArticleHeading(parseAst))

      record('extraImageLink', () => handleExtraImageLink(parseAst))

      const _result: IArticleItem = {
        id: result.id,
        link: result.link,
        title: decode(result.title.rendered),
        excerpt: htmlToPureText(result.excerpt.rendered),
        content: parseAst,
        titleList,
        image: result._links['wp:featuredmedia']
          ? replaceMediaCDN(result.post_full_image)
          : undefined,
        thumbnail: result._links['wp:featuredmedia']
          ? replaceMediaCDN(result.post_medium_image)
          : undefined,
        commentCount: result.total_comments,
        viewCount: result.pageviews,
        categoryName: result.category_name,
        previousPostId: result.previous_post_id,
        previousPostTitle: result.previous_post_title,
        nextPostId: result.next_post_id,
        nextPostTitle: result.next_post_title,
        tags: result._embedded['wp:term'][1].map((tag: any) => tag.name),
        format: result.format,
        date: result.post_date,
        duration: getRecords(),
      }

      return _result
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
    maxAge: 1,
  },
)

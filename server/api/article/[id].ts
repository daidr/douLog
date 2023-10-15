import qs from 'qs'
import { replaceMediaCDN } from '~~/utils/mediaCDN'
import minifyHtml from '~~/utils/minifyHtml'
import hljs from 'highlight.js'

import { JSDOM } from 'jsdom'
import { decode } from 'html-entities'
import { htmlToPureText } from '~/utils/stringify'
import { defineCountableCachedEventHandler } from '../utils/countable-cache-handler'
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
  content: string
  excerpt: string
  titleList: ICatalogItem[]
  image: string
  thumbnail: string
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
}

const encodeHtmlAttr = (str: string) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const preHandleArticleContent = (html: string) => {
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
  )
}

const handleArticleHeading = (html: string) => {
  const dom = new JSDOM(html)
  const { document } = dom.window
  let minTitleLevel = 6
  const title = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const titleList: ICatalogItem[] = []
  title.forEach(item => {
    const level = Number(item.tagName.replace('H', ''))
    if (level < minTitleLevel) minTitleLevel = level
  })
  let tagIndex = 0
  title.forEach(item => {
    const level = Number(item.tagName.replace('H', ''))
    const titleItem: ICatalogItem = {
      key: (item.id = `ah-${tagIndex++}`),
      title: (item as HTMLElement).textContent || '',
      level: level - minTitleLevel,
    }
    titleList.push(titleItem)
  })

  return {
    html: dom.serialize(),
    titleList,
  }
}

const handleArticleCodeHighlight = (html: string) => {
  const dom = new JSDOM(html)
  const { document } = dom.window
  // 获取所有 pre 标签
  let preList = [...document.querySelectorAll('pre')]
  // 过滤掉子标签不是 code 的 pre 标签
  preList = preList.filter(
    item => item.children.length === 1 && item.children[0].tagName === 'CODE',
  )
  if (preList.length === 0) return html
  // 获取所有语言
  const langList = preList.map(item => {
    const lang = /language-(\w*)/.exec(item.children[0].className) || []
    return lang[1]
  })

  for (let i = 0; i < preList.length; i++) {
    const str = preList[i].textContent || ''
    let lang = langList[i] || ''
    switch (lang) {
      case 'markup':
        lang = 'html'
        break
    }
    if (lang && hljs.getLanguage(lang)) {
      const _result = hljs.highlight(str, {
        language: lang,
        ignoreIllegals: true,
      })
      preList[i].outerHTML =
        `<div class="hljs-toolbar-wrapper"><pre class="hljs" lang="${lang}"><code class="hljs-code">` +
        _result.value +
        '</code></pre></div>'
    } else {
      preList[
        i
      ].outerHTML = `<div class="hljs-toolbar-wrapper"><pre class="hljs" lang="❌"><code class="hljs-code">${str}</code></pre></div>`
    }
  }

  return dom.serialize()
}

export default defineCountableCachedEventHandler(
  async event => {
    const articleID = (getRouterParam(event, 'id') as unknown as number) - 0
    if (isNaN(articleID)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID should be an integer',
      })
    }

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
      const result = (await $fetch(
        `/wp-json/wp/v2/posts/${articleID}?${query}`,
        {
          baseURL: apiEntry,
        },
      )) as any

      const { html, titleList } = handleArticleHeading(
        handleArticleCodeHighlight(
          preHandleArticleContent(result.content.rendered),
        ),
      )

      const _result = {
        id: result.id,
        link: result.link,
        title: decode(result.title.rendered),
        excerpt: htmlToPureText(result.excerpt.rendered),
        content: minifyHtml(html),
        titleList,
        image: result._links['wp:featuredmedia']
          ? replaceMediaCDN(result.post_full_image)
          : null,
        thumbnail: result._links['wp:featuredmedia']
          ? replaceMediaCDN(result.post_medium_image)
          : null,
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
      } as IArticleItem

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
    maxAge: 60,
  },
)

import qs from 'qs'
import { replaceMediaCDN } from '~~/utils/mediaCDN'
import minifyHtml from '~~/utils/minifyHtml'

import { JSDOM } from 'jsdom'

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

export default cachedEventHandler(
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
      { encodeValuesOnly: true }
    )

    try {
      const result = (await $fetch(
        `/wp-json/wp/v2/posts/${articleID}?${query}`,
        {
          baseURL: apiEntry,
        }
      )) as any

      const { html, titleList } = handleArticleHeading(result.content.rendered)

      const _result = {
        id: result.id,
        link: result.link,
        title: result.title.rendered,
        content: minifyHtml(html),
        titleList,
        excerpt: result.excerpt.rendered,
        image: result._links['wp:featuredmedia']
          ? replaceMediaCDN(result.post_full_image)
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
    maxAge: 60 * 10,
  }
)

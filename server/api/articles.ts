import qs from 'qs'
import { decode } from 'html-entities'
import { replaceMediaCDN } from '~~/utils/mediaCDN'

const { apiEntry } = useRuntimeConfig()

export interface IArticleListItem {
  id: number
  link: string
  title: string
  excerpt: string
  image: string
  commentCount: number
  viewCount: number
  categoryName: string
  previousPostId: number | null
  tags: string[]
  format: string
  date: string
}

export type IArticleList = IArticleListItem[]

export default cachedEventHandler(
  async (event) => {
    let page
      = ((getQuery(event).page?.toString() || '1') as unknown as number) - 0

    if (Number.isNaN(page) || page < 1) {
      page = 1
    }

    const query = qs.stringify(
      {
        _fields: [
          'id',
          'link',
          'title',
          'excerpt',
          'post_medium_image',
          'post_date',
          'category_name',
          'pageviews',
          'previous_post_id',
          'total_comments',
          '_links.wp:term',
          '_links.wp:featuredmedia',
          'format',
        ],
        _embed: ['wp:term'],
        page,
      },
      { encodeValuesOnly: true },
    )

    const result = (await $fetch(`/wp-json/wp/v2/posts?${query}`, {
      baseURL: apiEntry,
    })) as any

    const _result = result.map((item: any) => ({
      id: item.id,
      link: item.link,
      title: decode(item.title.rendered),
      excerpt: htmlToPureText(item.excerpt.rendered),
      image: item._links['wp:featuredmedia']
        ? replaceMediaCDN(item.post_medium_image)
        : null,
      commentCount: item.total_comments,
      viewCount: item.pageviews,
      categoryName: item.category_name,
      previousPostId: item.previous_post_id,
      tags: item._embedded['wp:term'][1].map((tag: any) => tag.name),
      format: item.format,
      date: item.post_date,
    })) as IArticleList

    return _result
  },
  {
    swr: true,
    maxAge: 5,
  },
)

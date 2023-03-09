import qs from 'qs'
import LRU from 'lru-cache'

const CACHED = new LRU({
  max: 1000,
  ttl: 1000 * 60 * 30,
  allowStale: true,
})

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

export default defineEventHandler(async event => {
  let page =
    ((getQuery(event).page?.toString() || '1') as unknown as number) - 0

  if (isNaN(page) || page < 1) {
    page = 1
  }

  const cacheKey = `api-articles-${page}`

  if (CACHED.has(cacheKey)) {
    return CACHED.get(cacheKey) as IArticleList
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
        'format',
      ],
      _embed: ['wp:term'],
      page,
    },
    { encodeValuesOnly: true }
  )

  const result = (await $fetch(`/wp-json/wp/v2/posts?${query}`, {
    baseURL: apiEntry,
  })) as any

  const _result = result.map((item: any) => ({
    id: item.id,
    link: item.link,
    title: item.title.rendered,
    excerpt: item.excerpt.rendered,
    image: item.post_medium_image,
    commentCount: item.total_comments,
    viewCount: item.pageviews,
    categoryName: item.category_name,
    previousPostId: item.previous_post_id,
    tags: item._embedded['wp:term'][1].map((tag: any) => tag.name),
    format: item.format,
    date: item.post_date,
  })) as IArticleList

  CACHED.set(cacheKey, _result)

  return _result
})

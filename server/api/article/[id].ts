import qs from 'qs'
import LRU from 'lru-cache'
import { replaceMediaCDN } from '~~/utils/mediaCDN'

const CACHED = new LRU({
  max: 1000,
  ttl: 1000 * 60 * 30,
  allowStale: true,
})

const { apiEntry } = useRuntimeConfig()

export interface IArticleItem {
  id: number
  link: string
  title: string
  content: string
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

export default defineEventHandler(async event => {
  const articleID = (getRouterParam(event, 'id') as unknown as number) - 0
  if (isNaN(articleID)) {
    return 'not found'
  }

  const cacheKey = `api-article-${articleID}`

  if (CACHED.has(cacheKey)) {
    return CACHED.get(cacheKey)
  }

  const query = qs.stringify(
    {
      _fields: [
        'id',
        'link',
        'title',
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
    const result = (await $fetch(`/wp-json/wp/v2/posts/${articleID}?${query}`, {
      baseURL: apiEntry,
    })) as any

    console.log(JSON.stringify(result))

    const _result = {
      id: result.id,
      link: result.link,
      title: result.title.rendered,
      content: result.content.rendered,
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

    CACHED.set(cacheKey, _result)

    return _result
  } catch (e) {
    CACHED.set(cacheKey, 'not found')
    return 'not found'
  }
})

import qs from 'qs'

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
  let page = parseInt(getQuery(event).page?.toString() || '1')

  if (isNaN(page) || page < 1) {
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

  return result.map((item: any) => ({
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
})

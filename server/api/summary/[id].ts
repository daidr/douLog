import qs from 'qs'
import { replaceMediaCDN } from '~~/utils/mediaCDN'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

const returnLimit = 400
const chunkSize = 4000

const { openAIKey } = useRuntimeConfig()

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize,
  chunkOverlap: 1,
})

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

async function segmentedSummary(
  content: string,
  lang: string
): Promise<string> {
  const segments = await splitter.createDocuments([content])

  const results: string[] = await Promise.all(
    segments.map(async segment => {
      const prompt = `Summarize this in ${lang} language in less than ${returnLimit} characters: ${segment.pageContent}`

      const response = (await $fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openAIKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            temperature: 0,
            top_p: 1,
            frequency_penalty: 1,
            presence_penalty: 1,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          }),
        }
      )) as any

      return response.choices?.[0]?.message?.content?.trim()
    })
  )

  if (results.length > 1) {
    return segmentedSummary(results.join('\n'), lang)
  } else {
    return results[0]
  }
}

export async function getSummary(content: string, lang: string = 'zh') {
  try {
    const result = await segmentedSummary(content, lang)

    return result
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export default defineEventHandler(async event => {
  const articleID = (getRouterParam(event, 'id') as unknown as number) - 0
  if (isNaN(articleID)) {
    return 'not found'
  }

  const forceCache = getQuery(event).cacheonly?.toString() === '1'

  try {
    const article = await $fetch(`/api/article/${articleID}`)
    if (article === 'not found') {
      return 'not found'
    }

    const lang = 'zh-CN'

    const cacheKey = `redis:article-summary-${articleID}-${lang}`

    let articleSummary = await useStorage().getItem(cacheKey)

    if (!articleSummary) {
      if (forceCache) {
        return 'no cache'
      }

      articleSummary = await getSummary(article.content, lang)

      if (articleSummary) {
        await useStorage().setItem(cacheKey, articleSummary)
        return articleSummary
      }
    } else {
      return articleSummary
    }

    return 'not found'
  } catch (error) {
    return 'not found'
  }
})

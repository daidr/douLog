/**
 * 历史上这里会在缓存命中之外异步发一次 `/wp-json/mdx-counter/v1/addcount/:id`
 * 给 WordPress 累加阅读数。story-verse 当前没有等价的"+1 view"端点，所以
 * wrapper 退化成一个轻薄的 ID 校验层 + cachedEventHandler 转交。
 *
 * 之所以仍保留 wrapper，是为了等 story-verse 上线 view 计数端点时只改这一处
 * 就能恢复行为，且让上层 route 的 import 形态保持稳定。
 */
export const defineCountableCachedEventHandler: typeof cachedEventHandler = (
  ...args: Parameters<typeof cachedEventHandler>
) => {
  const originHandler = cachedEventHandler(...args)
  return eventHandler((event) => {
    const articleID = (getRouterParam(event, 'id') as unknown as number) - 0

    if (Number.isNaN(articleID)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID should be an integer',
      })
    }

    return originHandler(event)
  })
}

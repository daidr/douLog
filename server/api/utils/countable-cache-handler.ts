const { apiEntry } = useRuntimeConfig()

export const defineCountableCachedEventHandler: typeof cachedEventHandler = (
  ...args: Parameters<typeof cachedEventHandler>
) => {
  const originHandler = cachedEventHandler(...args)
  return eventHandler(event => {
    const articleID = (getRouterParam(event, 'id') as unknown as number) - 0

    if (isNaN(articleID)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID should be an integer',
      })
    }

    if ((event.node.req as any).__unenv__) {
      try {
        $fetch(`/wp-json/mdx-counter/v1/addcount/${articleID}`, {
          baseURL: apiEntry,
        })
      } catch (error) {
        /* empty */
      }
    }

    return originHandler(event)
  })
}

export default defineEventHandler(async () => {
  const storage = useStorage()
  const cacheKeys = await storage.getKeys('cache:nitro:handlers:')
  for (const cacheKey of cacheKeys) {
    await storage.removeItem(cacheKey)
  }
  return 'ok'
})

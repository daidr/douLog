export function createRecord() {
  const recordMap: Record<string, number> = {}
  const st = performance.now()

  function record<T>(key: string, t: () => T): T {
    const st = performance.now()
    const result = t()
    recordMap[key] = performance.now() - st
    return result
  }

  async function recordAsync<T>(key: string, t: () => Promise<T>): Promise<Awaited<T>> {
    const st = performance.now()
    const result = await t()
    recordMap[key] = performance.now() - st
    return result
  }

  function getRecords() {
    return {
      ...recordMap,
      _total: performance.now() - st,
    }
  }

  return {
    record,
    recordAsync,
    getRecords,
  }
}

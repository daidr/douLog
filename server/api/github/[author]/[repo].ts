const { GithubAPIEntry } = useRuntimeConfig()

export interface IGithubRepoInfo {
  id: number
  name: string
  link: string
  owner: {
    login: string
    url: string
  }
  description?: string
  stars: number
  forks: number
  homepage?: string
}

export default cachedEventHandler(
  async event => {
    const author = getRouterParam(event, 'author')
    const repo = getRouterParam(event, 'repo')
    try {
      const result = (await $fetch(`/repos/${author}/${repo}`, {
        baseURL: GithubAPIEntry,
      })) as any
      return {
        id: result.id,
        name: result.name,
        link: result.html_url,
        owner: {
          login: result.owner.login,
          url: result.owner.html_url,
        },
        description: result.description,
        stars: result.stargazers_count,
        forks: result.forks_count,
        homepage: result.homepage,
      } as IGithubRepoInfo
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

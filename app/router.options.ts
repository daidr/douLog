import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  routes: _routes => {
    const rootRoute = _routes.find(route => route.path === '/')

    const meRoute = rootRoute?.children?.find(
      route => route.name === 'index-me',
    )

    if (meRoute) {
      meRoute.alias = ''
    }

    return _routes
  },
}

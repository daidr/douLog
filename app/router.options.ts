import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  routes: _routes => {
    const rootRoute = _routes.find(route => route.path === '/')

    rootRoute?.children?.push({
      name: 'home',
      path: '/',
      component: () => import('@/pages/index/me.vue'),
    })

    return _routes
  },
}

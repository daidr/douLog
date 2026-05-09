export default defineNuxtRouteMiddleware((to) => {
  if (['blog-index'].includes(to.name)) {
    to.meta.keepalive = true
  } else {
    to.meta.keepalive = false
  }
})

export default defineNuxtRouteMiddleware(to => {
  if (['blog-index'].indexOf(to.name) >= 0) {
    to.meta.keepalive = true
  } else {
    to.meta.keepalive = false
  }
})

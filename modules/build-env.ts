import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { isCI } from 'std-env'
import { getEnv } from '../config/env'
import type { BuildInfo } from '~/types'

export default defineNuxtModule({
  meta: {
    name: 'elk:build-env',
  },
  async setup(_options, nuxt) {
    const { env, commit, shortCommit, branch } = await getEnv()
    const buildInfo: BuildInfo = {
      time: +Date.now(),
      commit,
      shortCommit,
      branch,
      env,
    }

    nuxt.options.appConfig = nuxt.options.appConfig || {}
    nuxt.options.appConfig.env = env
    nuxt.options.appConfig.buildInfo = buildInfo

    nuxt.options.nitro.virtual = nuxt.options.nitro.virtual || {}
    nuxt.options.nitro.virtual['#build-info'] = `export const env = ${JSON.stringify(env)}`

    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
  },
})

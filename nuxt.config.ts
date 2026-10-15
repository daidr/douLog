import { fileURLToPath } from 'node:url'
import Icons from 'unplugin-icons/vite'
import { resolve } from 'pathe'
import { currentLocales } from './config/i18n'
import type { BuildInfo } from './types'

// Patch unplugin-icons so the resolved virtual id keeps a leading slash.
// Without it, Vite 7's import-analysis fails to resolve `vue` from the
// virtual icon module (it tries to resolve relative to a non-existent
// importer path). With a leading slash Vite treats it as root-relative
// and resolution works.
function IconsWithLeadingSlash() {
  const plugin = Icons({ compiler: 'vue3' }) as any
  const wrap = (target: any) => {
    if (!target) return
    const origResolveId = target.resolveId
    if (origResolveId) {
      target.resolveId = async function (...args: any[]) {
        const r = await origResolveId.apply(this, args)
        if (typeof r === 'string' && !r.startsWith('/') && !r.startsWith('\0')) {
          return `/${r}`
        }
        return r
      }
    }
  }
  if (Array.isArray(plugin)) {
    plugin.forEach(wrap)
  } else {
    wrap(plugin)
  }
  return plugin
}

export default defineNuxtConfig({
  compatibilityDate: '2026-05-10',
  typescript: {
    shim: false,
  },
  devtools: { enabled: true },
  experimental: {
    appManifest: false,
  },
  app: {
    rootId: '__daidr_app',
    buildAssetsDir: '/_doulog/',
  },
  appConfig: {
    umami: {
      host:
        process.env.NUXT_PUBLIC_UMAMI_HOST || 'https://analytics.eu.umami.is',
      id: process.env.NUXT_PUBLIC_UMAMI_ID || '',
      version: 2,
      domains: ['im.daidr.me'],
      ignoreLocalhost: true,
    },
  },
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode',
    'nuxt-umami',
    // motion-v 提供 <Motion> 组件 + spring/keyframe 过渡，文章正文里的轮播
    // 用它做切换动画。注册为 nuxt 模块即自动注入 <Motion> 等组件全局可用，
    // 无需手动 import。
    'motion-v/nuxt',
    './modules/pwa/index',
    './modules/purge-comments',
  ],
  colorMode: {
    classSuffix: '',
  },
  routeRules: {
    // Static generation
    '/': { prerender: true },
    '/blog/**': { prerender: false },
    '/manifest.webmanifest': {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    },
  },
  i18n: {
    locales: currentLocales,
    lazy: true,
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
    langDir: 'locales',
    defaultLocale: 'en-US',
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://im.daidr.me',
    vueI18n: './config/i18n.config.ts',
  },
  imports: {
    imports: [{
      name: 'useI18n',
      from: '~/utils/i18n',
      priority: 100,
    }],
    injectAtEnd: true,
  },
  pwa: {
    scope: '/',
    srcDir: resolve(fileURLToPath(new URL('.', import.meta.url)), 'service-worker'),
    filename: 'sw.ts',
    strategies: 'injectManifest',
    injectRegister: false,
    includeManifestIcons: false,
    manifest: false,
    injectManifest: {
      globPatterns: ['**/*.{js,json,css,html,txt,svg,png,ico,webp,woff,woff2,ttf,eot,otf,wasm}'],
      globIgnores: ['manifest**.webmanifest'],
    },
    devOptions: {
      enabled: false,
      type: 'module',
    },
  },
  css: [
    '@unocss/reset/tailwind.css',
    '~/assets/scss/global.scss',
    '~/assets/fonts/BEYNO/font.css',
  ],
  runtimeConfig: {
    // story-verse 后端公开 API 的 base URL。本地默认指向 packages/core 的开发端口
    // (SV_APP_PORT=3005 in packages/core/.env)；线上由 NUXT_BLOG_API_ENTRY 覆盖。
    apiEntry: process.env.NUXT_BLOG_API_ENTRY || 'http://localhost:3005',
    GithubAPIEntry:
      process.env.NUXT_GITHUB_API_ENTRY || 'https://api.github.com',
    // /api/clean_cache 的 Bearer token（仅服务端）。留空 = 接口关闭
    cachePurgeToken: process.env.NUXT_CACHE_PURGE_TOKEN || '',
    app: {
      buildAssetsDir: '/_doulog/',
    },
    public: {
      // 评论 / 媒体等需要在浏览器直接访问 SV 公开端点（评论提交时 SV 从 socket
      // 取真实客户端 IP 用于限速，绕开 douLog 代理才能拿到正确 IP）。
      // 默认值与服务端 apiEntry 同源；如需公网部署需要单独配置 SV_PUBLIC_BASE_URL。
      apiEntry: process.env.NUXT_PUBLIC_API_ENTRY
        || process.env.NUXT_BLOG_API_ENTRY
        || 'http://localhost:3005',
    },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
    },
    storage: {
      redis: {
        driver: 'redis',
        port: process.env.NUXT_BLOG_REDIS_PORT || 6379,
        host: process.env.NUXT_BLOG_REDIS_HOST || '127.0.0.1',
        username: process.env.NUXT_BLOG_REDIS_USER || '',
        password: process.env.NUXT_BLOG_REDIS_PASSWORD || '',
        db: process.env.NUXT_BLOG_REDIS_DB || 0,
        tls: {},
      },
      cache: {
        driver: 'redis',
        port: process.env.NUXT_BLOG_REDIS_PORT || 6379,
        host: process.env.NUXT_BLOG_REDIS_HOST || '127.0.0.1',
        username: process.env.NUXT_BLOG_REDIS_USER || '',
        password: process.env.NUXT_BLOG_REDIS_PASSWORD || '',
        db: process.env.NUXT_BLOG_REDIS_DB || 0,
        tls: {},
      },
    },
    devStorage: {
      cache: {
        driver: 'memory',
      },
    },
  },
  hooks: {
    'vite:extendConfig': (config) => {
      config.plugins ||= []
      config.plugins.push(IconsWithLeadingSlash())
    },
  },
  vite: {
    plugins: [],
    // blurhash 仅在 LazyImage 里按需导入，预打包它避免 dev 首次访问时
    // 「运行时发现新依赖 → 重新优化 → 整页 reload」。
    optimizeDeps: {
      include: ['blurhash'],
    },
    vue: {
      template: {
        compilerOptions: {
        },
      },
    },
    worker: {
      format: 'es',
    },
  },
})

declare module '@nuxt/schema' {
  interface AppConfig {
    env: BuildInfo['env']
    buildInfo: BuildInfo
  }
}

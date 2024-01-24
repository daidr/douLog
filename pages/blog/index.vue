<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
import { IArticleItem } from '~/server/api/article/[id]'

const { t } = useI18n()

useHead({
  title: t('main_nav.posts'),
})

definePageMeta({
  isInArticlePage: false,
  // middleware: ['keepalive-hack'],
})

const breakpoints = useBreakpoints(breakpointsTailwind)

const mdAndSmaller = breakpoints.smallerOrEqual('md')

const route = useRoute()

const isInArticlePage = computed(() => route.meta.isInArticlePage)

const articleScrollTop = ref(0)

const setArticleScrollTop = () => {
  articleScrollTop.value =
    document.querySelector('.articles-page-wrapper')?.scrollTop || 0
}

provide('setArticleScrollTop', setArticleScrollTop)

const toTop = () => {
  document.querySelector('.articles-page-wrapper')?.scrollTo({
    top: 0,
    behavior: 'auto',
  })
}

provide('toTop', toTop)

const toPrevTop = () => {
  document.querySelector('.articles-page-wrapper')?.scrollTo({
    top: articleScrollTop.value,
    behavior: 'auto',
  })
}

provide('toPrevTop', toPrevTop)

const ArticleCacheId = ref(-1)
const ArticleCache = ref<IArticleItem>()
const ArticleSummaryCache = ref<string>('')

provide('ArticleCacheId', ArticleCacheId)
provide('ArticleCache', ArticleCache)
provide('ArticleSummaryCache', ArticleSummaryCache)

const nuxtApp = useNuxtApp()
</script>

<template>
  <div class="articles-page-wrapper y-scroll-box">
    <!-- <Teleport to="body">
      <NuxtLoadingIndicator
        color="rgba(var(--color-primary), 1)"
        :throttle="100"
      />
    </Teleport> -->
    <div class="limit-wrapper" :class="{ wider: isInArticlePage }">
      <div class="header-wrapper transition-page-wrapper">
        <div class="main-menu-wrapper">
          <SiteMainNav />
        </div>
        <div class="author-block">
          <UiMainAvatar
            :hoverable="true"
            :size="mdAndSmaller ? 54 : 70"
            :stroke="mdAndSmaller ? 2 : 4"
          />
          <div class="author-info">
            <div class="author-name">
              {{ t('global.name') }} <span>@{{ t('global.en_name') }}</span>
            </div>
            <div class="author-description">
              {{ t('global.blog_desc') }}
            </div>
          </div>
        </div>
      </div>

      <div class="block-wrapper-group transition-extra-wrapper">
        <!-- <NuxtPage /> -->
        <RouterView v-slot="{ Component }">
          <transition :css="false" mode="in-out">
            <KeepAlive :exclude="['ArticlePage']">
              <Suspense
                @pending="nuxtApp.callHook('page:start')"
                @resolve="nextTick(() => nuxtApp.callHook('page:finish'))"
              >
                <component :is="Component" />
              </Suspense>
            </KeepAlive>
          </transition>
        </RouterView>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.articles-page-wrapper {
  @apply w-full h-full;
  @apply fixed top-0 left-0;
  @apply overflow-x-hidden;
  @apply pb-18 md:pb-21;

  scrollbar-width: thin;
  scrollbar-color: rgba(var(--color-primary), 0.8)
    rgb(var(--color-primary-light));

  // 滚动条
  &::-webkit-scrollbar {
    @apply w-2;
  }

  &::-webkit-scrollbar-thumb {
    @apply bg-primary/80;
    @apply rounded-full;
  }

  &::-webkit-scrollbar-track {
    @apply bg-primary-light;
    @apply rounded-full;
  }

  .limit-wrapper {
    @apply flex flex-col items-start;
    @apply p-0 sm:p-3;
    // 其实应该用gap-y更好，但是flex布局gap-y兼容性不太好
    @apply sm:space-y-3;
    @apply max-w-1000px;
    margin: 0 auto;

    // transition: max-width 0.3s ease-in-out;
    // @apply motion-reduce:transition-none;

    &.wider {
      @apply max-w-1200px;
    }
  }

  .header-wrapper {
    @apply sm:rounded-8 bg-white select-none;
    @apply flex flex-col p-3 md:p-5;
    @apply shadow-2xl shadow-primary/30;
    @apply z-90 translate-z-150vh;
    view-transition-name: main-header;

    @screen lt-sm {
      @apply w-full;
    }

    .main-menu-wrapper {
      @apply flex space-x-3 mb-7 md:mb-8 ml-0 md:ml-5;
      @apply justify-center md:justify-start;
    }

    .author-block {
      @apply flex px-3 md:px-5;

      .avatar {
        @apply mr-4 md:mr-5 flex-shrink-0;
      }

      .author-info {
        @apply flex flex-col justify-center;

        .author-name {
          @apply text-xl md:text-2xl font-bold text-primary/70;

          span {
            @apply text-primary/60 text-base font-normal;
          }
        }

        .author-description {
          @apply text-primary/60 text-base;
        }
      }
    }
  }

  .block-wrapper-group {
    @apply w-full;
  }
}
</style>

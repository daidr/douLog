<script setup lang="ts">
import { breakpointsTailwind } from '@vueuse/core'
import { CONFIG } from '~~/config/base'

useHead({
  title: '博客',
})

const breakpoints = useBreakpoints(breakpointsTailwind)

const mdAndSmaller = breakpoints.smallerOrEqual('md')

const isInArticlePage = ref(false)

const setIsInArticlePage = (state: boolean) => {
  isInArticlePage.value = state
}

provide('setIsInArticlePage', setIsInArticlePage)

const articleScrollTop = ref(0)

const setArticleScrollTop = () => {
  articleScrollTop.value =
    document.querySelector('.articles-page-wrapper')?.scrollTop || 0
}

provide('setArticleScrollTop', setArticleScrollTop)

const toTop = () => {
  document.querySelector('.articles-page-wrapper')?.scrollTo({
    top: 0,
    behavior: 'smooth',
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
</script>

<template>
  <div class="articles-page-wrapper y-scroll-box">
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
              {{ CONFIG.name }} <span>@{{ CONFIG.enName }}</span>
            </div>
            <div class="author-description">
              {{ CONFIG.articleDescription }}
            </div>
          </div>
        </div>
      </div>

      <div class="block-wrapper-group transition-extra-wrapper">
        <router-view v-slot="{ Component }">
          <keep-alive :exclude="['ArticlePage']">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.articles-page-wrapper {
  @apply "w-full h-full";
  @apply "fixed top-0 left-0";
  @apply overflow-x-hidden;
  @apply "pb-18 md:pb-21";

  scrollbar-width: thin;
  scrollbar-color: rgb(var(--color-primary) / 0.8)
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
    @apply p-3;
    // 其实应该用gap-y更好，但是flex布局gap-y兼容性不太好
    @apply space-y-3;
    @apply max-w-1000px;
    margin: 0 auto;

    transition: max-width 0.3s ease-in-out;

    &.wider {
      @apply max-w-1200px;
    }
  }

  .header-wrapper {
    @apply rounded-4xl bg-white select-none;
    @apply flex flex-col p-3 md:p-5;
    @apply shadow-2xl shadow-primary/30;
    @apply z-90 translate-z-150vh;

    @screen <sm {
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

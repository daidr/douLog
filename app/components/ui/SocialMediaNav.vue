<script setup>
import IconGithub from '~icons/mingcute/github-line'
import IconHeart from '~icons/mingcute/heart-line'
import IconRss from '~icons/mingcute/rss-2-line'
import IconTwitter from '~icons/mingcute/social-x-line'
import IconSubway from '~icons/mingcute/train-3-line'
import IconBilibili from '~icons/mingcute/tv-2-line'

const { t } = useI18n()

// 优先用后端 metadata 的社交链接（图标为已解析的 SVG 字符串）；
// metadata 未配置时回退到下方内置静态项。
const metadata = useSiteMetadata()
const socialLinks = computed(() => metadata.value?.social ?? [])

const urls = computed(() => [
  {
    url: 'https://daidr.me/feed',
    icon: IconRss,
    name: t('social.rss'),
  },
  {
    url: 'https://github.com/daidr',
    icon: IconGithub,
    name: t('social.github'),
  },
  {
    url: 'https://twitter.com/imdaidr',
    icon: IconTwitter,
    name: t('social.twitter'),
  },
  {
    url: 'https://space.bilibili.com/28124496',
    icon: IconBilibili,
    name: t('social.bilibili'),
  },
  {
    url: 'https://sponsor.daidr.me',
    icon: IconHeart,
    name: t('social.sponsor'),
  },
  {
    url: 'https://www.travellings.cn/go.html',
    icon: IconSubway,
    name: t('social.travelling'),
  },
])
</script>

<template>
  <div class="socialmedia-nav-wrapper">
    <!-- 动态：来自后端 metadata，图标是已解析的 SVG 字符串（v-html 渲染） -->
    <template v-if="socialLinks.length > 0">
      <a
        v-for="item in socialLinks" :key="item.url" :href="item.url" target="_blank" class="nav-item"
        :data-name="item.label"
        @click="umTrackEvent('social-link', { name: item.label })"
      >
        <span class="nav-icon" v-html="item.icon" />
        <span class="sr-only">{{ item.label }}</span>
      </a>
    </template>
    <!-- 兜底：metadata 未配置社交链接时用内置静态项 -->
    <template v-else>
      <a
        v-for="item in urls" :key="item.url" :href="item.url" target="_blank" class="nav-item" :data-name="item.name"
        @click="umTrackEvent('social-link', { name: item.name })"
      >
        <Component :is="item.icon" />
        <span class="sr-only">{{ item.name }}</span>
      </a>
    </template>
  </div>
</template>

<style scoped lang="scss">
.socialmedia-nav-wrapper {
  @apply flex w-full justify-center space-x-3;

  .nav-item {
    @apply text-lg;
    @apply text-white/90 bg-primary-4 dark-text-primary-9;
    @apply rounded-full relative;
    @apply cursor-pointer;
    @apply w-38px h-38px;
    @apply flex items-center justify-center;

    &::before {
      content: '';
      @apply absolute -top-6px -left-6px -right-6px -bottom-6px -z-1;
      @apply rounded-full;
      @apply border-4px border-primary-1 dark-border-primary-3;
      @apply transition motion-reduce:transition-none;
      @apply transform-gpu scale-50 opacity-0;
      @apply pointer-events-none;
    }

    &:hover::before,
    &:active::before {
      @apply scale-100 opacity-100;
    }

    &::after {
      content: attr(data-name);
      @apply absolute -bottom-10 left-1/2;
      @apply text-sm text-center text-white dark-text-primary-9 whitespace-nowrap;
      @apply bg-primary-4 px-2 py-1;
      @apply transition duration-300 motion-reduce:transition-none;
      @apply transform-gpu -translate-x-1/2 -translate-y-20px opacity-0;
      @apply pointer-events-none;
      @apply rounded-xl;
    }

    &:hover::after {
      @apply translate-y-0 opacity-100;
    }

    .nav-icon {
      @apply inline-flex items-center justify-center;

      :deep(svg) {
        @apply block;
        width: 1em;
        height: 1em;
      }
    }
  }
}
</style>

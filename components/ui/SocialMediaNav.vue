<script setup>
import IconHome from '~icons/uil/home-alt'
import IconRss from '~icons/uil/rss'
import IconWeibo from '~icons/icon-park-outline/weibo'
import IconBilibili from '~icons/icon-park-outline/tv-one'
import IconGithub from '~icons/icon-park-outline/github-one'
import IconHeart from '~icons/uil/heart'

const urls = [
  {
    url: 'https://daidr.me',
    icon: IconHome,
    name: '博客',
  },
  {
    url: 'https://daidr.me/feed',
    icon: IconRss,
    name: '博客feed',
  },
  {
    url: 'https://weibo.com/keaidaidou',
    icon: IconWeibo,
    name: '微博',
  },
  {
    url: 'https://space.bilibili.com/28124496',
    icon: IconBilibili,
    name: 'B站',
  },
  {
    url: 'https://github.com/daidr',
    icon: IconGithub,
    name: 'GitHub',
  },
  {
    url: 'https://sponsor.daidr.me',
    icon: IconHeart,
    name: '赞助',
  },
]
</script>

<template>
  <div class="socialmedia-nav-wrapper">
    <a
      v-for="item in urls"
      :key="item.url"
      :href="item.url"
      target="_blank"
      class="nav-item"
      :data-name="item.name"
    >
      <Component :is="item.icon" />
      <span class="sr-only">{{ item.name }}</span>
    </a>
  </div>
</template>

<style scoped lang="scss">
.socialmedia-nav-wrapper {
  @apply flex w-full justify-center space-x-3;

  .nav-item {
    @apply text-lg;
    @apply text-primary-extralight bg-primary-medium;
    @apply rounded-full relative;
    @apply cursor-pointer;
    @apply w-38px h-38px;
    @apply flex items-center justify-center;

    &::before {
      content: '';
      @apply absolute -top-6px -left-6px -right-6px -bottom-6px -z-1;
      @apply rounded-full;
      @apply border-4px border-primary-extralight;
      @apply transition;
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
      @apply text-sm text-center text-primary-extralight whitespace-nowrap;
      @apply bg-primary-medium px-2 py-1;
      @apply transition duration-300;
      @apply transform-gpu -translate-x-1/2 -translate-y-20px opacity-0;
      @apply pointer-events-none;
      @apply rounded-xl;
    }

    &:hover::after {
      @apply translate-y-0 opacity-100;
    }
  }
}
</style>

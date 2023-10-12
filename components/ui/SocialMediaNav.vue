<script setup>
import IconRss from '~icons/uil/rss'
import IconChannel from '~icons/uil/channel'
import IconTwitter from '~icons/icon-park-outline/twitter'
import IconGithub from '~icons/icon-park-outline/github-one'
import IconHeart from '~icons/uil/heart'
import IconSubway from '~icons/uil/subway'

const urls = [
  {
    url: 'https://daidr.me/feed',
    icon: IconRss,
    name: 'RSS',
  },
  {
    url: 'https://github.com/daidr',
    icon: IconGithub,
    name: 'GitHub',
  },
  {
    url: 'https://twitter.com/imdaidr',
    icon: IconTwitter,
    name: 'Twitter',
  },
  {
    url: 'https://daidr.xlog.app',
    icon: IconChannel,
    name: 'xLog',
  },
  {
    url: 'https://sponsor.daidr.me',
    icon: IconHeart,
    name: '赞助',
  },
  {
    url: 'https://www.travellings.cn/go.html',
    icon: IconSubway,
    name: '开往',
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
      @click="umTrackEvent('social-link', { name: item.name })"
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
      @apply text-sm text-center text-primary-extralight whitespace-nowrap;
      @apply bg-primary-medium px-2 py-1;
      @apply transition duration-300 motion-reduce:transition-none;
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

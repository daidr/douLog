<script setup lang="ts">
import IconBear from '~icons/mingcute/bear-line'
import IconWrite from '~icons/mingcute/pencil-line'
import IconNoteBook from '~icons/mingcute/contacts-3-line'
import IconExperimentOne from '~icons/mingcute/flask-line'
import IconBack from '~icons/mingcute/back-line'

defineProps({
  hideSet: {
    type: Array,
    default: () => [0, 0, 0, 0],
  },
})

const { t } = useI18n()

const historyState = useHistoryState()!

function back() {
  history.back()
}
</script>

<template>
  <slot v-if="$slots.default" />
  <ClientOnly>
    <a v-if="historyState.back" class="invert-menu-item" @click="back">
      <IconBack />
      <span>{{ t('main_nav.back') }}</span>
    </a>
  </ClientOnly>
  <NuxtLink v-if="!hideSet[0]" :to="{ name: 'index-me' }" class="menu-item">
    <IconBear />
    {{ t('main_nav.me') }}
  </NuxtLink>
  <NuxtLink v-if="!hideSet[1]" :to="{ name: 'blog-index' }" class="menu-item">
    <IconWrite />
    {{ t('main_nav.posts') }}
  </NuxtLink>
  <NuxtLink v-if="!hideSet[2]" :to="{ name: 'index-friends' }" class="menu-item">
    <IconNoteBook />
    {{ t('main_nav.friends') }}
  </NuxtLink>
  <NuxtLink v-if="!hideSet[3]" :to="{ name: 'projects' }" class="menu-item">
    <IconExperimentOne />
    {{ t('main_nav.projects') }}
  </NuxtLink>
  <slot v-if="$slots.after" name="after" />
</template>

<style scoped lang="scss">
.menu-item {
  @apply relative;
  @apply text-primary/70 font-semibold text-lg;
  @apply cursor-pointer z-0;
  @apply transition-all duration-300;
  @apply flex items-center whitespace-nowrap;

  svg {
    @apply text-0em;
    @apply mr-0;
    @apply transition-all;
  }

  &::before {
    content: '';
    @apply absolute bottom-0 left-0 right-0 h-3px -z-1;
    @apply rounded-xl;
    @apply bg-primary-extralight;
    @apply transition-all;
  }

  &:hover,
  &.router-link-exact-active {
    @apply px-3;

    &::before {
      @apply h-full;
    }

    svg {
      @apply text-0.9em mr-1;
    }
  }

  &:hover {
    svg {
      animation: backshake 0.5s linear;
      @apply motion-reduce:animate-none;
    }
  }

  &.router-link-exact-active {
    @apply pointer-events-none;
  }
}

.invert-menu-item {
  @apply relative;
  @apply text-primary/70 font-semibold text-lg;
  @apply cursor-pointer z-0;
  @apply transition-all duration-300;
  @apply flex items-center whitespace-nowrap;
  @apply px-2;

  span {
    @apply text-0em;
    @apply transition-all;
  }

  svg {
    @apply text-0.9em;
    @apply transition-all;
  }

  &::before {
    content: '';
    @apply absolute bottom-0 left-0 right-0 h-full -z-1;
    @apply rounded-xl;
    @apply bg-primary-extralight;
  }

  &:hover {
    @apply px-3;

    span {
      @apply text-1em;
    }

    svg {
      @apply text-0em;
    }
  }
}
</style>

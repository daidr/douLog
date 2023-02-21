<script setup lang="ts">
import IconBear from '~icons/icon-park-outline/bear'
import IconWrite from '~icons/icon-park-outline/write'
import IconNoteBook from '~icons/icon-park-outline/notebook'
import IconExperimentOne from '~icons/icon-park-outline/experiment-one'

defineProps({
  hideSet: {
    type: Array,
    default: () => [0, 0, 0, 0],
  },
})
</script>

<template>
  <slot v-if="$slots.default" />
  <NuxtLink v-if="!hideSet[0]" to="/" class="menu-item">
    <IconBear />
    我
  </NuxtLink>
  <NuxtLink v-if="!hideSet[1]" to="/blog" class="menu-item">
    <IconWrite />
    文章
  </NuxtLink>
  <NuxtLink v-if="!hideSet[2]" to="/friends" class="menu-item">
    <IconNoteBook />
    朋友们
  </NuxtLink>
  <NuxtLink v-if="!hideSet[3]" to="/projects" class="menu-item">
    <IconExperimentOne />
    实验室
  </NuxtLink>
  <slot v-if="$slots.after" name="after" />
</template>

<style scoped lang="scss">
.menu-item {
  @apply relative;
  @apply text-primary/70 font-semibold text-lg;
  @apply cursor-pointer z-0;
  @apply transition-all duration-300;
  @apply flex items-center;

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
    }
  }

  &.router-link-exact-active {
    @apply pointer-events-none;
  }
}
</style>

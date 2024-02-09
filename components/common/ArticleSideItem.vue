<template>
  <div class="side-nav-wrapper">
    <div v-if="$slots.title" class="title">
      <slot name="title" />
      <div class="decoration" />
    </div>

    <slot />
  </div>
</template>

<style scoped lang="scss">
.side-nav-wrapper {
  @apply w-full bg-white w-full sticky top-4;
  @apply rounded-8;
  @apply shadow-2xl shadow-primary-shadow;

  .title {
    @apply text-xl font-extrabold select-none;
    @apply text-primary;
    @apply px-5 pt-5;

    .decoration {
      @apply w-full h-1 opacity-10;
      @apply bg-primary-medium;
      @apply rounded-full;
      @apply my-3;
    }
  }
}
</style>

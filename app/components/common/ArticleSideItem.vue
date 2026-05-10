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
  @apply w-full bg-light dark-bg-dark w-full;
  @apply rounded-8;
  @apply shadow-2xl general-shadow;
  // sticky 由父级 sidebar 容器统一控制；当 sidebar 内有多个 SideItem 时把
  // sticky 放在每个 item 上会让它们抢同一 top 互相重叠

  .title {
    @apply text-xl font-extrabold select-none;
    @apply text-primary-text;
    @apply px-5 pt-5;

    .decoration {
      @apply w-full h-1 opacity-15;
      @apply bg-primary-4 dark-bg-primary-8;
      @apply rounded-full;
      @apply my-3;
    }
  }
}
</style>

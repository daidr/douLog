<template>
  <div class="card-wrapper">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.card-wrapper {
  @apply bg-light dark-bg-dark;
  @apply rounded-8;
  @apply absolute top-0 left-0 right-0 bottom-0;
  @apply transform-gpu;
  @apply backface-hidden;
}
</style>

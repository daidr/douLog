<template>
  <div class="main-wrapper">
    <slot />
    <SiteFooter />
  </div>
</template>

<style scoped lang="scss">
.main-wrapper {
  @apply bg-primary-light;
  @apply h-full;
  transform-style: preserve-3d;
  perspective-origin: 150% 150%;
  background-image: url(/images/bg.svg);
}
</style>

<template>
  <div class="bg"></div>
</template>

<style scoped lang="scss">
.bg {
  background-image: url(/images/bg.svg);
  @apply h-100vh w-100vw;
  @apply fixed -z-1 top-0 left-0 pointer-events-none;
}
</style>

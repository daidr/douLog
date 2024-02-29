<template>
  <div class="pwa-header" />
</template>

<style scoped lang="scss">
.pwa-header {
    @apply h-[env(safe-area-inset-top,0)] transform-gpu translate-z-202vh z-95;
    @apply fixed top-0 left-0 right-0 pointer-events-none;
}
</style>

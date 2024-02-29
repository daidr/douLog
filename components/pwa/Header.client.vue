<template>
  <div
    class="pwa-header"
  />
</template>

<style scoped lang="scss">
.pwa-header {
    @apply h-[calc(env(safe-area-inset-top,0)+1px)] transform-gpu translate-z-202vh z-95;
    @apply fixed -top-1px left-0 right-0 pointer-events-none;
    @apply backdrop-blur-xl;
    --gradient: linear-gradient(to bottom, white 0%, white 40%, transparent 97%, transparent 100%);
    -webkit-mask: var(--gradient);
    mask: var(--gradient);
}
</style>

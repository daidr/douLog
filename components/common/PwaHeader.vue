<template>
  <div class="pwa-header" />
</template>

<style scoped lang="scss">
.pwa-header {
    @apply h-[env(safe-area-inset-top,0)] transform-gpu translate-z-202vh z-95;
    @apply fixed top-0 left-0 right-0 pointer-events-none;
    -webkit-backdrop-filter: blur(24px);
    backdrop-filter: blur(24px);
    --gradient: linear-gradient(to bottom, white 0%,white 40%, transparent 97%, transparent 100%);
    -webkit-mask: var(--gradient);
    mask: var(--gradient);
}
</style>

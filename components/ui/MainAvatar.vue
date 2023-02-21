<script setup lang="ts">
defineProps<{
  isActive: boolean
}>()
</script>

<template>
  <div class="avatar" :class="{ active: isActive }">
    <svg view-box="0 0 172 172" width="172px" height="172px">
      <circle
        cx="86"
        cy="86"
        r="80"
        stroke-width="10"
        class="stroke-primary-light"
        fill="none"
        stroke-linecap="round"
        stroke-dasharray="390, 502"
        transform="rotate(-38 86 86)"
      ></circle>
    </svg>
    <UiLazyImage src="/images/avatar.png" alt="AVATAR" />
  </div>
</template>

<style scoped lang="scss">
.avatar {
  @apply select-none;
  @apply "w-40 h-40";
  @apply relative;

  &.active {
    @apply pointer-events-none;

    :deep(.lazy-image img) {
      @apply scale-105 translate-y-0;
    }
  }

  :deep(.lazy-image) {
    width: 192px;
    height: 192px;
    transform: translate(-16px, -32px);
    clip-path: path('M 22 0 L 22 107 A 6 6 0 0 0 170 120 L 170 0 Z');

    img {
      @apply transform-gpu transition-transform scale-80 translate-y-16px;
      @apply duration-650;
      transition-timing-function: cubic-bezier(0.36, 1.1, 0.2, 1.2);

      &:hover {
        @apply scale-105 translate-y-0;
      }
    }
  }

  svg {
    @apply absolute top-0 left-0;
    @apply transform-gpu -translate-x-6px -translate-y-6px;
  }
}
</style>

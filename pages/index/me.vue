<script setup>
useHead({
  title: '我',
})
</script>

<template>
  <UiCardWrapper>
    <div class="wrapper">
      <div class="avatar">
        <UiLazyImage src="/images/avatar.png" alt="AVATAR" />
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
      </div>
      <div class="name">戴兜 <span>@DaiDR</span></div>
      <div class="motto">Coding the world.</div>
      <UiSocialMediaNav class="socialmedia-wrapper" />
    </div>
  </UiCardWrapper>
</template>

<style scoped lang="scss">
.wrapper {
  @apply flex flex-col items-center;
  @apply pt-8;

  .avatar {
    @apply select-none;
    @apply "w-40 h-40";
    @apply "rounded-full";
    @apply relative;

    img {
      @apply "w-full h-full";
      @apply "rounded-full";
      @apply "object-cover";
    }

    svg {
      @apply absolute top-0 left-0;
      @apply transform-gpu -translate-x-6px -translate-y-6px;
    }
  }

  .name {
    @apply text-2xl;
    @apply mt-11;
    @apply text-primary/80 font-bold;

    span {
      @apply text-lg font-normal text-primary/50;
    }
  }

  .motto {
    @apply mt-3;
    @apply font-normal text-primary/50;
  }

  .socialmedia-wrapper {
    @apply mt-13;
  }
}
</style>

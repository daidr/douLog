<template>
  <div class="loading-container">
    <div />
    <div />
    <div />
    <div />
  </div>
</template>

<style scoped lang="scss">
.loading-container {
  @apply w-12 h-12 relative;

  div:nth-child(1) {
    @apply absolute top-1/2 left-1/2 z-1;
    @apply w-8 h-8 rounded-full;
    @apply bg-primary-light;
    @apply shadow-xl shadow-primary/20;
    @apply transform-gpu -translate-x-1/2 -translate-y-1/2;
  }

  div:not(:nth-child(1)) {
    @apply absolute left-0;
    @apply w-full h-full;
  }

  div:not(:nth-child(1)):before {
    @apply absolute top-0 left-0;
    @apply w-5 h-5;
    @apply -mt-5px -ml-5px;
    @apply opacity-70;
    @apply bg-primary rounded-full;
    content: '';
    animation:
      ball-atom-position 1.5s 0s infinite ease-in-out,
      ball-atom-size 1.5s 0s infinite ease-in-out;
  }

  div:nth-child(2) {
    animation-delay: 0.75s;
  }

  div:nth-child(2):before {
    animation-delay:
      0s,
      -1.125s;
  }

  div:nth-child(3) {
    transform: rotate(120deg);
    animation-delay: -0.25s;
  }

  div:nth-child(3):before {
    animation-delay:
      -1s,
      -0.75s;
  }

  div:nth-child(4) {
    transform: rotate(240deg);
    animation-delay: 0.25s;
  }

  div:nth-child(4):before {
    animation-delay:
      -0.5s,
      -0.125s;
  }
}

@keyframes ball-atom-position {
  50% {
    top: 100%;
    left: 100%;
  }
}

@keyframes ball-atom-size {
  0%,
  100% {
    transform: scale(0.6);
  }

  50% {
    transform: scale(1.1);
  }
}
</style>

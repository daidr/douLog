<script setup lang="ts">
defineProps<{
  visible: boolean
  cancelText?: string
  confirmText?: string
  title: string
  icon?: Component
}>()

defineEmits(['cancel', 'confirm'])

defineSlots<{
  default: void
}>()
</script>

<template>
  <Transition name="prompt">
    <div v-if="visible" class="common-prompt">
      <div class="common-prompt-mask" />
      <div class="common-prompt-wrapper">
        <div class="horizontal max-w-screen-lg">
          <div class="common-prompt-modal flex flex-col gap-3">
            <div
              class="p-1 bg-primary-6/20 dark-bg-primary-4 flex self-start gap-1 rounded-full text-primary dark-text-white/70"
            >
              <component :is="icon" v-if="icon" class="text-xl" />
              <span class="font-extrabold pr-1">{{ title }}</span>
            </div>
            <p class="text-center font-bold text-xl">
              <slot />
            </p>
            <div class="flex justify-end gap-5 mt-5">
              <button v-if="cancelText" class="dismiss-button" type="button" @click="$emit('cancel')">
                {{ cancelText }}
              </button>
              <button class="update-button" type="button" @click="$emit('confirm')">
                {{ confirmText || 'OK' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.common-prompt {
  @apply z-95 transform-gpu translate-z-203vh fixed top-0 left-0 right-0 bottom-0 select-none;
  --animation-function: cubic-bezier(0.24, 0.58, 0.3, 1.33);
  --animation-duration: 0.5s;

  .common-prompt-mask {
    @apply bg-black/60 w-full h-full;
  }

  .common-prompt-wrapper {
    @apply fixed top-0 left-0 right-0 bottom-0 px-5;
    @apply flex justify-center items-center;
  }

  .common-prompt-modal {
    @apply bg-light dark-bg-dark rounded-6 p-5 text-primary;
    @apply border-1.5 border-b-3 border-primary-3 dark-border-primary-2;
    @apply shadow-xl shadow-black/10;
  }

  button {
    @apply px-3 py-1 text-white rounded-xl border-1.5 border-b-3 text-center min-w-4rem;
    @apply transition;

    &.update-button {
      @apply bg-primary-6/80 border-primary-7;

      &:hover {
        @apply bg-primary-6/90;
      }

      &:active {
        @apply bg-primary-6;
      }
    }

    &.update-button {
      @apply bg-primary-6/80 dark-bg-primary-4 border-primary-7 dark-border-primary-6 dark-text-white/80;

      &:hover {
        @apply bg-primary-6/90 dark-bg-primary-5/90;
      }

      &:active {
        @apply bg-primary-6 dark-bg-primary-5/80;
      }
    }

    &.dismiss-button {
      @apply border-transparent text-gray-4 dark-text-gray/30;

      &:hover {
        @apply bg-gray-3/80 text-gray-8/80 border-gray-4 dark-bg-gray-8/80 dark-text-gray-4 dark-border-gray-6;
      }

      &:active {
        @apply bg-gray-3 dark-bg-gray-8;
      }
    }
  }
}

@keyframes horizontal-move {
  0% {
    transform: translateX(50%);
  }

  100% {
    transform: translateX(0);
  }
}

@keyframes model-move {
  0% {
    transform: translateY(calc(50vh + 100%)) scale(1.5) rotateZ(40deg);
  }

  100% {
    transform: translateY(0) scale(1) rotateZ(0);
  }
}

@media (prefers-reduced-motion: no-preference) {

  .prompt-enter-active,
  .prompt-leave-active {
    transition: opacity var(--animation-duration) linear;
  }

  .prompt-enter-active {

    .common-prompt-mask {
      transition: opacity var(--animation-duration) ease;
    }

    .horizontal {
      animation: horizontal-move var(--animation-duration) ease;
    }

    .common-prompt-modal {
      animation: model-move var(--animation-duration) var(--animation-function) forwards;
    }
  }

  .prompt-leave-active {

    .common-prompt-mask {
      transition: opacity var(--animation-duration) ease;
    }

    .horizontal {
      animation: horizontal-move var(--animation-duration) ease reverse;
    }

    .common-prompt-modal {
      animation: model-move var(--animation-duration) var(--animation-function) reverse forwards;
    }
  }

  .prompt-enter-from,
  .prompt-leave-to {
    @apply opacity-99;

    .common-prompt-mask {
      @apply opacity-0;
    }
  }
}
</style>

<script setup lang="ts">
import type { ModalInfo } from '.'

defineProps<{
  info: ModalInfo
}>()

defineEmits(['cancel', 'confirm'])

defineSlots<{
  default: void
}>()

function refToVNode(ref: MaybeRef<string> | VNode) {
  if (isRef(ref)) {
    return () => ref.value
  } else if (typeof ref === 'string') {
    return () => ref
  } else {
    return ref
  }
}
</script>

<template>
  <div class="common-modal">
    <div class="common-modal-wrapper">
      <div class="horizontal max-w-screen-lg min-w-350px">
        <div class="common-modal-modal flex flex-col gap-3">
          <div
            v-if="info.title"
            class="p-1 bg-primary-6/20 dark-bg-primary-4 flex self-start gap-1 rounded-full text-primary dark-text-white/70"
          >
            <component :is="info.icon" v-if="info.icon" class="text-xl" />
            <span class="font-extrabold pr-1">
              <component :is="refToVNode(info.title)" />
            </span>
          </div>
          <p v-if="info.content" class="text-center font-bold text-xl">
            <component :is="refToVNode(info.content)" />
          </p>
          <div class="flex justify-end gap-5 mt-5">
            <button v-if="!info.hideCancel" class="dismiss-button" type="button" @click="$emit('cancel')">
              {{ info.cancelText || 'Cancel' }}
            </button>
            <button v-if="!info.hideConfirm" class="update-button" type="button" @click="$emit('confirm')">
              {{ info.confirmText || 'OK' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.common-modal {
  @apply z-95 transform-gpu translate-z-203vh fixed top-0 left-0 right-0 bottom-0 select-none;

  .common-modal-wrapper {
    @apply fixed top-0 left-0 right-0 bottom-0 px-5;
    @apply flex justify-center items-center;
  }

  .common-modal-modal {
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
</style>

<script setup lang="ts">
import { useModal } from '~/composables/useModal'

const HummerIcon = defineAsyncComponent(() => import('~icons/mingcute/hammer-line'))

const BuildIcon = defineAsyncComponent(() => import('~icons/mingcute/forbid-circle-line'))

const BuildInfo = defineAsyncComponent(() => import('./BuildInfo.vue'))

const showToolbar = ref(false)

const clickStack: number[] = []

let timer: NodeJS.Timeout

function onClick() {
  clickStack.push(Date.now())
  if (clickStack.length > 5) {
    clickStack.shift()
  }
  if (clickStack.length === 5) {
    if (clickStack[1] - clickStack[0] < 300) {
      clearTimeout(timer)
      showToolbar.value = true
      timer = setTimeout(() => {
        showToolbar.value = false
        clickStack.length = 0
      }, 8000)
    }
  }
}

onMounted(() => {
  window.addEventListener('pointerup', onClick)
})

onUnmounted(() => {
  window.removeEventListener('pointerup', onClick)
  clearTimeout(timer)
})

const { t } = useI18n()

function showBuildInfo() {
  useModal({
    title: t('build_info.title'),
    confirmText: t('build_info.close'),
    icon: BuildIcon,
    content: h(BuildInfo),
    hideCancel: true,
  })
}
</script>

<template>
  <Transition name="fade">
    <div v-if="showToolbar" class="debug-toolbar">
      <HummerIcon class="cursor-pointer" :title="$t('build_info.title')" @click="showBuildInfo" />
      <Teleport to="body">
        <DebugDevTrigger />
      </Teleport>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.debug-toolbar {
  @apply border-1 bg-white rounded-3 fixed top-[calc(env(safe-area-inset-top,0)+1.25rem)] left-5 z-99 transform-gpu translate-z-203vh;
  @apply p-3;
  @apply border-1.5 border-primary-3 text-primary;
}
</style>

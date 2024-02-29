<script setup lang="ts">
const showToolbar = ref(false)

const clickStack: number[] = []

let timer: number

function onClick() {
  clickStack.push(Date.now())
  if (clickStack.length > 5) {
    clickStack.shift()
  }
  if (clickStack.length === 5) {
    if (clickStack[1] - clickStack[0] < 300) {
      clearTimeout(timer)
      showToolbar.value = true
      setTimeout(() => {
        showToolbar.value = false
        clickStack.length = 0
      }, 8000)
    }
  }
}

onMounted(() => {
  window.addEventListener('click', onClick)
})

onUnmounted(() => {
  window.removeEventListener('click', onClick)
  clearTimeout(timer)
})
</script>

<template>
  <Transition name="fade">
    <div v-show="showToolbar" class="debug-toolbar">
      <DebugBuildInfo :title="$t('build_info.title')" />
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.debug-toolbar {
    @apply border-1 bg-white rounded-3 fixed top-5 left-5 z-99 transform-gpu translate-z-203vh;
    @apply p-3;
    @apply border-1.5 border-primary-3 text-primary;
}
</style>

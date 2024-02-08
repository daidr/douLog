<script setup lang="ts">
const panelCount = 2
const currentPanel = ref(-1)
function triggerPanel() {
  if (currentPanel.value === panelCount - 1) {
    currentPanel.value = -1
  } else {
    currentPanel.value++
  }
}
</script>

<template>
  <div
    class="fixed top-5 right-5 z-9998 w-15 h-15 bg-white text-primary border-2 border-primary rounded-full flex items-center justify-center cursor-pointer select-none transform-gpu translate-z-202vh"
    @click="triggerPanel"
  >
    {{ currentPanel === -1 ? 'DEV' : currentPanel === panelCount - 1 ? '⨉' : 'NEXT' }}
  </div>
  <DebugPanelsControl v-if="currentPanel === 0" />
  <DebugPanelsColors v-else-if="currentPanel === 1" />
</template>

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
  <div class="fixed z-9999">
    <DebugPanelsControl v-if="currentPanel === 0" />
    <DebugPanelsColors v-else-if="currentPanel === 1" />
    <div
      class="fixed top-5 right-5 w-15 h-15 bg-light dark-bg-dark text-primary border-2 border-primary rounded-full flex items-center justify-center cursor-pointer select-none text-center"
      @click="triggerPanel"
    >
      {{ currentPanel === -1 ? 'DEV' : currentPanel === panelCount - 1 ? '⨉' : 'DEV\n ➡️' }}
    </div>
  </div>
</template>

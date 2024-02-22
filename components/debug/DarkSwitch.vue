<script setup lang="ts">
const statesStore = useStatesStore()
const { isDarkMode, colorMode } = storeToRefs(statesStore)
</script>

<template>
  <div class="flex gap-2">
    <div>
      <input v-model="isDarkMode" type="checkbox">
      <label> Dark Mode</label>
    </div>
    <button class="border-primary border-1 px-2" @click="colorMode = 'auto'">
      Auto
    </button>
  </div>
</template>

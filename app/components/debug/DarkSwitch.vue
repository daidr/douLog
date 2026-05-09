<script setup lang="ts">
const colorMode = useColorMode()

const isDarkMode = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set(value) {
    colorMode.preference = value ? 'dark' : 'light'
  },
})
</script>

<template>
  <div class="flex gap-2">
    <div>
      <input v-model="isDarkMode" type="checkbox">
      <label> Dark Mode</label>
    </div>
    <button class="border-primary border-1 px-2" @click="colorMode.preference = 'system'">
      Default (current: {{ colorMode.preference }})
    </button>
  </div>
</template>

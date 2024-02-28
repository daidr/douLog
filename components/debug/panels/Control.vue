<script setup lang="ts">
const statesStore = useStatesStore()
const { setRandomThemeColorIndex } = statesStore
const { themeColorList, randomThemeColorIndex } = storeToRefs(statesStore)
</script>

<template>
  <div
    class="p-3 fixed top-5 right-25 min-h-100 min-w-70 rounded-5 bg-light dark-bg-dark text-dark dark-text-light ring-primary ring-2 flex flex-col gap-3"
  >
    <DebugDarkSwitch />
    <div>
      <p>Theme</p>
      <div class="flex gap-1">
        <div
          v-for="(themeColor, index) of themeColorList" :key="themeColor"
          class="h-7 w-7 rounded-lg cursor-pointer"
          :style="{
            backgroundColor: themeColor,
          }"
          :class="{
            'ring-3 ring-primary': randomThemeColorIndex === index,
          }"
          @click="setRandomThemeColorIndex(index)"
        />
      </div>
    </div>
    <DebugLangSelect />
  </div>
</template>

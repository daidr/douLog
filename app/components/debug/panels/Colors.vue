<script setup lang="ts">
const { themeColorList } = storeToRefs(useStatesStore())
const colorVariable = [
  'bg-primary-1',
  'bg-primary-2',
  'bg-primary-3',
  'bg-primary-4',
  'bg-primary-5',
  'bg-primary-6',
  'bg-primary-7',
  'bg-primary-8',
  'bg-primary-9',
  'bg-primary-10',
]
</script>

<template>
  <div
    class="fixed top-0 right-0 left-0 bottom-0 p-10 lg-p-20 pr-30 bg-light dark-bg-dark text-dark dark-text-light"
  >
    <DebugDarkSwitch />
    <div
      class="h-full w-full grid gap-5px md-gap-10px lg-gap-20px" :style="{
        gridTemplateColumns: `repeat(${themeColorList.length}, minmax(0, 1fr))`,
      }"
    >
      <div
        v-for="(themeColor, index) of themeColorList" :key="themeColor" class="h-full"
        :class="[`theme-${index + 1}`]"
      >
        <p>theme-{{ index + 1 }}</p>
        <div v-for="color of colorVariable" :key="color" class="w-full h-60px" :class="color">
          <div class="opacity-0 hover-opacity-100 transition-opacity h-full w-full text-sm p-1">
            {{ color }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

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

const isDark = ref(false)
</script>

<template>
  <div
    class="fixed top-0 right-0 left-0 bottom-0 z-9997 transform-gpu translate-z-201vh p-20 pr-30" :class="{
      ' bg-[#fcfcfc]': !isDark,
      ' bg-[#141414]': isDark,
      'dark': isDark,
      'text-white': isDark,
      'text-black': !isDark,
    }"
  >
    <div>
      <input v-model="isDark" type="checkbox">
      <label for="isDark">Dark Mode</label>
    </div>
    <div
      class="h-full w-full grid gap-20px" :style="{
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

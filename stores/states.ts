export const useStatesStore = defineStore('states', () => {
  const themeColorList = ref([
    '#b1dafb',
    '#fcbcb9',
    '#dbb3e3',
    '#c0e3c2',
    '#bcc2e5',
    '#d0c4bf',
    '#c7d2d5',
    '#a6dad5',
  ])

  const randomThemeColorIndex = ref(
    Math.floor(Math.random() * themeColorList.value.length),
  )

  const themeColor = computed(() => themeColorList.value[randomThemeColorIndex.value])

  return {
    themeColor,
    randomThemeColorIndex,
    themeColorList: readonly(themeColorList),
  }
})

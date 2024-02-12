const lightThemeColor = [
  '#abdcff',
  '#ffc3ba',
  '#ebbbf0',
  '#c3e4c4',
  '#b8c5f2',
  '#d1c5be',
  '#cbd3d6',
  '#a1d4ca',
]

const darkThemeColor = [
  '#121f2e',
  '#2f1312',
  '#28142f',
  '#162e1a',
  '#14162d',
  '#1e130f',
  '#171e24',
  '#0e2020',
]

export const useStatesStore = defineStore('states', () => {
  const isDarkMode = ref(false)

  const themeColorList = computed(() => {
    return isDarkMode.value ? darkThemeColor : lightThemeColor
  })

  const randomThemeColorIndex = ref(
    Math.floor(Math.random() * themeColorList.value.length),
  )
  const setRandomThemeColorIndex = (target: number) => {
    randomThemeColorIndex.value = target
  }

  const themeColor = computed(() => themeColorList.value[randomThemeColorIndex.value] || themeColorList.value[0])

  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value
  }

  const setDarkMode = (value: boolean) => {
    isDarkMode.value = value
  }

  return {
    themeColor,
    randomThemeColorIndex,
    themeColorList,
    isDarkMode,
    toggleDarkMode,
    setRandomThemeColorIndex,
    setDarkMode,
  }
})

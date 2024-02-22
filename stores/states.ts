import { skipHydrate } from 'pinia'

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
  const colorMode = useColorMode()

  const themeColorList = computed(() => {
    return colorMode.value === 'dark' ? darkThemeColor : lightThemeColor
  })

  const randomThemeColorIndex = ref(
    Math.floor(Math.random() * themeColorList.value.length),
  )

  const setRandomThemeColorIndex = (index: number) => {
    randomThemeColorIndex.value = index
  }

  const themeColor = computed(() => themeColorList.value[randomThemeColorIndex.value] || '#ffffff')

  const isDarkMode = computed({
    get: () => colorMode.value === 'dark',
    set: (value) => {
      colorMode.value = value ? 'dark' : 'light'
    },
  })

  return {
    themeColor: skipHydrate(themeColor),
    randomThemeColorIndex: skipHydrate(randomThemeColorIndex),
    themeColorList: skipHydrate(themeColorList),
    colorMode: skipHydrate(colorMode),
    isDarkMode: skipHydrate(isDarkMode),
    setRandomThemeColorIndex,
  }
})

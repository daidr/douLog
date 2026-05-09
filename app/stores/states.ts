import { skipHydrate } from 'pinia'

const lightThemeColor = [
  '#b7d0e8',
  '#f2bdb1',
  '#dbcade',
  '#d2dbce',
  '#c0cdeb',
  '#ded7d3',
  '#d3dade',
  '#a7dbd2',
]

const darkThemeColor = [
  '#151f2e',
  '#2e1513',
  '#25172b',
  '#192916',
  '#161a2e',
  '#2b1d18',
  '#1a242b',
  '#122927',
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

  return {
    themeColor: skipHydrate(themeColor),
    randomThemeColorIndex: skipHydrate(randomThemeColorIndex),
    themeColorList: skipHydrate(themeColorList),
    setRandomThemeColorIndex,
  }
})

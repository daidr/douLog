import { skipHydrate } from 'pinia'

const lightThemeColor = [
  '#BCD0E6',
  '#EABFB3',
  '#D8CBDD',
  '#D4DBCF',
  '#C2CDE8',
  '#DDD7D4',
  '#D4DADE',
  '#B2DAD2',
]

const darkThemeColor = [
  '#171F2D',
  '#2B1614',
  '#23182A',
  '#1D2818',
  '#161A2D',
  '#291D19',
  '#1C242A',
  '#172927',
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

<script setup>
import { useWindowSize } from '@vueuse/core'

const MainCanvasRef = ref(null)

const { width, height } = useWindowSize()

const cellSize = computed(() =>
  4000 > Math.max(width.value, height.value) ? 18 : 25
)

const cellCol = computed(() => ~~(width.value / cellSize.value))
const cellRow = computed(() => ~~(height.value / cellSize.value))

const isDisabled = ref(false)
const isDarkMode = ref(false)

let timer = 0

onMounted(() => {
  const ctx = MainCanvasRef.value.getContext('2d')

  watch(
    [width, height],
    () => {
      isDisabled.value = true
      clearTimeout(timer)
      debouncedInit(ctx)
    },
    { immediate: true }
  )
})

onUnmounted(() => {
  clearTimeout(timer)
})

const debouncedInit = useDebounceFn(init, 1000)

function init(ctx) {
  clearTimeout(timer)
  MainCanvasRef.value.width = width.value
  MainCanvasRef.value.height = height.value
  run(randomCell(cellCol.value, cellRow.value), ctx)
  isDisabled.value = false
}

const themeColor = inject('themeColor')

function run(cells, ctx) {
  timer = setTimeout(
    run,
    150,
    (function (cells) {
      if (isDisabled.value) return cells
      const cellColorList = []
      for (let i = 0; i < cellCol.value; ++i) {
        const cellRowList = Array(cellRow.value).fill(false)
        cellColorList[i] = cellRowList
        for (let j = 0; j < cellRow.value; ++j) {
          let temp = !!cells[i][j - 1] + !!cells[i][j + 1]
          i > 0 &&
            (temp +=
              !!cells[i - 1][j - 1] +
              !!cells[i - 1][j + 1] +
              !!cells[i - 1][j]),
            i < cellCol.value - 1 &&
              (temp +=
                !!cells[i + 1][j - 1] +
                !!cells[i + 1][j + 1] +
                !!cells[i + 1][j]),
            cells[i][j]
              ? temp < 2
                ? (cellRowList[j] = false)
                : temp < 4
                ? (cellRowList[j] = true)
                : (cellRowList[j] = false)
              : 3 === temp
              ? (cellRowList[j] = true)
              : (cellRowList[j] = false),
            (ctx.fillStyle = isDarkMode.value
              ? cellRowList[j]
                ? '#111'
                : 'rgba(0,0,0,.5)'
              : cellRowList[j]
              ? '#f5f5f5'
              : `${themeColor}44`),
            ctx.fillRect(
              i * cellSize.value,
              j * cellSize.value,
              cellSize.value,
              cellSize.value
            )
        }
      }
      return cellColorList
    })(cells),
    ctx
  )
}

function randomCell(col, row) {
  const cellList = []
  for (let i = 0; i < col; ++i) {
    cellList[i] = Array(row).fill(false)
  }
  for (let j = 0, i = (col * row) / 12; j < i; ++j) {
    cellList[randomInt(col)][randomInt(row)] = !0
  }

  if (col > 10 && row > 10)
    for (let i = 0; i < 10; ++i) {
      let _col = randomInt(col - 10)
      let _row = randomInt(row - 10)

      cellList[_col][_row] =
        cellList[_col + 1][_row + 1] =
        cellList[_col + 1][_row + 2] =
        cellList[_col + 2][_row + 0] =
        cellList[_col + 2][_row + 1] =
          true

      _col = randomInt(col - 10)
      _row = randomInt(row - 10)

      cellList[_col + 1][_row] =
        cellList[_col + 2][_row] =
        cellList[_col + 3][_row] =
        cellList[_col + 4][_row] =
        cellList[_col + 5][_row] =
        cellList[_col][_row + 1] =
        cellList[_col + 5][_row + 1] =
        cellList[_col + 5][_row + 2] =
        cellList[_col][_row + 3] =
        cellList[_col + 4][_row + 3] =
        cellList[_col + 2][_row + 4] =
          true
    }
  return cellList
}

function randomInt(range, offset = 0) {
  return ~~(Math.random() * range + offset)
}
</script>

<template>
  <canvas ref="MainCanvasRef" :class="{ hide: isDisabled }" />
</template>

<style scoped lang="scss">
canvas {
  @apply pointer-events-none opacity-10;
  @apply transition-opacity duration-800;
  @apply fixed left-0 top-0 -z-1;

  &.hide {
    @apply opacity-0;
  }
}
</style>

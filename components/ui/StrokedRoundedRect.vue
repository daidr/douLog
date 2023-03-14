<script setup lang="ts">
const props = defineProps<{
  width: number
  height: number
  radius: number
  strokeWidth: number
  setPathTotalLength: (length: number) => void
}>()

function getPath(r: number, w: number, h: number, lineWidth: number) {
  // 描边后的半径、宽度、高度
  const adjR = r - lineWidth
  const adjW = w - lineWidth
  const adjH = h - lineWidth

  // 左上角起始点
  let path = `M${adjR + lineWidth / 2} ${lineWidth / 2}`
  // 上边线
  path += `h${adjW - 2 * adjR}`
  // 右上角圆弧
  path += `a${adjR + lineWidth / 2} ${
    adjR + lineWidth / 2
  } 0 0 1 ${adjR} ${adjR}`
  // 右边线
  path += `v${adjH - 2 * adjR}`
  // 右下角圆弧
  path += `a${adjR + lineWidth / 2} ${
    adjR + lineWidth / 2
  } 0 0 1 -${adjR} ${adjR}`
  // 下边线
  path += `h${-adjW + 2 * adjR}`
  // 左下角圆弧
  path += `a${adjR + lineWidth / 2} ${
    adjR + lineWidth / 2
  } 0 0 1 -${adjR} -${adjR}`
  // 左边线
  path += `v${-adjH + 2 * adjR}`
  // 左上角圆弧
  path += `a${adjR + lineWidth / 2} ${
    adjR + lineWidth / 2
  } 0 0 1 ${adjR} -${adjR}`
  path += 'Z'
  return path
}

const computedPath = computed(() =>
  getPath(props.radius, props.width, props.height, props.strokeWidth)
)

const pathRef: Ref<SVGPathElement | null> = ref(null)

watch(
  () => [
    props.width,
    props.height,
    props.radius,
    props.strokeWidth,
    pathRef.value,
  ],
  () => {
    props.setPathTotalLength(pathRef.value?.getTotalLength() ?? 0)
  },
  {
    immediate: true,
  }
)
</script>

<template>
  <path
    ref="pathRef"
    :d="computedPath"
    :style="{ strokeWidth: `${strokeWidth}px` }"
  />
</template>

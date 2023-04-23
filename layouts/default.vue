<script setup>
const randomBackground = useState('randomBackground', () => {
  const randomIndex = Math.floor(Math.random() * 2)
  return randomIndex
})

const UiBackgroundGeometric = defineAsyncComponent(() =>
  import('@/components/ui/Background/Geometric.vue')
)

// const UiBackgroundLifeGame = defineAsyncComponent(() =>
//   import('@/components/ui/Background/LifeGame.vue')
// )
</script>

<template>
  <div class="main-wrapper">
    <!-- <Component
      :is="
        randomBackground === 0 ? UiBackgroundGeometric : UiBackgroundLifeGame
      "
    /> -->
    <Component :is="UiBackgroundGeometric" />
    <slot />
    <SiteFooter />
  </div>
</template>

<style scoped lang="scss">
.main-wrapper {
  @apply bg-primary-light;
  @apply h-full;
  transform-style: preserve-3d;
  perspective-origin: 150% 150%;
}
</style>

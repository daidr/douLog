<script setup>
const head = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true,
})

const route = useRoute()
const { t } = useI18n()

const title = computed(() =>
  t('layouts.title', { title: t(route.meta.title ?? 'TBD') }),
)

const _randomBackground = useState('randomBackground', () => {
  const randomIndex = Math.floor(Math.random() * 2)
  return randomIndex
})

const UiBackgroundGeometric = defineAsyncComponent(() =>
  import('@/components/ui/Background/Geometric.vue'),
)
</script>

<template>
  <Html :lang="head.htmlAttrs.lang" :dir="head.htmlAttrs.dir">
    <Head>
      <Title>{{ title }}</Title>
      <template v-for="link in head.link" :key="link.id">
        <Link :id="link.id" :rel="link.rel" :href="link.href" :hreflang="link.hreflang" />
      </template>
      <template v-for="meta in head.meta" :key="meta.id">
        <Meta :id="meta.id" :property="meta.property" :content="meta.content" />
      </template>
    </Head>

    <Body>
      <div class="main-wrapper">
        <!-- <Component
      :is="
        randomBackground === 0 ? UiBackgroundGeometric : UiBackgroundLifeGame
      "
    /> -->
        <Component :is="UiBackgroundGeometric" />
        <CommonPwaHeader />
        <slot />
        <SiteFooter />
        <DevOnly>
          <ClientOnly>
            <Teleport to="body">
              <DebugDevTrigger />
            </Teleport>
          </ClientOnly>
        </DevOnly>
      </div>
    </Body>
  </Html>
</template>

<style scoped lang="scss">
.main-wrapper {
  @apply bg-primary-2;
  @apply h-full;
  transform-style: preserve-3d;
  perspective-origin: 150% 150%;
}
</style>

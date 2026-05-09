<script setup lang="ts">
import { useModal } from '~/composables/useModal'
import UpdateIcon from '~icons/mingcute/arrow-up-circle-line'

const { t } = useI18n()

let closeFn = () => { }

watch(() => useNuxtApp().$pwa?.needRefresh, (value) => {
  if (!value) {
    closeFn()
    return
  }
  const { close } = useModal({
    title: t('pwa.upgrade'),
    confirmText: t('pwa.update'),
    cancelText: t('pwa.dismiss'),
    icon: UpdateIcon,
    content: t('pwa.title'),
    onConfirm: () => useNuxtApp().$pwa?.updateServiceWorker(true),
  })
  closeFn = close
}, {
  immediate: true,
})

onUnmounted(() => {
  closeFn()
})
</script>

<template>
  <div />
</template>

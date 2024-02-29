<script setup lang="ts">
import UpdateIcon from '~icons/mingcute/arrow-up-circle-line'
</script>

<template>
  <CommonPrompt
    :visible="Boolean(useNuxtApp().$pwa?.needRefresh)" :title="$t('pwa.upgrade')"
    :cancel-text="$t('pwa.dismiss')" :confirm-text="$t('pwa.update')" :icon="UpdateIcon"
    @cancel="useNuxtApp().$pwa?.close()"
    @confirm="useNuxtApp().$pwa?.updateServiceWorker()"
  >
    {{ $t('pwa.title') }}
  </CommonPrompt>
</template>

<script lang="ts" setup>
import type { ComputedRef } from 'vue'
import type { LocaleObject } from '@nuxtjs/i18n'

const localSettings = useLocalSettings()

const { locales } = useI18n() as { locales: ComputedRef<LocaleObject[]> }
</script>

<template>
  <select v-model="localSettings.language" class="bg-transparent border-1 border-primary text-primary">
    <option
      v-for="item in locales" :key="item.code" :value="item.code"
      :selected="localSettings.language === item.code"
    >
      {{ item.name }}
    </option>
  </select>
</template>

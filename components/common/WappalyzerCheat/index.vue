<script setup>
// inport js as string
import wappalyzerCheat from './utils.min.txt?raw'

useHead({
  script: [
    {
      innerHTML: wappalyzerCheat,
      type: 'text/javascript',
      tagPosition: 'bodyClose',
    },
  ],
})
</script>

<template>
  <div id="svelte-announcer" class="svelte-hello" />
</template>

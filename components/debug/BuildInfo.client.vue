<script setup lang="ts">
import HummerIcon from '~icons/mingcute/hammer-line'

const BuildIcon = defineAsyncComponent(() => import('~icons/mingcute/forbid-circle-line'))

const showBuildInfo = ref(false)
</script>

<template>
  <div>
    <HummerIcon class="cursor-pointer" @click="showBuildInfo = true" />
    <ClientOnly>
      <Teleport to="body">
        <CommonPrompt
          :visible="showBuildInfo" :title="$t('build_info.title')"
          :confirm-text="$t('build_info.close')" :icon="BuildIcon" @confirm="showBuildInfo = false"
        >
          <div class="text-left grid grid-cols-2">
            <p> {{ $t("build_info.branch") }}</p>
            <p>{{ useBuildInfo().branch }}</p>
            <p>{{ $t('build_info.build_time') }}</p>
            <p :title="`${useBuildInfo().time}`">
              {{ new Date(useBuildInfo().time).toLocaleString() }}
            </p>
            <p>{{ $t('build_info.commit_hash') }}</p>
            <p :title="useBuildInfo().commit">
              {{ useBuildInfo().shortCommit }}
            </p>
            <p> {{ $t("build_info.env") }}</p>
            <p>{{ useBuildInfo().env }}</p>
          </div>
        </CommonPrompt>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped></style>

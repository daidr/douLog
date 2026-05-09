<template>
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
</template>

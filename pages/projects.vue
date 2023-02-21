<script setup>
import { BlockDefination } from '@/config/projects'

useHead({
  title: '实验室',
})
</script>

<template>
  <div class="projects-page-wrapper y-scroll-box">
    <div class="limit-wrapper">
      <div class="main-menu-wrapper transition-page-wrapper">
        <SiteMainNav />
      </div>
      <div class="block-wrapper-group transition-extra-wrapper">
        <div
          v-for="block of BlockDefination"
          :key="block.blockId"
          class="block-wrapper"
        >
          <div
            v-for="section of block.sections"
            :key="section.sectionId"
            class="section-wrapper"
          >
            <div class="title">{{ section.title }}</div>
            <UiXScrollBox class="projects-group">
              <a
                v-for="project of section.projects"
                :key="project.url"
                class="project-wrapper"
                :href="project.url"
                target="_blank"
              >
                <div class="project-image">
                  <UiLazyImage :src="project.image" />
                </div>

                <div class="project-title">{{ project.title }}</div>
                <div class="project-description">{{ project.description }}</div>
              </a>
            </UiXScrollBox>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.projects-page-wrapper {
  @apply "w-full h-full";
  @apply "fixed top-0 left-0";
  @apply overflow-x-hidden;
  @apply "pb-18 md:pb-21";

  scrollbar-width: thin;
  scrollbar-color: rgb(var(--color-primary) / 0.8)
    rgb(var(--color-primary-light));

  // 滚动条
  &::-webkit-scrollbar {
    @apply w-2;
  }

  &::-webkit-scrollbar-thumb {
    @apply bg-primary/80;
    @apply rounded-full;
  }

  &::-webkit-scrollbar-track {
    @apply bg-primary-light;
    @apply rounded-full;
  }

  .limit-wrapper {
    @apply flex flex-col items-start;
    @apply p-3;
    // 其实应该用gap-y更好，但是flex布局gap-y兼容性不太好
    @apply space-y-3;
    @apply max-w-1300px;
    margin: 0 auto;
  }

  .main-menu-wrapper {
    @apply "rounded-4xl";
    @apply "bg-white";
    @apply "flex justify-center space-x-3";
    @apply "py-5 w-full sm:w-340px";
    @apply "select-none";
    @apply "shadow-2xl shadow-primary/30";
    @apply z-90 translate-z-150vh;
  }

  .block-wrapper-group {
    @apply w-full flex flex-col z-91;
    @apply space-y-3;
    @apply relative;

    .block-wrapper {
      @apply "bg-white px-5 md:px-8 py-8 w-full";
      @apply rounded-4xl;
      @apply "shadow-2xl shadow-primary/30";
      @apply space-y-8;

      .section-wrapper {
        .title {
          @apply text-primary/70 font-bold text-xl;
          @apply pl-4 relative;

          &::before {
            content: '';
            @apply absolute top-0.5 bottom-0.5 left-0 w-1;
            @apply bg-primary/70 rounded-full;
          }
        }

        .projects-group {
          :deep(.x-scroll-box) {
            @apply flex space-x-3 overflow-auto py-3;
          }

          .project-wrapper {
            @apply p-2 rounded-3xl bg-white transition transform-gpu;
            @apply w-266px;
            @apply border-1 border-gray-200;
            @apply cursor-pointer;
            @apply duration-500;
            transition-timing-function: cubic-bezier(0.36, 1.1, 0.2, 1.2);

            .project-image {
              @apply w-250px h-145px;
              @apply overflow-hidden;
              @apply rounded-2xl;
              @apply relative;
              @apply border-1 border-gray-200;

              &:deep(.lazy-image) {
                @apply h-auto min-h-full;
              }
            }

            &:hover {
              @apply shadow-lg shadow-primary/10;
              @apply border-1 border-primary/30;
              @apply -translate-y-2;
            }

            .project-title {
              @apply text-primary font-medium text-lg;
              @apply mt-2 px-2;
            }

            .project-description {
              @apply text-primary/70 text-sm;
              @apply px-2;
            }
          }
        }
      }
    }
  }
}
</style>

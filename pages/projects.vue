<script setup>
import { BlockDefination } from '@/config/projects'

const { t } = useI18n()

useHead({
  title: computed(() => t('main_nav.projects')),
})
</script>

<template>
  <div class="projects-page-wrapper y-scroll-box">
    <div class="limit-wrapper">
      <div class="main-menu-wrapper transition-page-wrapper">
        <SiteMainNav />
      </div>
      <div class="block-wrapper-group transition-extra-wrapper">
        <div v-for="block of BlockDefination" :key="block.blockId" class="block-wrapper">
          <div v-for="section of block.sections" :key="section.sectionId" class="section-wrapper">
            <div class="title">
              {{ section.title }}
            </div>
            <UiXScrollBox class="projects-group">
              <a
                v-for="project of section.projects" :key="project.url" class="project-wrapper" :href="project.url"
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
.transition-page-wrapper {
  @apply mt-[env(safe-area-inset-top,0)];
}

.projects-page-wrapper {
  @apply w-full h-full;
  @apply fixed top-0 left-0;
  @apply overflow-x-hidden;
  @apply pb-18 md:pb-21;

  scrollbar-width: thin;
  scrollbar-color: rgba(var(--color-primary), 0.8) rgb(var(--color-primary-1));

  // 滚动条
  &::-webkit-scrollbar {
    @apply w-2;
  }

  &::-webkit-scrollbar-thumb {
    @apply bg-primary-5;
    @apply rounded-full;
  }

  &::-webkit-scrollbar-track {
    @apply bg-primary-1;
    @apply rounded-full;
  }

  .limit-wrapper {
    @apply flex flex-col items-start;
    @apply p-3;
    // 其实应该用gap-y更好，但是flex布局gap-y兼容性不太好
    @apply gap-y-3;
    @apply max-w-1300px;
    margin: 0 auto;
  }

  .main-menu-wrapper {
    @apply rounded-8;
    @apply bg-light dark-bg-dark;
    @apply flex justify-center gap-x-3;
    @apply py-5 w-full sm:w-auto px-5;
    @apply select-none;
    @apply shadow-2xl general-shadow;
    @apply z-90 translate-z-150vh;
  }

  .block-wrapper-group {
    @apply w-full flex flex-col z-91;
    @apply gap-y-3;
    @apply relative;

    .block-wrapper {
      @apply bg-light dark-bg-dark px-5 md:px-8 py-8 w-full;
      @apply rounded-8;
      @apply shadow-2xl general-shadow;
      @apply gap-y-8;

      .section-wrapper {
        .title {
          @apply text-primary-text font-bold text-xl;
          @apply pl-4 relative;

          &::before {
            content: '';
            @apply absolute top-0.5 bottom-0.5 left-0 w-1;
            @apply bg-primary-text rounded-full;
          }
        }

        .projects-group {
          @apply flex gap-x-3 overflow-auto py-5;

          .project-wrapper {
            @apply p-2 rounded-3xl bg-primary-1/20 dark-bg-primary-1 transform-gpu;
            @apply w-266px relative;
            @apply border-1 border-gray-200 dark-border-gray-700;
            @apply cursor-pointer;
            @apply duration-500 transition-margin, transform, box-shadow, border-color;
            transition-timing-function: cubic-bezier(0.36, 1.1, 0.2, 1.2);

            &::before {
              @apply -z-1;
              @apply content-empty absolute top-0 -left-2 -right-2 bottom-0;
            }

            .project-image {
              @apply w-250px h-145px;
              @apply overflow-hidden;
              @apply rounded-2xl;
              @apply relative;
              @apply border-1 dark-border-gray-700;
              @apply transition duration-500 transform-gpu;
              transition-timing-function: cubic-bezier(0.36, 1.1, 0.2, 1.2);

              :deep(.lazy-image) {
                @apply h-auto min-h-full;
              }

              :deep(img) {
                @apply transition-filter duration-500;
              }
            }

            &:hover {
              @apply shadow-lg shadow-primary-shadow/30;
              @apply border-1 border-primary-3 dark-border-primary-7;
              @apply -translate-y-2 mx-5;

              .project-image {
                @apply border-1 border-primary-3 dark-border-primary-7;
                @apply scale-113 shadow-lg shadow-primary-shadow/30 z-999;

                :deep(img) {
                  filter: brightness(1);
                }
              }

              &::before {
                @apply -left-7 -right-7;
              }
            }

            .project-title {
              @apply text-primary dark-text-primary-8 font-medium text-lg;
              @apply mt-2 px-2;
            }

            .project-description {
              @apply text-primary-4 dark-text-primary-7 text-sm;
              @apply px-2;
            }
          }
        }
      }
    }
  }
}
</style>

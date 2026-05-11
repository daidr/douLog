<script setup lang="ts">
import type { IProjectSection } from '~~/types/feed'
import IconGithub from '~icons/mingcute/github-line'
import IconHomepage from '~icons/mingcute/earth-line'

const { t } = useI18n()

useHead({
  title: computed(() => t('main_nav.projects')),
})

// 服务端聚合好的 section 列表（按 story-verse project-categories id 升序，每
// 个分类下的项目按 id 倒序）。空分类已在服务端剔除，这里直接渲染。
const { data: sections } = await useFetch<IProjectSection[]>('/api/projects', {
  default: () => [] as IProjectSection[],
})
</script>

<template>
  <div class="projects-page-wrapper y-scroll-box">
    <div class="limit-wrapper">
      <div class="main-menu-wrapper transition-page-wrapper">
        <SiteMainNav />
      </div>
      <div class="block-wrapper-group transition-extra-wrapper">
        <div class="block-wrapper">
          <div v-for="section of sections" :key="section.id" class="section-wrapper">
            <div class="title">
              {{ section.title }}
            </div>
            <UiXScrollBox class="projects-group">
              <div v-for="project of section.projects" :key="project.id" class="project-wrapper">
                <div class="project-image">
                  <UiLazyImage v-if="project.imageUrl" :src="project.imageUrl" />
                </div>

                <div class="project-title">{{ project.title }}</div>
                <div class="project-description">{{ project.description }}</div>

                <div v-if="project.repoLink || project.homepageLink" class="project-links">
                  <a
                    v-if="project.repoLink" :href="project.repoLink" target="_blank" rel="noopener noreferrer"
                    class="project-link" title="GitHub"
                  >
                    <IconGithub />
                  </a>
                  <a
                    v-if="project.homepageLink" :href="project.homepageLink" target="_blank" rel="noopener noreferrer"
                    class="project-link" title="Homepage"
                  >
                    <IconHomepage />
                  </a>
                </div>
              </div>
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
              @apply bg-primary-1 dark-bg-primary-2;

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
              @apply translate-y-2 mx-5;

              .project-image {
                @apply border-1 border-primary-3 dark-border-primary-7;
                @apply scale-113 -rotate-3 -translate-y-2 shadow-lg shadow-primary-shadow/30 z-999;

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

            // 按钮贴卡片 p-2 内圈，圆角 16px (= 卡片外 24px − 8px 内边距) 与
            // 外角同心；跟 .project-image 同一尺度。
            .project-links {
              @apply mt-2 flex justify-end gap-x-1;

              .project-link {
                @apply w-9 h-9 flex items-center justify-center;
                @apply text-primary-4 dark-text-primary-7 text-base;
                @apply rounded-2xl;
                @apply transition duration-200;
                @apply cursor-pointer;

                &:hover {
                  @apply bg-primary-2 dark-bg-primary-3;
                  @apply text-primary-7 dark-text-primary-9;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>

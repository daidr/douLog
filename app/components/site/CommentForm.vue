<script setup lang="ts">
import type { ICreateCommentBody, ICreateCommentResponse, IReply } from '~~/types/feed'
import IconLoading from '~icons/mingcute/loading-3-line'

const props = withDefaults(defineProps<{
  postId: number
  /** 回复模式：传顶层或被回复评论的 id；未传则是顶层评论。 */
  parentId?: number
  placeholder?: string
  /** 回复模式下展示"取消"按钮，让父组件能切回未展开态。 */
  showCancel?: boolean
}>(), {
  parentId: undefined,
  placeholder: undefined,
  showCancel: false,
})

const emit = defineEmits<{
  /**
   * 提交成功事件。
   *  - reply !== null  → 评论已 approved，可以立即插入列表
   *  - reply === null  → 进入 pending（首次匿名 / 蜜罐 / 关键词触发）
   */
  submitted: [reply: IReply | null]
  cancel: []
}>()

const { t } = useI18n()
const config = useRuntimeConfig()
const apiEntry = config.public.apiEntry

// 表单字段
const content = ref('')
const guestName = ref('')
const guestEmail = ref('')
const guestWebsite = ref('')
// 蜜罐：故意取一个看起来正常的 name；前端表单不展示，只在最终提交体里发空值
const honeypot = ref('')

const submitting = ref(false)
const errorMsg = ref('')

const STORAGE_KEY = 'douLog:comment-identity'

/**
 * 从 localStorage 取上一次填的昵称 / 邮箱 / 网站，避免每次评论都重填。
 * 邮箱是匿名评论"白名单"的关键（同邮箱有 approved 历史的下次直接发布），
 * 让用户复用同一邮箱也能提升提交体验。
 */
onMounted(() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw) as Partial<{ name: string, email: string, website: string }>
    if (typeof data.name === 'string') guestName.value = data.name
    if (typeof data.email === 'string') guestEmail.value = data.email
    if (typeof data.website === 'string') guestWebsite.value = data.website
  } catch {
    /* localStorage 可能在隐私模式下不可用，静默忽略 */
  }
})

function persistIdentity() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      name: guestName.value,
      email: guestEmail.value,
      website: guestWebsite.value,
    }))
  } catch { /* ignore */ }
}

const isReply = computed(() => typeof props.parentId === 'number')

async function onSubmit() {
  errorMsg.value = ''

  const c = content.value.trim()
  if (!c) {
    errorMsg.value = t('comment.errors.content_required')
    return
  }
  if (c.length > 2000) {
    errorMsg.value = t('comment.errors.content_too_long')
    return
  }
  const name = guestName.value.trim()
  if (!name) {
    errorMsg.value = t('comment.errors.name_required')
    return
  }
  const email = guestEmail.value.trim()
  // 简单 RFC 风格校验：服务端会做更严格的，但前端先挡一道
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorMsg.value = t('comment.errors.email_invalid')
    return
  }
  const website = guestWebsite.value.trim()

  const body: ICreateCommentBody = {
    postId: props.postId,
    content: c,
    parentId: props.parentId,
    guestName: name,
    guestEmail: email,
    guestWebsite: website || undefined,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    website_url: honeypot.value || undefined,
  }

  submitting.value = true
  try {
    const result = await $fetch<ICreateCommentResponse>(`${apiEntry}/api/comments`, {
      method: 'POST',
      body,
    })
    persistIdentity()
    content.value = ''
    emit('submitted', result.data ?? null)
  } catch (err: any) {
    // SV 把限速 / 内容不允许等返 4xx；优先取后端的错误描述
    const msg = err?.data?.message || err?.message
    errorMsg.value = msg || t('comment.errors.submit_failed')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="comment-form" @submit.prevent="onSubmit">
    <textarea
      v-model="content"
      class="comment-form__textarea"
      :placeholder="placeholder ?? (isReply ? t('comment.reply_placeholder') : t('comment.placeholder'))"
      rows="4"
      maxlength="2000"
      :disabled="submitting"
    />
    <div class="comment-form__meta">
      <input
        v-model="guestName"
        type="text"
        class="comment-form__input"
        :placeholder="t('comment.field.name')"
        maxlength="32"
        autocomplete="nickname"
        :disabled="submitting"
      >
      <input
        v-model="guestEmail"
        type="email"
        class="comment-form__input"
        :placeholder="t('comment.field.email')"
        maxlength="254"
        autocomplete="email"
        :disabled="submitting"
      >
      <input
        v-model="guestWebsite"
        type="url"
        class="comment-form__input"
        :placeholder="t('comment.field.website')"
        maxlength="200"
        autocomplete="url"
        :disabled="submitting"
      >
    </div>
    <!-- 蜜罐：人类用 tabindex=-1 + visually hidden + autocomplete=off 避开；
         机器人通常按 name/type 自动填充就会触发 -->
    <div class="comment-form__honeypot" aria-hidden="true">
      <label>
        Website
        <input
          v-model="honeypot"
          type="text"
          name="website_url"
          tabindex="-1"
          autocomplete="off"
        >
      </label>
    </div>
    <div class="comment-form__actions">
      <span v-if="errorMsg" class="comment-form__error">{{ errorMsg }}</span>
      <button
        v-if="showCancel"
        type="button"
        class="comment-form__btn comment-form__btn--ghost"
        @click="emit('cancel')"
      >
        {{ t('comment.cancel') }}
      </button>
      <button
        type="submit"
        class="comment-form__btn comment-form__btn--primary"
        :disabled="submitting"
      >
        <IconLoading v-if="submitting" class="animate-spin" />
        {{ submitting ? t('comment.submitting') : t('comment.submit') }}
      </button>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.comment-form {
  @apply flex flex-col gap-3;
  @apply rounded-2xl p-4;
  @apply bg-primary-1/30 dark-bg-primary-2/30;
  @apply border border-primary-2/40 dark-border-primary-4/40;
}

.comment-form__textarea {
  @apply w-full px-3 py-2 rounded-xl resize-y;
  @apply bg-light dark-bg-dark/60;
  @apply border border-primary-2/60 dark-border-primary-4/60;
  @apply text-dark dark-text-light;
  @apply transition-colors;
  min-height: 5.5rem;

  &:focus {
    @apply outline-none;
    @apply border-primary dark-border-primary-7;
  }
}

.comment-form__meta {
  @apply grid grid-cols-1 sm:grid-cols-3 gap-2;
}

.comment-form__input {
  @apply w-full px-3 py-2 rounded-xl;
  @apply bg-light dark-bg-dark/60;
  @apply border border-primary-2/60 dark-border-primary-4/60;
  @apply text-dark dark-text-light;
  @apply transition-colors;

  &:focus {
    @apply outline-none;
    @apply border-primary dark-border-primary-7;
  }
}

.comment-form__honeypot {
  position: absolute;
  left: -10000px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.comment-form__actions {
  @apply flex items-center justify-end gap-2;
}

.comment-form__error {
  @apply mr-auto text-sm text-red-600 dark-text-red-400;
}

.comment-form__btn {
  @apply inline-flex items-center gap-1 px-4 py-2 rounded-xl;
  @apply text-sm font-medium;
  @apply transition-colors;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;

  &--primary {
    @apply bg-primary text-light dark-bg-primary-7;
    @apply hover:bg-primary-7 dark-hover-bg-primary-8;
  }

  &--ghost {
    @apply text-primary-text dark-text-primary-7;
    @apply hover:bg-primary-2/40 dark-hover-bg-primary-4/40;
  }
}
</style>

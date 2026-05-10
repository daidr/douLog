/**
 * 把 story-verse 返回的 ISO 8601 时间戳格式化为博客可读的发布日期。
 *
 * 之所以**固定** locale 与 timezone：
 *   - douLog 的 i18n 在 SSR 阶段用 `defaultLocale: 'en-US'`，client 端
 *     `setup-i18n.ts` plugin 会在挂载时按 localStorage 切到用户偏好（多
 *     为 zh-CN）；如果走 reactive locale 的格式化（`useFormattedDateTime`），
 *     server 渲染出的字符串会被 client hydration 改写，触发 Vue
 *     "Hydration text mismatch" 警告。
 *   - 时区固定 Asia/Shanghai 是因为博主在国内、文章发布按本地日历理解
 *     最贴近预期；同时也避免了 server / client 时区差导致的同一篇文章在
 *     SSR 与 client 阶段呈现日期偏差一天的边缘情况。
 *
 * 输出形如 `2024年2月9日`，i18n 切换不会改变它——日期对于"博客发布日"
 * 这个语义是稳定事实，不需要随界面语言变化。
 */
const PUBLISHED_DATE_FORMATTER = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Shanghai',
})

export function formatPublishedDate(iso: string | undefined | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return PUBLISHED_DATE_FORMATTER.format(date)
}

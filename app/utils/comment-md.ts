import MarkdownIt from 'markdown-it'

/**
 * 与 `server/utils/markdown.ts` 里的 `fillEmptyLinkText` 行为保持一致：
 * `[](url)` 这种空 label 的 link 自动用 href 作为显示文本。
 *
 * 两份代码很短，未抽到共享 plugin 文件——server/ 与 app/ 在 Nuxt 里走不同
 * 打包链路，跨边界共享一个 plugin 反而增加链接成本，不如各持一份。
 */
function fillEmptyLinkText(md: MarkdownIt) {
  md.core.ruler.after('inline', 'fill_empty_link_text', (state) => {
    for (const blockToken of state.tokens) {
      if (blockToken.type !== 'inline' || !blockToken.children) continue
      const children = blockToken.children
      for (let i = 0; i < children.length; i++) {
        const tok = children[i]
        if (!tok || tok.type !== 'link_open') continue
        const next = children[i + 1]
        if (!next || next.type !== 'link_close') continue
        const href = tok.attrGet('href') || ''
        if (!href) continue
        const textToken = new state.Token('text', '', 0)
        textToken.content = href
        children.splice(i + 1, 0, textToken)
        i++
      }
    }
    return false
  })
}

/**
 * 评论的"有限子集"markdown 渲染器。
 *
 * 设计取舍：
 * - 用 `'zero'` 预设把所有 rule 默认关掉，再 enable 一组明确白名单：
 *   只支持链接、加粗 / 斜体、删除线、行内代码 + 必要的 text/escape/newline。
 *   不开 heading / list / blockquote / fence / table / image / html_inline / html_block
 *   等容易污染评论排版或被滥用的规则。
 * - `html: false`：原始 HTML 字符全部 escape，杜绝 v-html 注入风险。
 * - `linkify: true`：裸 URL 自动变 `<a>`，与 markdown 显式 link 一并享受
 *   `target=_blank` 处理。
 * - `breaks: true`：评论里的换行直接 `<br>`，避免用户期望换行却看到一整段。
 *
 * 调用方用 `md.renderInline()` 而非 `render()` —— 不要 `<p>` 包装，让评论
 * 内容作为 inline 文本流嵌入到外部容器中（外部还会在前面拼一个"回复 @xxx"
 * 前缀 span）。
 */
const md = new MarkdownIt('zero', {
  html: false,
  linkify: true,
  breaks: true,
})
  .enable([
    // inline 元素白名单：emphasis 同时覆盖 ** ** 和 * *；strikethrough 是 ~~ ~~
    'emphasis',
    'strikethrough',
    'backticks',
    'link',
    'autolink',
    // 解析支撑：把字符流变 token，处理转义、换行、HTML 实体
    'text',
    'escape',
    'newline',
    'entity',
    // core 阶段：linkify 把裸 URL 升级成 link token
    'linkify',
    // 把 inline parser 接到 core pipeline 上；不开 inline 的话什么都不渲染
    'inline',
    // 预归一化（CRLF → LF 等）
    'normalize',
  ])

fillEmptyLinkText(md)

// 让所有 link 加 target=_blank + 安全 rel
const defaultLinkOpen = md.renderer.rules.link_open
  ?? ((tokens, idx, opts, _env, self) => self.renderToken(tokens, idx, opts))

md.renderer.rules.link_open = function linkOpen(tokens, idx, opts, env, self) {
  const token = tokens[idx]
  token.attrSet('target', '_blank')
  // noopener: 防 window.opener 钓鱼；noreferrer: 不泄露原页面；nofollow: 不
  // 给评论里贴的链接传递 SEO 权重（防 spam）
  token.attrSet('rel', 'noopener noreferrer nofollow')
  return defaultLinkOpen(tokens, idx, opts, env, self)
}

export function renderCommentMarkdown(content: string): string {
  return md.renderInline(content || '')
}

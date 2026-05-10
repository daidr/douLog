import MarkdownIt from 'markdown-it'
import mdContainer from 'markdown-it-container'

export interface RenderOptions {
  /**
   * story-verse 后端 base URL。markdown 里出现的 `/api/...` 形态相对路径
   * （主要是 `/api/media/raw/...`）会被改写为 `apiEntry + 路径`，让浏览器
   * 能直接命中后端公开端点。
   */
  apiEntry: string
}

/**
 * 创建一个绑定了具体 apiEntry 的 markdown-it 实例。
 *
 * 选项：
 *   - `html: true`：保留作者在 markdown 里手写的 HTML 片段（如 <video>、<iframe>），
 *     这是 douLog 既有内容（旧 WP HTML 已用 hast 渲染）保持等价能力的关键。
 *   - `linkify: true`：让裸链接自动变成 <a>。
 *   - `breaks: false`：单换行不视为 <br>，行为与 GFM 默认一致。
 *
 * 自定义扩展：
 *   - `:::gallery ... :::` 容器：将一组 markdown 图片打包成一个轮播容器；
 *     在 hast 阶段由前端 `PartGallery` 组件接管渲染。
 *   - 图片 src 的 `/api/` 前缀会被补全为绝对 URL，让浏览器直接找到 SV 后端。
 */
function createRenderer(options: RenderOptions): MarkdownIt {
  const apiEntry = options.apiEntry.replace(/\/+$/, '')

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: false,
  })

  // ::: gallery ::: 容器 → 一个带类名的 div，由前端识别后渲染为轮播图。
  // 不在 markdown-it 这层做"提取图片列表"的工作，因为容器内还可能含有
  // markdown 段落 / 链接 / emoji 等，让 hast 端按节点结构去取更稳。
  md.use(mdContainer, 'gallery', {
    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        return '<div class="custom-block custom-block-gallery">\n'
      }
      return '</div>\n'
    },
  })

  // ::: github ::: 容器 → 让前端 PartGithubCard 接管。容器内通常是一行
  // GitHub 仓库 URL（被 linkify 自动转成 <a>），hast 端从 anchor href
  // 提取 owner/repo 调 `/api/github/:owner/:repo` 拉数据。
  md.use(mdContainer, 'github', {
    render(tokens, idx) {
      if (tokens[idx].nesting === 1) {
        return '<div class="custom-block custom-block-github">\n'
      }
      return '</div>\n'
    },
  })

  // 重写 image renderer：把 `/api/` 开头的相对路径变绝对路径。其他 src
  // （含完整的 http/https URL、自定义 CDN）原样保留。
  const defaultImageRender = md.renderer.rules.image
  md.renderer.rules.image = (tokens, idx, opts, env, self) => {
    const token = tokens[idx]
    const srcIndex = token.attrIndex('src')
    if (srcIndex >= 0) {
      const src = token.attrs![srcIndex][1]
      if (src.startsWith('/api/')) {
        token.attrs![srcIndex][1] = `${apiEntry}${src}`
      }
    }
    return defaultImageRender
      ? defaultImageRender(tokens, idx, opts, env, self)
      : self.renderToken(tokens, idx, opts)
  }

  return md
}

export function renderMarkdown(content: string, options: RenderOptions): string {
  const md = createRenderer(options)
  return md.render(content)
}

import type { IGithubRepoInfo } from '~~/server/api/github/[author]/[repo]'

const GITHUB_ICON =
  '<svg viewBox="0 0 48 48" width="1.2em" height="1.2em"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4" d="M29.344 30.477c2.404-.5 4.585-1.366 6.28-2.638C38.52 25.668 40 22.314 40 19c0-2.324-.881-4.494-2.407-6.332c-.85-1.024 1.636-8.667-.573-7.638c-2.21 1.03-5.45 3.308-7.147 2.805A20.712 20.712 0 0 0 24 7c-1.8 0-3.532.223-5.147.634C16.505 8.232 14.259 6 12 5.03c-2.26-.97-1.026 6.934-1.697 7.765C8.84 14.605 8 16.73 8 19c0 3.314 1.79 6.668 4.686 8.84c1.93 1.446 4.348 2.368 7.054 2.822m0 0c-1.159 1.275-1.738 2.486-1.738 3.632v8.717m11.343-12.534c1.097 1.44 1.646 2.734 1.646 3.88v8.654M6 31.215c.899.11 1.566.524 2 1.24c.652 1.075 3.074 5.063 5.825 5.063h4.177"></path></svg>'
const STAR_ICON = `<svg width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="currentColor" d="M22 9.67a1 1 0 0 0-.86-.67l-5.69-.83L12.9 3a1 1 0 0 0-1.8 0L8.55 8.16L2.86 9a1 1 0 0 0-.81.68a1 1 0 0 0 .25 1l4.13 4l-1 5.68a1 1 0 0 0 .4 1a1 1 0 0 0 1.05.07L12 18.76l5.1 2.68a.93.93 0 0 0 .46.12a1 1 0 0 0 .59-.19a1 1 0 0 0 .4-1l-1-5.68l4.13-4A1 1 0 0 0 22 9.67Zm-6.15 4a1 1 0 0 0-.29.89l.72 4.19l-3.76-2a1 1 0 0 0-.94 0l-3.76 2l.72-4.19a1 1 0 0 0-.29-.89l-3-3l4.21-.61a1 1 0 0 0 .76-.55L12 5.7l1.88 3.82a1 1 0 0 0 .76.55l4.21.61Z"/></svg>`
const FORK_ICON = `<svg width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="currentColor" d="M17 6.06a3 3 0 0 0-1.15 5.77A2 2 0 0 1 14 13.06h-4a3.91 3.91 0 0 0-2 .56V7.88a3 3 0 1 0-2 0v8.36a3 3 0 1 0 2.16.05A2 2 0 0 1 10 15.06h4a4 4 0 0 0 3.91-3.16A3 3 0 0 0 17 6.06Zm-10-2a1 1 0 1 1-1 1a1 1 0 0 1 1-1Zm0 16a1 1 0 1 1 1-1a1 1 0 0 1-1 1Zm10-10a1 1 0 1 1 1-1a1 1 0 0 1-1 1Z"/></svg>`
const LINK_ICON = `<svg width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="currentColor" d="M18 10.82a1 1 0 0 0-1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h7.18a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h11a3 3 0 0 0 3-3v-7.18a1 1 0 0 0-1-1Zm3.92-8.2a1 1 0 0 0-.54-.54A1 1 0 0 0 21 2h-6a1 1 0 0 0 0 2h3.59L8.29 14.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0L20 5.41V9a1 1 0 0 0 2 0V3a1 1 0 0 0-.08-.38Z"/></svg>`
export const initMdxGitCards = async () => {
  // 获取所有 MDx GitHub 卡片
  const cards = document.querySelectorAll('.wp-block-mdx-github')

  // 获取 author 和 repo

  for (const card of cards) {
    const author = card.getAttribute('data-mdxgithuba')
    const repo = card.getAttribute('data-mdxgithubp')

    // 将 card 的内容替换为加载动画
    card.innerHTML =
      '<div class="wp-block-mdx-github__loading"><i></i><i></i><i></i><i></i></div>'

    // 获取 GitHub API 数据
    try {
      const result = (await fetch(`/api/github/${author}/${repo}`).then(res =>
        res.json()
      )) as IGithubRepoInfo

      card.classList.add('wp-block-mdx-github--loaded')
      card.innerHTML = getCardContent(result)
    } catch (e) {
      card.classList.add('wp-block-mdx-github--error')
      card.innerHTML = `<div class="wp-block-mdx-github__error">仓库获取失败</div>`
    }
  }
}

function getCardContent(result: IGithubRepoInfo) {
  let content = `<div class="wp-block-mdx-github__badge">${GITHUB_ICON} GitHub</div>`

  content += `<div class="wp-block-mdx-github__path">`
  content += `<p><a rel="noopener noreferrer" target="_blank" href="${result.owner.url}">${result.owner.login}</a>/`
  content += `<a rel="noopener noreferrer" target="_blank" href="${result.link}">${result.name}</a></p>`
  content += `</div>`

  if (result.description) {
    content += `<div class="wp-block-mdx-github__description">${result.description}</div>`
  }

  if (result.homepage) {
    content += `<div class="wp-block-mdx-github__homepage"><a rel="noopener noreferrer" target="_blank" href="${result.homepage}">${result.homepage}</a></div>`
  }

  content += `<div class="wp-block-mdx-github__stats">`
  content += `<div class="wp-block-mdx-github__stats__item">${STAR_ICON} ${result.stars}</div>`
  content += `<div class="wp-block-mdx-github__stats__item">${FORK_ICON} ${result.forks}</div>`
  content += `</div>`

  content += `<div class="wp-block-mdx-github__link"><a rel="noopener noreferrer" target="_blank" href="${result.link}">${LINK_ICON}</a></div>`
  return content
}

import type { IFriendItem } from '~~/types/feed'
import type { SvFriendLink } from '../utils/sv'

const { apiEntry } = useRuntimeConfig()

/**
 * Gravatar 头像 URL —— story-verse 已把 email 替换成 sha256 hash 下发；emailHash
 * 为 null（友链未填邮箱）时给空 hash，cravatar 的 `d=mp` 会兜底为 mystery person。
 */
function buildAvatarUrl(emailHash: string | null): string {
  return `https://cravatar.cn/avatar/${emailHash ?? ''}?d=mp&s=160`
}

function mapFriend(item: SvFriendLink): IFriendItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    url: item.url,
    avatarUrl: buildAvatarUrl(item.emailHash),
  }
}

/**
 * 友链列表 —— 代理 story-verse `/api/friend-links`，公开端点已是 all-at-once
 * 全量数组，按 id 升序；本层只做字段裁剪与 gravatar URL 拼接。SWR 60s 与
 * 其它公开列表保持一致。
 */
export default cachedEventHandler(
  async () => {
    const result = await $fetch<SvFriendLink[]>('/api/friend-links', {
      baseURL: apiEntry,
    })
    return result.map(mapFriend)
  },
  {
    swr: true,
    maxAge: 60,
  },
)

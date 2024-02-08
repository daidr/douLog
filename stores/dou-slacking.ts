// It's a client side store
import { defineStore } from 'pinia'

export const DOU_SLACKING_ENTRY = 'https://dou-slacking.daidr.me/status'

enum IconType {
  rect = 'rect',
  circle = 'circle',
  point = 'point',
}

interface statsData {
  idle: boolean
  update: number
  text: string
  icon?: string
  iconType: IconType
  media_playing: boolean
  media_curr: string
  media_total: string
}

interface mediaInfo {
  thumbnail: string
  title: string
  artist: string
}

export const useDouSlackingStore = defineStore('dou-slacking', () => {
  const connected = ref(false)
  const connectionCount = ref(0)
  const stats = reactive<statsData>({
    idle: true,
    update: 0,
    text: '',
    icon: '',
    iconType: IconType.point,
    media_playing: false,
    media_curr: '-',
    media_total: '-',
  })
  const mediaInfo = reactive<mediaInfo>({
    thumbnail: '',
    title: '',
    artist: '',
  })

  if ('EventSource' in window) {
    let source: EventSource

    const connect = () => {
      source = new EventSource(DOU_SLACKING_ENTRY)

      source.onopen = () => {
        connected.value = true
      }

      source.onerror = () => {
        connected.value = false
      }
      source.addEventListener('count', ({ data }) => {
        connectionCount.value = Number.parseInt(data)
      })
      source.addEventListener('media', ({ data }) => {
        const payload = JSON.parse(data)
        mediaInfo.thumbnail = payload.thumbnail
        mediaInfo.title = payload.title
        mediaInfo.artist = payload.artist
      })
      source.addEventListener('media-stats', ({ data }) => {
        const payload = JSON.parse(data)
        stats.media_playing = payload.media_playing
        stats.media_curr = payload.media_curr
        stats.media_total = payload.media_total
      })
      source.addEventListener('stats', ({ data }) => {
        const payload = JSON.parse(data)
        stats.idle = payload.idle
        stats.update = payload.update
        stats.text = payload.text
        stats.icon = payload.icon
        stats.iconType = payload.iconType
      })
    }

    connect()
  }

  return {
    connected,
    connectionCount,
    stats,
    mediaInfo,
  }
})

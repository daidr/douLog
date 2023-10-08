// It's a client side store
import { defineStore } from 'pinia'

const MAX_RETRY_COUNT = 100
export const DOU_SLACKING_ENTRY = 'wss://dou-slacking.daidr.me/ws'

enum IconType {
  rect = 'rect',
  circle = 'circle',
  point = 'point',
}

type statsData = {
  idle: boolean
  update: number
  text: string
  icon?: string
  iconType: IconType
  media_playing: boolean
  media_curr: string
  media_total: string
}

type mediaInfo = {
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

  if ('WebSocket' in window) {
    let ws: WebSocket
    let interval: NodeJS.Timeout

    const connect = () => {
      if (interval) {
        clearInterval(interval)
      }

      ws = new WebSocket(DOU_SLACKING_ENTRY)

      ws!.onopen = () => {
        connected.value = true
      }

      ws!.onclose = () => {
        connected.value = false
        connectionCount.value += 1
        if (connectionCount.value < MAX_RETRY_COUNT) {
          setTimeout(() => {
            connect()
          }, 3000)
        }
      }

      ws!.onmessage = event => {
        processMessage(event.data)
      }

      interval = setInterval(() => {
        if (connected.value) {
          ws!.send('ping')
        }
      }, 10000)
    }

    connect()
  }

  function processMessage(message: string) {
    const data = JSON.parse(message)
    switch (data.type) {
      case 'count':
        connectionCount.value = data.payload
        break
      case 'stats':
        stats.idle = data.payload.idle
        stats.update = data.payload.update
        stats.text = data.payload.text
        stats.icon = data.payload.icon
        stats.iconType = data.payload.iconType
        stats.media_playing = data.payload.media_playing
        stats.media_curr = data.payload.media_curr
        stats.media_total = data.payload.media_total
        break
      case 'media':
        mediaInfo.thumbnail = data.payload.thumbnail
        mediaInfo.title = data.payload.title
        mediaInfo.artist = data.payload.artist
        break
    }
  }

  return {
    connected,
    connectionCount,
    stats,
    mediaInfo,
  }
})

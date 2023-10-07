// It's a client side store
import { defineStore } from 'pinia'

const MAX_RETRY_COUNT = 10
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
          }, 5000)
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
        break
    }
  }

  return {
    connected,
    connectionCount,
    stats,
  }
})

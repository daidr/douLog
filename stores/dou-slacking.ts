// It's a client side store
import { defineStore } from 'pinia'

const MAX_RETRY_COUNT = 3
const DOU_SLACKING_ENTRY = 'wss://dou-slacking.daidr.me/ws'

export const useDouSlackingStore = defineStore('dou-slacking', () => {
  const connected = ref(false)
  const connectionCount = ref(0)
  const appleStatus = ref('')
  const lastUpdate = ref(0)
  const isWindowsIdle = ref(false)
  const windowsForegroundProcess = ref('')

  if ('WebSocket' in window) {
    let ws: WebSocket

    const connect = () => {
      ws = new WebSocket(DOU_SLACKING_ENTRY)
    }

    connect()

    ws!.onopen = () => {
      connected.value = true
    }

    ws!.onclose = () => {
      connected.value = false
      connectionCount.value += 1
      if (connectionCount.value < MAX_RETRY_COUNT) {
        connect()
      }
    }

    ws!.onmessage = event => {
      processMessage(event.data)
    }
  }

  function processMessage(message: string) {
    const data = JSON.parse(message)
    switch (data.type) {
      case 'count':
        connectionCount.value = data.payload
        break
      case 'stats':
        appleStatus.value = data.payload.appleStatus
        lastUpdate.value = data.payload.lastUpdate
        isWindowsIdle.value = data.payload.isWindowsIdle
        windowsForegroundProcess.value = data.payload.windowsForegroundProcess
        break
    }
  }

  return {
    connected,
    connectionCount,
    appleStatus,
    lastUpdate,
    isWindowsIdle,
    windowsForegroundProcess,
  }
})

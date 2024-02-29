import type { BuildInfo } from '~/types'

export function useBuildInfo() {
  return useAppConfig().buildInfo as BuildInfo
}

export interface BuildInfo {
  commit: string
  shortCommit: string
  time: number
  branch: string
  env: 'preview' | 'canary' | 'dev' | 'release'
}

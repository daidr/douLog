export const replaceMediaCDN = (url: string) => {
  // cdn链接且开发环境
  if (url.includes('cdn.daidr.me') && process.env.NODE_ENV === 'development') {
    return url.replace('cdn.daidr.me', 'daidr.me')
  }
  return url
}

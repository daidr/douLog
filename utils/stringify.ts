import { JSDOM } from 'jsdom'

export const htmlToPureText = (html: string) => {
  const dom = new JSDOM(html)
  return dom.window.document.body.textContent || ''
}

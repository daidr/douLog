import { JSDOM } from 'jsdom'

export function htmlToPureText(html: string) {
  const dom = new JSDOM(html)
  return dom.window.document.body.textContent || ''
}

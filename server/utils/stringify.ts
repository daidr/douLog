import { JSDOM } from 'jsdom'
import type { Element, Root } from 'hast'
import { toString } from 'hast-util-to-string'

export function htmlToPureText(html: string) {
  const dom = new JSDOM(html)
  return dom.window.document.body.textContent || ''
}

export function hastToPureText(hast: Element) {
  return toString(hast)
}

export function hastRootToPureText(hast: Root) {
  return toString(hast)
}

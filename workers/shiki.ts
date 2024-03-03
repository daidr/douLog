import { codeToHast, hastToHtml } from 'shiki'
import {
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from '@shikijs/transformers'
import type { Element } from 'hast'

addEventListener('message', async (event) => {
  const { lang, code } = event.data
  const transformers = [
    transformerNotationDiff(),
    transformerNotationErrorLevel(),
    transformerNotationFocus(),
    transformerNotationHighlight(),
    transformerNotationWordHighlight(),
  ]

  const result = (await codeToHast(code, {
    lang,
    themes: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
    transformers,
  }))

  const preNode = result.children[0] as Element
  const codeNode = preNode.children[0] as Element

  postMessage(hastToHtml(codeNode))
})

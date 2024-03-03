import { codeToHast, hastToHtml } from 'https://esm.sh/shiki@1.1.7'
import {
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from 'https://esm.sh/@shikijs/transformers@1.1.7'
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

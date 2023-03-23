import { minify } from 'html-minifier'

export default (html: string) => {
  return minify(html, {
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true,
  })
}

import { defineConfig, presetUno, transformerDirectives, transformerVariantGroup } from 'unocss'

function withOpacityValue(variable: string) {
  return `rgba(var(${variable}), %alpha)`
}

export default defineConfig({
  presets: [
    presetUno({
      dark: 'class',
    }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      primary: {
        extralight: withOpacityValue('--color-primary-extralight'),
        light: withOpacityValue('--color-primary-light'),
        medium: withOpacityValue('--color-primary-medium'),
        DEFAULT: withOpacityValue('--color-primary'),
        dark: withOpacityValue('--color-primary-dark'),
      },
      black: withOpacityValue('--color-black'),
      white: withOpacityValue('--color-white'),
    },
  },
})

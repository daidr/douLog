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
        1: withOpacityValue('--color-primary-1'),
        2: withOpacityValue('--color-primary-2'),
        3: withOpacityValue('--color-primary-3'),
        4: withOpacityValue('--color-primary-4'),
        5: withOpacityValue('--color-primary-5'),
        6: withOpacityValue('--color-primary-6'),
        7: withOpacityValue('--color-primary-7'),
        8: withOpacityValue('--color-primary-8'),
        9: withOpacityValue('--color-primary-9'),
        10: withOpacityValue('--color-primary-10'),
        DEFAULT: withOpacityValue('--color-primary-6'),
        shadow: withOpacityValue('--color-primary-1'),
      },
      // black: withOpacityValue('--color-black'),
      // white: withOpacityValue('--color-white'),
    },
  },
})

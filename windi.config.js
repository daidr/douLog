import { defineConfig } from 'windicss/helpers'

function withOpacityValue(variable) {
  return val => {
    if (val.opacityValue === undefined) {
      return `rgb(var(${variable}))`
    }
    return `rgb(var(${variable}) / ${val.opacityValue})`
  }
}

export default defineConfig({
  theme: {
    extend: {
      colors: {
        primary: {
          extralight: withOpacityValue('--color-primary-extralight'),
          light: withOpacityValue('--color-primary-light'),
          medium: withOpacityValue('--color-primary-medium'),
          DEFAULT: withOpacityValue('--color-primary'),
        },
        gray: {
          light: withOpacityValue('--color-gray-light'),
          DEFAULT: withOpacityValue('--color-gray'),
          dark: withOpacityValue('--color-gray-dark'),
        },
        blue: withOpacityValue('--color-blue'),
        green: withOpacityValue('--color-green'),
        black: withOpacityValue('--color-black'),
        white: withOpacityValue('--color-white'),
      },
      screens: {
        xs: '360px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
})

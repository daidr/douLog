import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    // 允许单行if不换行
    // if (condition) doSomething();
    'antfu/if-newline': 'off',

    // 仅单行if允许不使用大括号
    'curly': ['error', 'multi-line'],

    // 允许使用 console.warn 和 console.error，但使用 console.log 报错
    'no-console': ['error', { allow: ['warn', 'error'] }],

    'style/brace-style': ['error', '1tbs'],

    'node/prefer-global/process': ['error', 'always'],
  },
})

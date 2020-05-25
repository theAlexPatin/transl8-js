module.exports = {
  env: {
    node: true,
    mocha: true,
  },
  extends: ['standard', 'prettier', 'prettier/standard'],
  plugins: ['standard', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'prefer-const': [
      'error',
      {
        destructuring: 'any',
        ignoreReadBeforeAssign: false,
      },
    ],
    'no-console': 'error',
  },
}

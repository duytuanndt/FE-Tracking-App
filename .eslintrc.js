module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // enables eslint-plugin-prettier + displays Prettier errors as ESLint errors
  ],
  rules: {
    'react/react-in-jsx-scope': 'off', // not needed with React 17+
    'prettier/prettier': 'warn', // or 'error' to be strict
  },
  settings: {
    react: { version: 'detect' },
  },
};

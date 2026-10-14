import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import globals from 'globals';

export default [
  js.configs.recommended,
  stylistic.configs.customize({
    semi: true,
    commaDangle: 'never',
    braceStyle: '1tbs',
    arrowParens: false,
    quoteProps: 'as-needed'
  }),
  {
    files: ['**/*.js', 'bin/xgettext-template'],
    languageOptions: {
      globals: globals.node
    },
    rules: {
      '@stylistic/arrow-parens': ['error', 'as-needed'],
      '@stylistic/space-before-function-paren': ['error', 'always']
    }
  },
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: globals.mocha
    }
  }
];

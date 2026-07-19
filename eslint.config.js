// ESLint flat config (ESLint 9+).
// SWOT Builder delivers its JavaScript as JSX files compiled in the browser by
// Babel Standalone. This config covers the *.jsx and *.js files at the repository
// root, excluding the GoatCounter analytics script.
// See docs/decisions/adr-0003.md for the window-based module pattern this project uses.

import globals from 'globals';

export default [
  {
    ignores: [
      'eslint.config.js',
      'vitest.config.js',
      'node_modules/**',
      'assets/analytics/count.js',
    ],
  },
  {
    files: ['*.jsx', '*.js'],
    ignores: ['swot-engine-core.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        React: 'readonly',
        ReactDOM: 'readonly',
        Babel: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'no-unused-vars': ['warn', { caughtErrorsIgnorePattern: '^_' }],
      'no-undef': 'warn',
      'eqeqeq': ['error', 'always', { 'null': 'ignore' }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
    },
  },
  {
    // swot-engine-core.js is loaded as a native ES module (see index.html),
    // not a Babel-compiled classic script, so it uses import/export syntax.
    files: ['swot-engine-core.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: globals.browser,
    },
    rules: {
      'no-unused-vars': ['warn', { caughtErrorsIgnorePattern: '^_' }],
      'no-undef': 'warn',
      'eqeqeq': ['error', 'always', { 'null': 'ignore' }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': ['error'],
      'no-undef': 'error',
      'eqeqeq': 'error',
    },
  },
];

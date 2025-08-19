// @ts-check

import { fixupPluginRules } from '@eslint/compat';
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import path from 'path';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default tseslint.config(
  // global ignores
  {
    ignores: [
      'node_modules/**',
      'eslint.config.js',
      'libs/*/dist/**',
      'libs/*/scripts/**',
      'packages/*/dist/**',
      'packages/*/scripts/**',
      'scripts/**',
    ],
  },

  // some defaults
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // import specific config
  {
    files: ['packages/*/src/**/*.{ts,tsx}', 'libs/*/src/**/*.{ts,tsx}'],
    plugins: { import: importPlugin },
    rules: {
      ...importPlugin.configs.recommended.rules,
      ...importPlugin.configs.typescript.rules,
      'import/no-default-export': 'warn',
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
    // settings: { 'import/resolver': { typescript: {} } },
  },

  // extra settings for scripts that we run directly with node
  {
    files: ['./scripts/**/*.js', 'esbuild.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        process: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // react specific
  {
    plugins: {
      react: reactPlugin, // remove this if you already have another config object that adds the react plugin
      'react-hooks': fixupPluginRules(reactHooks),
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactPlugin.configs.flat['jsx-runtime'].rules,
      'react/jsx-curly-brace-presence': [
        'error',
        { props: 'never', children: 'never' },
      ],
    },
    settings: {
      react: {
        version: '19',
      },
    },
  },
  reactRefresh.configs.recommended,

  // general overrides and rules for the project (TS/TSX files)
  {
    files: ['packages/*/src/**/*.{ts,tsx}', 'libs/*/src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'as' },
      ],
      '@typescript-eslint/explicit-member-accessibility': [
        'error',
        {
          accessibility: 'no-public',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': [
        'error',
        {
          ignoreParameters: true,
          ignoreProperties: true,
        },
      ],
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'arrow-body-style': ['error', 'as-needed'],
      'consistent-return': 'error',
      curly: ['error', 'multi-line'],
      'default-case': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'guard-for-in': 'error',
      'no-alert': 'error',
      'no-cond-assign': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'no-duplicate-case': 'error',
      'no-lonely-if': 'error',
      'no-restricted-syntax': [
        'error',
        {
          message: 'Avoid using require(). Use ES6 imports instead.',
          selector: "CallExpression[callee.name='require']",
        },
        {
          message:
            "Do not throw string literals or non-Error objects. Throw new Error('...') instead.",
          selector: 'ThrowStatement > Literal:not([value=/\\w+Error/])',
        },
      ],
      'no-shadow': 'error',
      'no-throw-literal': 'error',
      'no-unsafe-finally': 'error',
      'no-unused-expressions': 'off',
      'no-useless-catch': 'error',
      'no-var': 'error',
      'no-unreachable': 'error',
      'object-shorthand': 'error',
      'one-var': ['error', 'never'],
      'prefer-arrow-callback': 'error',
      'prefer-const': ['error', { destructuring: 'all' }],
      radix: 'error',
      'spaced-comment': 'error',
    },
  },

  // extra settings for scripts that we run directly with node
  {
    files: ['./scripts/**/*.js', 'esbuild.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        process: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // prettier config must be last
  prettierConfig
);

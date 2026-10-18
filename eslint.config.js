import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default defineConfig([
  { ignores: ['dist'] },
  {
    // Únicos .js que quedan: public/theme-init.js (script clásico previo al primer paint) y esta config.
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    // Sin type-aware linting: el typecheck lo hace `tsc -b`
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: { globals: globals.browser },
    settings: { react: { version: '19.3' } },
    rules: {
      'react/jsx-no-target-blank': 'off',
      'react/prop-types': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-check': false,
          minimumDescriptionLength: 10,
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: [
      'api/**/*.ts',
      'vite.config.ts',
      'seo-html*.ts',
    ],
    languageOptions: { globals: globals.node },
  },
])

import js from '@eslint/js'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({ baseDirectory: import.meta.dirname })

export default defineConfig([
  globalIgnores(['dist', '.next']),
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]|^motion$' }],
    },
  },
])

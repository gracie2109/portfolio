import js from '@eslint/js'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({ baseDirectory: import.meta.dirname })

export default defineConfig([
  globalIgnores(['dist', '.next', 'next-env.d.ts', 'supabase', '.gitnexus']),
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // Base (non-TS-aware) no-unused-vars misreads TS-only constructs
    // (interface method params, type aliases) as unused bindings —
    // scope it to plain JS/JSX only; next/typescript's own
    // @typescript-eslint/no-unused-vars already covers .ts/.tsx.
    files: ['**/*.{js,jsx}'],
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

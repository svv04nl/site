import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier'

// Formatting is Prettier's job (task fix / task check); eslint-config-prettier switches off the
// ESLint rules that would fight it. `curly` comes after it on purpose: braces around every
// if/else/for/while body. That is not formatting, and it is compatible with Prettier.
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    rules: {
      curly: ['error', 'all'],
      // New React Compiler rules in eslint-config-next 16. Existing components still break
      // them (setState in effects, refs read during render); warnings until they are rewritten.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    ignores: [
      '.claude/',
      '.playwright-mcp/',
      'test-results/',
      'playwright-report/',
      'public/',
      '.next/',
      '.open-next/',
      '.wrangler/',
      'src/payload-types.ts',
      'src/app/(payload)/admin/importMap.js',
      'src/migrations/',
      'cloudflare-env.d.ts',
      'next-env.d.ts',
    ],
  },
]

export default eslintConfig

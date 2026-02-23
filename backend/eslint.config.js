import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // Base JS rules
  js.configs.recommended,

  // TypeScript rules (no type-checked — keeps linting fast)
  ...tseslint.configs.recommended,

  // Disable ESLint rules that conflict with Prettier
  prettier,

  // Project-wide overrides
  {
    rules: {
      // Warn on any, but don't block — Drizzle internals use it
      '@typescript-eslint/no-explicit-any': 'warn',

      // Unused vars: error, but allow underscore-prefixed params
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Allow empty catch blocks (e.g. catch {})
      'no-empty': ['error', { allowEmptyCatch: false }],

      // console is fine in a backend
      'no-console': 'off',

      // Allow non-null assertions — used deliberately in services
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // Ignore generated / build output
  {
    ignores: ['dist/**', 'node_modules/**', 'drizzle/**'],
  }
);

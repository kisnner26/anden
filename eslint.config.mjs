import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/.expo/**',
      '**/android/**',
      '**/ios/**',
      '**/coverage/**',
      '**/dist/**',
      '**/targets/**/expo-target.config.js',
      'apps/compartir/config.ejemplo.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['apps/movil/jest.config.cjs', 'apps/movil/jest.setup.js'],
    languageOptions: {
      globals: {
        jest: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['apps/entrenador/publico/**/*.js'],
    languageOptions: {
      globals: {
        EventSource: 'readonly',
        FormData: 'readonly',
        IntersectionObserver: 'readonly',
        URLSearchParams: 'readonly',
        clearTimeout: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        getComputedStyle: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        window: 'readonly',
      },
    },
  },
  {
    files: ['apps/alexa/**/*.mjs'],
    languageOptions: {
      globals: {
        AbortSignal: 'readonly',
        fetch: 'readonly',
        process: 'readonly',
      },
    },
  },
);

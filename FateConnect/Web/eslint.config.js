import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactPlugin.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  // A aplicação fala com a UI por uma porta só: o barrel do design system.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/design-system/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@mui/*'],
              message:
                'Importe pelo barrel: `@design-system`. Se o componente ainda não é exportado, adicione-o ao barrel.',
            },
            {
              group: ['@design-system/*'],
              message: 'Importe do barrel `@design-system`, nunca de um caminho interno dele.',
            },
            {
              group: ['@emotion/*'],
              message: 'Use `styled`, `css` e `keyframes` do barrel `@design-system`.',
            },
          ],
          paths: [
            {
              name: '@design-system',
              importNames: ['colorTokens', 'colorVariants', 'darkColorTokens'],
              message:
                'Token de cor alimenta a paleta; componente lê `theme.palette`. Se falta um slot, declare-o na paleta.',
            },
            {
              name: '@testing-library/react',
              message:
                'Use o render de `@app/test/testing-library`, que já monta os providers da aplicação.',
            },
          ],
        },
      ],
    },
  },

  // Dentro do design system o MUI é a fronteira, e o tema pode ler os tokens.
  {
    files: ['src/design-system/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@testing-library/react',
              message: 'Use o render de `@app/test/testing-library`.',
            },
          ],
        },
      ],
    },
  },

  // O próprio test-utils e os testes de contexto precisam da biblioteca crua.
  {
    files: ['src/test/**', 'src/**/*.test.{ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },

  prettierRecommended,
);

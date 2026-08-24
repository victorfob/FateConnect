import js from '@eslint/js';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import perfectionist from 'eslint-plugin-perfectionist';
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
      // Informação de tipo: é o que permite ao lint enxergar `@deprecated`.
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      perfectionist,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactPlugin.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      // API marcada como obsoleta não entra: quando ela sair, o build quebra.
      '@typescript-eslint/no-deprecated': 'error',
      // Nenhum console solto no código: sobra de depuração vaza para produção.
      'no-console': 'error',
      // A ordem dos imports é aplicada, não combinada — `yarn lint:fix` arruma.
      // React no alto, o resto dos pacotes logo abaixo sem linha em branco,
      // depois os aliases internos e por fim os relativos. `import type` fica
      // no grupo do próprio módulo, ao lado do import de valor que o acompanha.
      'perfectionist/sort-imports': [
        'error',
        {
          newlinesBetween: 1,
          internalPattern: ['^@app/', '^@design-system$', '^@design-system/', '^@src-ds/'],
          customGroups: [
            {
              groupName: 'react',
              anyOf: [
                { elementNamePattern: '^react$' },
                { elementNamePattern: '^react-dom(/.+)?$' },
                { elementNamePattern: '^react-router(/.+)?$' },
              ],
            },
            // Namespace desce para o fim do seu bloco: primeiro o que a pasta
            // exporta por nome, depois as constantes e por último o estilo.
            {
              groupName: 'parent-constants',
              modifiers: ['wildcard'],
              selector: 'parent',
              elementNamePattern: 'constants$',
            },
            {
              groupName: 'parent-styles',
              modifiers: ['wildcard'],
              selector: 'parent',
              elementNamePattern: 'styles$',
            },
            {
              groupName: 'sibling-constants',
              modifiers: ['wildcard'],
              selector: 'sibling',
              elementNamePattern: 'constants$',
            },
            {
              groupName: 'sibling-styles',
              modifiers: ['wildcard'],
              selector: 'sibling',
              elementNamePattern: 'styles$',
            },
          ],
          groups: [
            'react',
            { newlinesBetween: 0 },
            ['builtin', 'external'],
            { newlinesBetween: 1 },
            'internal',
            { newlinesBetween: 1 },
            'parent',
            { newlinesBetween: 0 },
            'parent-constants',
            { newlinesBetween: 0 },
            'parent-styles',
            { newlinesBetween: 0 },
            'sibling',
            { newlinesBetween: 0 },
            'sibling-constants',
            { newlinesBetween: 0 },
            'sibling-styles',
            { newlinesBetween: 0 },
            'index',
          ],
        },
      ],
      'perfectionist/sort-named-imports': 'error',
    },
  },

  // O único console permitido: o relator de erro global, que existe justamente
  // para o que escapa do React não desaparecer sem rastro. O teste dele entra na
  // exceção porque precisa afirmar a chamada que verifica.
  {
    files: ['src/utils/reportUncaughtErrors.ts', 'src/utils/reportUncaughtErrors.test.ts'],
    rules: { 'no-console': 'off' },
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
              // `@design-system/icons` é o segundo barrel público; o resto continua interno.
              group: ['@design-system/*', '!@design-system/icons'],
              message:
                'Importe do barrel `@design-system` (ou `@design-system/icons`), nunca de um caminho interno dele.',
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

  // Convenções de estilo aplicadas, não apenas documentadas.
  // Testes ficam de fora: eles precisam citar as APIs que o código de produção evita.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
    rules: {
      'react-hooks/exhaustive-deps': 'error',
      // Número solto no meio do código não diz o que mede. Vira constante nomeada.
      // Tokens e tabelas de dados ficam de fora: são objetos (`detectObjects: false`).
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [0, 1, -1],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
          enforceConst: true,
          detectObjects: false,
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='sx']",
          message:
            'Sem `sx` inline. Declare o estilo em `styles.ts` com `styled(...)` e use `<S.Componente>`.',
        },
        {
          selector: "CallExpression[callee.object.name='theme'][callee.property.name='spacing']",
          message:
            'Use o helper `spacing()` do design system. O `theme.spacing` é do MUI e sobrescrevê-lo encolhe os componentes dele (as gutters do Toolbar viraram 3px).',
        },
        {
          selector: "CallExpression[callee.name='styled'] > Literal:first-child",
          message:
            'Sem tag HTML crua: use `styled(Stack)` quando for flex e `styled(Box)` no resto, com a semântica na prop `component`.',
        },
      ],
    },
  },

  // Cor literal só pode existir nos tokens.
  {
    files: ['src/**/styles.ts', 'src/**/*.styles.ts', 'src/**/GlobalStyles.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
          message:
            'Sem cor literal. Leia de `theme.palette`; se falta um slot, declare-o na paleta.',
        },
        {
          selector: 'Literal[value=/^rgba?\\(/]',
          message:
            'Sem cor literal. Leia de `theme.palette`; se falta um slot, declare-o na paleta.',
        },
      ],
    },
  },

  // O design system não conhece a aplicação — é o que o mantém extraível.
  {
    files: ['src/design-system/**/*.{ts,tsx}'],
    ignores: ['src/design-system/**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@app/*'],
              message:
                'O design system não importa da aplicação. Receba o que precisa por propriedade ou slot.',
            },
          ],
        },
      ],
    },
  },

  prettierRecommended,
);

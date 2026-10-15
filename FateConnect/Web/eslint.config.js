import js from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import perfectionist from 'eslint-plugin-perfectionist';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const styleConventions = [
  {
    selector: "JSXAttribute[name.name='sx']",
    message:
      'Sem `sx` inline. Declare o estilo em `styles.ts` com `styled(...)` e use `<S.Componente>`.',
  },
  {
    selector: "CallExpression[callee.object.name='theme'][callee.property.name='spacing']",
    message:
      'Use `theme.space()` com o token de `spacingScale`. O `theme.spacing` é do MUI e sobrescrevê-lo encolhe os componentes dele (as gutters do Toolbar viraram 3px).',
  },
  {
    // Constante nomeada passa no `no-magic-numbers` e ainda assim não é o token.
    selector:
      "CallExpression[callee.object.name='theme'][callee.property.name=/^(space|radius)$/] > Literal, " +
      'CallExpression[callee.name=/^(spacing|radius)$/] > Literal',
    message:
      'Sem número cru em `theme.space()` e `theme.radius()`: use o token de `spacingScale`/`radiusScale` — inclusive `none` para zero.',
  },
  {
    selector: String.raw`Property[key.name=/^(gap|rowGap|columnGap|padding|padding[A-Z]\w*|margin|margin[A-Z]\w*)$/] > Literal[raw=/^['"]?-?[0-9]|[0-9]px/]`,
    message:
      'Espaçamento nunca é número cru nem medida em string: use `theme.space()` com o token de `spacingScale` — `none` para zero.',
  },
  {
    // O único ponto que fala `sm` é o override do `MuiMenuItem`, que desfaz um
    // `min-width` do próprio MUI, com um disable que diz o motivo.
    selector:
      "CallExpression[callee.object.property.name='breakpoints'] > Literal[value=/^(xs|sm|lg|xl)$/]",
    message:
      "Só existem duas visões: use `md` — `theme.breakpoints.down('md')` para mobile e `up('md')` para desktop. O cabeçalho usa `header`.",
  },
  {
    // Nem para altura de tela: `html, body, #root` já são 100%, e
    // `minHeight: '100%'` preenche a janela sem o problema do `100vh`.
    selector: String.raw`Literal[value=/[0-9](\.[0-9]+)?v[wh]\b/]`,
    message:
      "Sem unidade de viewport em medida: use o token de `spacingScale` por `theme.space()`, com override em `theme.breakpoints.down('md')` quando mobile e desktop diferirem.",
  },
  {
    selector: 'Literal[value=/@media[^)]*width/]',
    message: "Sem media query à mão: use `theme.breakpoints.down('md')` ou `up('md')`.",
  },
  {
    selector: "CallExpression[callee.name='styled'] > Literal:first-child",
    message:
      'Sem tag HTML crua: use `styled(Stack)` quando for flex e `styled(Box)` no resto, com a semântica na prop `component`.',
  },
  {
    // Ficam de fora as tags de texto no meio da frase, e `title`, `meta` e `link`,
    // que o React 19 leva para o `<head>`, onde não há caixa a estilizar.
    selector:
      'JSXOpeningElement > JSXIdentifier[name=/^[a-z]/]:not([name=/^(strong|em|b|i|u|s|small|sub|sup|abbr|code|kbd|mark|br|wbr|title|meta|link)$/])',
    message:
      'Sem tag HTML crua no JSX: use `styled(Stack)` quando for flex e `styled(Box)` no resto, com a semântica na prop `component`.',
  },
  {
    selector: "JSXAttribute[name.name='color'] > Literal[value=/^(error|success|info|warning)$/]",
    message:
      'A cor de ação é `secondary`. `error` fica reservado ao erro de verdade — validação de campo e mensagem —, e estado colorido vem de `palette.statusTag` ou `palette.notification`, não desta prop.',
  },
];

const literalColors = [
  {
    selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
    message: 'Sem cor literal. Leia de `theme.palette`; se falta um slot, declare-o na paleta.',
  },
  {
    selector: String.raw`Literal[value=/^rgba?\(/]`,
    message: 'Sem cor literal. Leia de `theme.palette`; se falta um slot, declare-o na paleta.',
  },
];

/**
 * O `no-restricted-imports` não soma entre blocos: o último que casa com o arquivo
 * substitui a lista, então cada escopo monta a sua inteira com estas peças.
 */
const barrelOnlyPatterns = [
  {
    group: ['@mui/*'],
    message:
      'Importe pelo barrel: `@design-system`. Se o componente ainda não é exportado, adicione-o ao barrel.',
  },
  {
    group: ['@design-system/*', '!@design-system/icons'],
    message:
      'Importe do barrel `@design-system` (ou `@design-system/icons`), nunca de um caminho interno dele.',
  },
  {
    group: ['@emotion/*'],
    message: 'Use `styled`, `css` e keyframes do barrel `@design-system`.',
  },
];

const colorTokensPath = {
  name: '@design-system',
  importNames: ['colorTokens', 'colorVariants', 'darkColorTokens'],
  message:
    'Token de cor alimenta a paleta; componente lê `theme.palette`. Se falta um slot, declare-o na paleta.',
};

const rawTestingLibraryPath = {
  name: '@testing-library/react',
  message: 'Use o render de `@app/test/testing-library`, que já monta os providers da aplicação.',
};

const themeHelpersPattern = {
  group: ['**/theme/helpers/*'],
  message:
    'Espaçamento e raio saem do tema: `theme.space()` e `theme.radius()`. O helper livre é só do `theme/`, que roda antes de o tema existir.',
};

const appFromDesignSystemPattern = {
  group: ['@app/*'],
  message:
    'O design system não importa da aplicação. Receba o que precisa por propriedade ou slot.',
};

const testFiles = ['src/test/**', 'src/**/*.test.{ts,tsx}', 'design-system/**/*.test.{ts,tsx}'];

const restrictImports = ({ patterns = [], paths = [] }) => ['error', { patterns, paths }];

export default defineConfig([
  { ignores: ['dist', 'coverage'] },
  js.configs.recommended,
  {
    files: ['public/sw.js'],
    languageOptions: { globals: globals.serviceworker },
  },
  {
    // O recomendado do `@eslint/js` 10 liga estas três, e o do 9 não. Ficam aqui
    // até o projeto subir para o ESLint 10, quando voltam a vir dele.
    rules: {
      'no-unassigned-vars': 'error',
      'no-useless-assignment': 'error',
      'preserve-caught-error': ['error', { requireCatchParameter: false }],
    },
  },
  ...tseslint.configs.recommended,
  // As regras que o Sonar aplica no PR, para o gate local reprovar antes dele.
  sonarjs.configs.recommended,
  {
    // O TODO daqui leva a issue que o resolve: é rastreio, não dívida esquecida.
    rules: { 'sonarjs/todo-tag': 'off' },
  },
  {
    // Componente React devolve `null` ou nós conforme o estado — a regra lê isso
    // como retorno inconsistente, e obedecê-la pioraria o código.
    files: ['**/*.tsx'],
    rules: { 'sonarjs/function-return-type': 'off' },
  },
  {
    // Senha de fixture não é segredo: existe para o formulário ter o que validar.
    files: ['**/*.test.{ts,tsx}'],
    rules: { 'sonarjs/no-hardcoded-passwords': 'off' },
  },
  {
    // O Sonar acusa `await` dentro de laço no código da aplicação. No teste a
    // sequência é o roteiro (cada clique espera o anterior), e o Sonar não analisa teste.
    files: ['**/*.{js,ts,tsx}'],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: { 'no-await-in-loop': 'error' },
  },
  {
    files: ['**/*.{js,ts,tsx}'],
    plugins: { unicorn },
    // Só as duas que o Sonar toma emprestadas: a recomendada do `unicorn` contraria
    // convenções daqui, como arquivo em PascalCase e `null` no contrato da API.
    rules: {
      'unicorn/prefer-code-point': 'error',
      'unicorn/prefer-string-replace-all': 'error',
    },
  },
  {
    // Também tomada pelo Sonar: sem ela, a classe vazia só aparece no PR.
    rules: { '@typescript-eslint/no-extraneous-class': 'error' },
  },
  {
    files: ['**/*.{js,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
      // A informação de tipo alimenta o `no-deprecated`; o `allowDefaultProject`
      // cobre os `.js` fora do `include` do tsconfig, que o serviço recusaria.
      parserOptions: {
        projectService: { allowDefaultProject: ['eslint.config.js', 'public/sw.js'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      'import-x': importX,
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
      '@typescript-eslint/no-deprecated': 'error',
      'no-console': 'error',
      // `@design-system` fica fora do `internalPattern` de propósito: a aplicação
      // o consome como biblioteca, e ele ordena junto dos pacotes.
      'perfectionist/sort-imports': [
        'error',
        {
          newlinesBetween: 1,
          internalPattern: ['^@app/', '^@ds-root/', '^@legal/'],
          customGroups: [
            {
              groupName: 'react',
              anyOf: [
                { elementNamePattern: '^react$' },
                { elementNamePattern: '^react-dom(/.+)?$' },
                { elementNamePattern: '^react-router(/.+)?$' },
              ],
            },
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
      'import-x/no-duplicates': ['error', { 'prefer-inline': true }],
      'perfectionist/sort-named-imports': ['error', { groups: ['value-import', 'type-import'] }],
    },
  },

  // O único console: o relator de erro global, para o que escapa do React deixar rastro.
  {
    files: ['src/utils/reportUncaughtErrors.ts', 'src/utils/reportUncaughtErrors.test.ts'],
    rules: { 'no-console': 'off' },
  },

  // Testes ficam de fora: eles precisam citar as APIs que o código de produção evita.
  {
    files: ['src/**/*.{ts,tsx}', 'design-system/**/*.{ts,tsx}'],
    ignores: testFiles,
    rules: {
      'react-hooks/exhaustive-deps': 'error',
      // Tokens e tabelas de dados são objetos, e ficam de fora pelo `detectObjects`.
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
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
      'no-restricted-syntax': ['error', ...styleConventions],
    },
  },

  {
    files: [
      'src/**/styles.ts',
      'src/**/*.styles.ts',
      'design-system/**/styles.ts',
      'design-system/**/*.styles.ts',
      'design-system/**/GlobalStyles.tsx',
    ],
    rules: {
      // ⛔ O `no-restricted-syntax` substitui a lista do bloco anterior: sem as
      // convenções aqui, elas deixariam de valer nos `styles.ts`.
      'no-restricted-syntax': ['error', ...styleConventions, ...literalColors],
    },
  },

  // Imports restritos, do escopo mais largo ao mais estreito: o último bloco que casa vence.
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports({
        patterns: [...barrelOnlyPatterns, themeHelpersPattern],
        paths: [colorTokensPath, rawTestingLibraryPath],
      }),
    },
  },
  // Dentro do design system o MUI é permitido: ele é a fronteira.
  {
    files: ['design-system/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports({
        patterns: [themeHelpersPattern, appFromDesignSystemPattern],
        paths: [rawTestingLibraryPath],
      }),
    },
  },
  // O tema pode ler os tokens e o helper livre.
  {
    files: ['design-system/theme/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': restrictImports({
        patterns: [appFromDesignSystemPattern],
        paths: [rawTestingLibraryPath],
      }),
    },
  },
  // Teste usa a biblioteca crua e cita o que a produção evita: fica só o helper do tema.
  {
    files: testFiles,
    rules: {
      'no-restricted-imports': restrictImports({ patterns: [themeHelpersPattern] }),
    },
  },
  {
    files: ['design-system/theme/**/*.test.{ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },

  prettierRecommended,
]);

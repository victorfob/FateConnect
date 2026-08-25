import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import perfectionist from 'eslint-plugin-perfectionist';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** Convenções de estilo. Valem no código de produção e também nos `styles.ts`. */
const styleConventions = [
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
    // O `no-magic-numbers` ignora 0, 1 e -1, então era por ali que o `0` cru
    // entrava no lugar do token `none`. Cobre as duas formas de chamada: a do
    // tema e o helper livre do `theme/`, que foi por onde dois escaparam.
    selector:
      "CallExpression[callee.object.name='theme'][callee.property.name=/^(space|radius)$/] > Literal, " +
      'CallExpression[callee.name=/^(spacing|radius)$/] > Literal',
    message:
      'Sem número cru em `theme.space()` e `theme.radius()`: use o token de `spacingScale`/`radiusScale` — inclusive `none` para zero.',
  },
  {
    // `padding: 0` e `margin: 0` também são espaçamento: viram o token `none`.
    // O `no-magic-numbers` ignora 0 de propósito, então quem barra aqui é este
    // seletor.
    selector: String.raw`Property[key.name=/^(gap|rowGap|columnGap|padding|padding[A-Z]\w*|margin|margin[A-Z]\w*)$/] > Literal[raw=/^-?[0-9]/]`,
    message:
      'Espaçamento nunca é número cru: use `theme.space()` com o token de `spacingScale` — `none` para zero.',
  },
  {
    // Duas visões, um limite. `xs`, `sm`, `lg` e `xl` seguem nos valores do MUI
    // e não são do produto. A regra vale em todo lugar: o único ponto que
    // precisa falar `sm` é o override do `MuiMenuItem`, que desfaz um
    // `min-width:600px` do próprio MUI, e ali há um disable com o motivo.
    selector:
      "CallExpression[callee.object.property.name='breakpoints'] > Literal[value=/^(xs|sm|lg|xl)$/]",
    message:
      "Só existem duas visões: use `md` — `theme.breakpoints.down('md')` para mobile e `up('md')` para desktop.",
  },
  {
    // Unidade de viewport em medida é goteira fluida disfarçada: ela reaparecia
    // escondida numa constante nomeada, longe da propriedade que a usava.
    // Nem para altura de tela: `html, body, #root` já são 100%, então
    // `minHeight: '100%'` preenche a janela sem unidade de viewport — e sem o
    // problema do `100vh` com a barra do navegador no celular.
    selector: String.raw`Literal[value=/[0-9](\.[0-9]+)?v[wh]\b/]`,
    message:
      "Sem unidade de viewport em medida: use o token de `spacingScale` por `theme.space()`, com override em `theme.breakpoints.down('md')` quando mobile e desktop diferirem.",
  },
  {
    // Consulta de largura escrita à mão volta a criar limite paralelo, que foi
    // o que produziu a contradição de 768px entre o cabeçalho e o cadastro.
    selector: 'Literal[value=/@media[^)]*width/]',
    message: "Sem media query à mão: use `theme.breakpoints.down('md')` ou `up('md')`.",
  },
  {
    selector: "CallExpression[callee.name='styled'] > Literal:first-child",
    message:
      'Sem tag HTML crua: use `styled(Stack)` quando for flex e `styled(Box)` no resto, com a semântica na prop `component`.',
  },
];

/** Cor literal só pode existir nos tokens. */
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

export default defineConfig([
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
      // API marcada como obsoleta não entra: quando ela sair, o build quebra.
      '@typescript-eslint/no-deprecated': 'error',
      // Nenhum console solto no código: sobra de depuração vaza para produção.
      'no-console': 'error',
      // A ordem dos imports é aplicada, não combinada — `yarn lint:fix` arruma.
      // React no alto, o resto dos pacotes logo abaixo sem linha em branco,
      // depois os aliases internos e por fim os relativos. `import type` fica
      // no grupo do próprio módulo, ao lado do import de valor que o acompanha.
      //
      // `@design-system` fica fora do padrão interno de propósito: o design
      // system mora fora de `src` e a aplicação o consome como biblioteca, então
      // ele ordena junto dos pacotes. Devolvê-lo aqui o joga para o bloco dos
      // aliases da aplicação.
      'perfectionist/sort-imports': [
        'error',
        {
          newlinesBetween: 1,
          internalPattern: ['^@app/', '^@ds-root/'],
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
      // Um import por módulo: o tipo entra com o modificador inline no import de
      // valor que já existe, em vez de abrir uma segunda declaração.
      'import-x/no-duplicates': ['error', { 'prefer-inline': true }],
      // Dentro das chaves, os valores primeiro e os tipos no fim.
      'perfectionist/sort-named-imports': ['error', { groups: ['value-import', 'type-import'] }],
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
    files: ['design-system/**/*.{ts,tsx}'],
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
    files: ['src/test/**', 'src/**/*.test.{ts,tsx}', 'design-system/**/*.test.{ts,tsx}'],
    rules: { 'no-restricted-imports': 'off' },
  },

  // Convenções de estilo aplicadas, não apenas documentadas.
  // Testes ficam de fora: eles precisam citar as APIs que o código de produção evita.
  {
    files: ['src/**/*.{ts,tsx}', 'design-system/**/*.{ts,tsx}'],
    ignores: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'design-system/**/*.test.{ts,tsx}'],
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
      'no-restricted-syntax': ['error', ...styleConventions],
    },
  },

  // O helper livre de espaçamento existe só para o tema, que é construído antes
  // de o tema existir. Todo o resto lê `theme.space()` e `theme.radius()`.
  {
    files: ['design-system/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
    ignores: ['design-system/theme/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/theme/helpers/*'],
              message:
                'Espaçamento e raio saem do tema: `theme.space()` e `theme.radius()`. O helper livre é só do `theme/`, que roda antes de o tema existir.',
            },
          ],
        },
      ],
    },
  },

  // Cor literal só pode existir nos tokens.
  {
    files: [
      'src/**/styles.ts',
      'src/**/*.styles.ts',
      'design-system/**/styles.ts',
      'design-system/**/*.styles.ts',
      'design-system/**/GlobalStyles.tsx',
    ],
    rules: {
      // ⛔ Somar, não substituir. `no-restricted-syntax` sobrescreve a lista
      // inteira, e sem os seletores de convenção aqui eles deixavam de valer
      // justamente nos `styles.ts` — o único lugar onde `styled(` é escrito.
      'no-restricted-syntax': ['error', ...styleConventions, ...literalColors],
    },
  },

  // O design system não conhece a aplicação — é o que o mantém extraível.
  {
    files: ['design-system/**/*.{ts,tsx}'],
    ignores: ['design-system/**/*.test.{ts,tsx}'],
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
]);

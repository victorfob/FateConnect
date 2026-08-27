import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * O upload de source map acontece **dentro** do build, não num passo depois
 * dele: mapa que não veio do bundle publicado tem outro Debug ID e não
 * simboliza nada. Assim, o dia em que o deploy entrar no release.yml, ele herda
 * o upload sem mudança nenhuma aqui.
 *
 * Precisa de `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` e `SENTRY_PROJECT` no ambiente,
 * o token vindo de secret. Sem token o plugin fica desligado — é o que mantém o
 * build local e o de PR sem tentar subir nada.
 */
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      disable: !sentryAuthToken,
      authToken: sentryAuthToken,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      telemetry: false,
      // A documentação do plugin diz que ele já reprova o build sozinho quando o
      // upload falha. Medido nesta versão: **não reprova** — com token inválido
      // o build sai `0` e publicaria um bundle sem mapa nenhum, verde. Não
      // remova por parecer redundante.
      errorHandler: (error) => {
        throw error;
      },
      // O mapa sobe para o Sentry e sai do `dist`: ninguém serve source map.
      sourcemaps: { filesToDeleteAfterUpload: ['dist/**/*.map'] },
    }),
  ],
  build: {
    // `hidden` gera o mapa sem o comentário `sourceMappingURL`, então o
    // navegador não sai atrás dele e o Sentry recebe pelo upload.
    sourcemap: 'hidden',
    rolldownOptions: {
      output: {
        // Sem isto o build sai num pedaço único, e qualquer mudança de código
        // nosso invalida o cache das bibliotecas junto. A divisão não reduz um
        // byte do total: ela separa o que muda toda semana do que muda quando
        // alguém atualiza dependência.
        //
        // A ordem importa — vence o primeiro grupo que casa —, então os
        // específicos vêm antes do `vendor`, que recolhe o resto.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules\/(react|react-dom|scheduler)\// },
            { name: 'mui-icons', test: /node_modules\/@mui\/icons-material\// },
            { name: 'mui', test: /node_modules\/@mui\// },
            { name: 'emotion', test: /node_modules\/@emotion\// },
            { name: 'sentry', test: /node_modules\/@sentry(-internal)?\// },
            { name: 'vendor', test: /node_modules\// },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@design-system': fileURLToPath(new URL('./design-system', import.meta.url)),
      // Uso interno do design system, para os arquivos fundos não subirem por `../`.
      '@ds-root': fileURLToPath(new URL('./design-system', import.meta.url)),
      '@app': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // O relatório de execução é o que o Sonar lê para saber quantos testes
    // rodaram — dado que o lcov não carrega, porque ele só fala de cobertura.
    reporters: ['default', ['vitest-sonar-reporter', { outputFile: 'coverage/sonar-report.xml' }]],
    coverage: {
      include: ['src/**/*.{ts,tsx}', 'design-system/**/*.{ts,tsx}'],
      exclude: [
        // Bootstrap: monta a árvore e não tem lógica própria a verificar.
        'src/main.tsx',
        // Infraestrutura de teste e declarações de tipo.
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
        'design-system/**/*.test.{ts,tsx}',
        'src/vite-env.d.ts',
      ],
      reporter: ['text', 'lcov'],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
});

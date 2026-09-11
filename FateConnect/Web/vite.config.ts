import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { gzipSync } from 'node:zlib';
import type { Plugin } from 'vite';
import svgr from 'vite-plugin-svgr';
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

/**
 * Espelha o `gzip_types` de `deploy/nginx/site.conf.template`. ⛔ Sem o `.html`:
 * só o índice não leva hash, e um `.gz` de uma publicação anterior apontaria
 * para pacotes que já saíram — ele o nginx comprime na hora.
 */
const PRECOMPRESSIBLE_FILE = /\.(?:css|js|json|svg)$/;

/** Espelha o `gzip_min_length` do nginx, para os dois decidirem pelo mesmo corte. */
const MIN_BYTES_TO_PRECOMPRESS = 1024;

/**
 * Escreve um `.gz` ao lado de cada estático, que é o que o `gzip_static` do
 * nginx serve sem gastar CPU por pedido. Nível 9 porque isto roda uma vez por
 * build, e não a cada visita.
 */
function precompressForNginx(): Plugin {
  let outputDirectory = '';

  return {
    name: 'fateconnect:precompress-for-nginx',
    apply: 'build',
    configResolved(config) {
      outputDirectory = resolve(config.root, config.build.outDir);
    },
    // `closeBundle` e não `writeBundle`: o que o build copia de `public/` não
    // passa pelo bundle, e é ali que moram o ícone e os documentos legais.
    closeBundle() {
      for (const entry of readdirSync(outputDirectory, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile()) continue;
        if (!PRECOMPRESSIBLE_FILE.test(entry.name)) continue;

        const path = join(entry.parentPath, entry.name);
        const raw = readFileSync(path);
        if (raw.byteLength < MIN_BYTES_TO_PRECOMPRESS) continue;

        // O `gzip_static` não compara tamanhos: havendo `.gz`, ele serve o `.gz`.
        const compressed = gzipSync(raw, { level: 9 });
        if (compressed.byteLength >= raw.byteLength) continue;

        writeFileSync(`${path}.gz`, compressed);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    // `import arte from './arte.svg?react'` vira componente na build, então a
    // marcação de desenho nasce no código gerado e não no nosso.
    svgr(),
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
    precompressForNginx(),
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

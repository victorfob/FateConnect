import { BRAND_FONT_NAME } from '../tokens';
import boldFontUrl from './fateconnect-heros-bold.woff2';
import regularFontUrl from './fateconnect-heros-regular.woff2';

const REGULAR_WEIGHT = 400;
const BOLD_WEIGHT = 700;

const FONT_FILE_BY_WEIGHT: ReadonlyMap<number, string> = new Map([
  [REGULAR_WEIGHT, regularFontUrl],
  [BOLD_WEIGHT, boldFontUrl],
]);

/** Os pesos que a fonte enviada tem; pedir outro faz o navegador arredondar. */
export const SHIPPED_FONT_WEIGHTS: ReadonlySet<number> = new Set(FONT_FILE_BY_WEIGHT.keys());

function fontFace(weight: number, url: string): string {
  return `@font-face { font-family: '${BRAND_FONT_NAME}'; font-style: normal; font-weight: ${weight}; font-display: swap; src: url('${url}') format('woff2'); }`;
}

/** Com `swap`, o texto sai na fonte do sistema até a da marca chegar, em vez de ficar em branco. */
export const fontFaces = [...FONT_FILE_BY_WEIGHT]
  .map(([weight, url]) => fontFace(weight, url))
  .join('\n');

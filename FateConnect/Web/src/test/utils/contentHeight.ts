const VISIBLE_HEIGHT = 48;
const OVERFLOWING_HEIGHT = 200;

function forgeContentHeight(contentHeight: number) {
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => contentHeight,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => VISIBLE_HEIGHT,
  });
}

/**
 * O jsdom não faz layout: as duas alturas respondem zero, e todo texto recolhido
 * parece caber. Forjá-las é o que põe o botão de expandir na tela.
 */
export function forgeOverflow() {
  forgeContentHeight(OVERFLOWING_HEIGHT);
}

export function forgeFit() {
  forgeContentHeight(VISIBLE_HEIGHT);
}

/** As alturas forjadas ficam no protótipo: sem isto, o caso seguinte vê todo texto transbordar. */
export function restoreContentHeight() {
  Reflect.deleteProperty(HTMLElement.prototype, 'scrollHeight');
  Reflect.deleteProperty(HTMLElement.prototype, 'clientHeight');
}

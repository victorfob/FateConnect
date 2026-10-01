import { createAppTheme } from '@ds-root/theme';

const NARROW_MEDIA = createAppTheme().breakpoints.down('md').replace('@media', '');

function withoutSpaces(text: string): string {
  return text.replaceAll(/\s/g, '');
}

function styleRulesOf(rules: CSSRule[]): CSSStyleRule[] {
  return rules.filter((rule) => rule instanceof CSSStyleRule);
}

function allRules(): CSSRule[] {
  return Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules));
}

export function sheetRules(): CSSStyleRule[] {
  return styleRulesOf(allRules());
}

export function narrowRules(): CSSStyleRule[] {
  const narrowMedia = withoutSpaces(NARROW_MEDIA);

  return styleRulesOf(
    allRules()
      .filter((rule) => rule instanceof CSSMediaRule)
      .filter((rule) => withoutSpaces(rule.media.mediaText) === narrowMedia)
      .flatMap((rule) => Array.from(rule.cssRules)),
  );
}

/** O jsdom recusa pseudo-elemento de fabricante (`::-moz-placeholder`) que a folha do MUI escreve. */
function matchesSafely(element: Element, selector: string): boolean {
  try {
    return element.matches(selector);
  } catch {
    return false;
  }
}

/**
 * O jsdom não aplica `@media`, estado nem pseudo-elemento no `getComputedStyle`:
 * a folha que o Emotion escreveu é lida direto. Com `state` (`:hover`, `::before`),
 * valem as regras dele que, sem ele, casariam com o elemento.
 */
export function declarationsFor(
  rules: CSSStyleRule[],
  element: Element | null,
  state = '',
): string {
  if (!element) throw new Error('Não renderizou o elemento.');

  return rules
    .filter((rule) => rule.selectorText.includes(state))
    .filter((rule) => matchesSafely(element, rule.selectorText.replaceAll(state, '')))
    .map((rule) => withoutSpaces(rule.style.cssText))
    .join(';');
}

export function narrowDeclarationsFor(element: Element | null, state = ''): string {
  return declarationsFor(narrowRules(), element, state);
}

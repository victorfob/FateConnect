import Button from '@mui/material/Button';

import { render, screen } from '@app/test/testing-library';

const SAVE_LABEL = 'Salvar alterações';
const HOVER = ':hover';

/**
 * O jsdom não aplica `:hover`: a folha que o Emotion escreveu é lida direto, e
 * vale a regra de hover que, sem o estado, já casaria com o botão.
 */
function hoverBackgroundsFor(element: Element): string[] {
  return Array.from(document.styleSheets)
    .flatMap((sheet) => Array.from(sheet.cssRules))
    .filter((rule) => rule instanceof CSSStyleRule)
    .filter((rule) => rule.selectorText.includes(HOVER))
    .filter((rule) => element.matches(rule.selectorText.replaceAll(HOVER, '')))
    .map((rule) => rule.style.backgroundColor)
    .filter((background) => background !== '');
}

describe('button theme', () => {
  it('should keep the filled red under the pointer while the button is enabled', () => {
    render(
      <Button variant="contained" color="secondary">
        {SAVE_LABEL}
      </Button>,
    );

    expect(hoverBackgroundsFor(screen.getByRole('button', { name: SAVE_LABEL }))).not.toEqual([]);
  });

  it('should leave the disabled button out of the hover fill, which sticks after a tap', () => {
    render(
      <Button variant="contained" color="secondary" disabled>
        {SAVE_LABEL}
      </Button>,
    );

    expect(hoverBackgroundsFor(screen.getByRole('button', { name: SAVE_LABEL }))).toEqual([]);
  });
});

import { render } from '@app/test/testing-library';

import { BrandMarkToneEnum } from './@types';
import { BrandMark } from '.';

const ACCENT_SHAPE = '[data-shape="accent"]';
const BODY_SHAPE = '[data-shape="body"]';

const CAP_AND_ARC = 2;
const WHEEL_PARTS = 3;

const BUTTON_RED = 'rgb(207, 46, 46)';
/** O vermelho da marca sobre o cromo, no tema claro em que a suíte roda. */
const CHROME_RED = 'rgb(255, 82, 82)';
const BRAND_SLATE = 'rgb(67, 84, 92)';
/**
 * Cor que a paleta não tem. Sem ela o caso não discrimina: no tema claro a cor
 * de marca da roda **é** a cor de texto, então herdar e não herdar dão o mesmo
 * número.
 */
const SURROUNDING_COLOUR = 'rgb(1, 2, 3)';

function paintOf(selector: string): string {
  const shape = document.querySelector(selector);

  return globalThis.getComputedStyle(shape as Element).fill;
}

describe('BrandMark', () => {
  afterEach(() => {
    document.body.style.color = '';
  });

  it('should draw every shape of the mark', () => {
    render(<BrandMark tone={BrandMarkToneEnum.BRAND} />);

    expect(document.querySelectorAll(ACCENT_SHAPE)).toHaveLength(CAP_AND_ARC);
    expect(document.querySelectorAll(BODY_SHAPE)).toHaveLength(WHEEL_PARTS);
  });

  it('should keep the mark out of the accessibility tree, because the link around it is named', () => {
    render(<BrandMark tone={BrandMarkToneEnum.BRAND} />);

    expect(document.querySelector('svg')).toHaveAttribute('aria-hidden');
  });

  it('should paint the brand tone with the palette colours', () => {
    document.body.style.color = SURROUNDING_COLOUR;

    render(<BrandMark tone={BrandMarkToneEnum.BRAND} />);

    expect(paintOf(ACCENT_SHAPE)).toBe(BUTTON_RED);
    expect(paintOf(BODY_SHAPE)).toBe(BRAND_SLATE);
  });

  it('should take the surrounding colour on the wheel over the chrome, and keep the cap red', () => {
    document.body.style.color = SURROUNDING_COLOUR;

    render(<BrandMark tone={BrandMarkToneEnum.CHROME} />);

    expect(paintOf(BODY_SHAPE)).toBe(SURROUNDING_COLOUR);
    expect(paintOf(ACCENT_SHAPE)).toBe(CHROME_RED);
  });
});

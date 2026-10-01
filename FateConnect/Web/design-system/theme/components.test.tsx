import Button, { type ButtonProps } from '@mui/material/Button';

import { render, screen } from '@app/test/testing-library';
import { declarationsFor, sheetRules } from '@app/test/utils/styleSheetRules';

const SAVE_LABEL = 'Salvar alterações';
const HOVER = ':hover';
const BACKGROUND = 'background-color';
const COMPONENT_RADIUS = '0.625rem';
const BUTTON_VARIANTS: ReadonlyArray<ButtonProps['variant']> = ['contained', 'soft', 'destructive'];

function hoverDeclarationsFor(element: Element): string {
  return declarationsFor(sheetRules(), element, HOVER);
}

describe('button theme', () => {
  it('should keep the filled red under the pointer while the button is enabled', () => {
    render(
      <Button variant="contained" color="secondary">
        {SAVE_LABEL}
      </Button>,
    );

    expect(hoverDeclarationsFor(screen.getByRole('button', { name: SAVE_LABEL }))).toContain(
      BACKGROUND,
    );
  });

  it('should leave the disabled button out of the hover fill, which sticks after a tap', () => {
    render(
      <Button variant="contained" color="secondary" disabled>
        {SAVE_LABEL}
      </Button>,
    );

    expect(hoverDeclarationsFor(screen.getByRole('button', { name: SAVE_LABEL }))).not.toContain(
      BACKGROUND,
    );
  });

  it.each(BUTTON_VARIANTS)('should round the %s button with the component radius', (variant) => {
    render(<Button variant={variant}>{SAVE_LABEL}</Button>);

    expect(screen.getByRole('button', { name: SAVE_LABEL })).toHaveStyle({
      borderRadius: COMPONENT_RADIUS,
    });
  });
});

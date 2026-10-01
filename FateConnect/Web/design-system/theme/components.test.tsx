import Button, { type ButtonProps } from '@mui/material/Button';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';

import { render, screen } from '@app/test/testing-library';
import { declarationsFor, sheetRules } from '@app/test/utils/styleSheetRules';

const SAVE_LABEL = 'Salvar alterações';
const HOVER = ':hover';
const BACKGROUND = 'background-color';
const COMPONENT_RADIUS = '0.625rem';
const BUTTON_VARIANTS: ReadonlyArray<ButtonProps['variant']> = ['contained', 'soft', 'destructive'];
const EVERY_VARIANT: ReadonlyArray<ButtonProps['variant']> = [...BUTTON_VARIANTS, 'text'];
const MEDIUM_HEIGHT = '36px';
const SMALL_HEIGHT = '32px';
const LARGE_HEIGHT = '40px';
const ICON_LABEL = 'Abrir menu';
const ICON_SIZES: ReadonlyArray<[IconButtonProps['size'], string]> = [
  ['small', '32px'],
  ['medium', '36px'],
  ['large', '40px'],
];
const SMALL_LABEL_SIZE = '0.875rem';
const NO_PADDING = '0rem';

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

  it.each(EVERY_VARIANT)('should give the %s button the medium height by default', (variant) => {
    render(<Button variant={variant}>{SAVE_LABEL}</Button>);

    expect(screen.getByRole('button', { name: SAVE_LABEL })).toHaveStyle({
      minHeight: MEDIUM_HEIGHT,
      paddingTop: NO_PADDING,
      paddingBottom: NO_PADDING,
    });
  });

  it.each(EVERY_VARIANT)('should shrink the small %s button and its label', (variant) => {
    render(
      <Button variant={variant} size="small">
        {SAVE_LABEL}
      </Button>,
    );

    expect(screen.getByRole('button', { name: SAVE_LABEL })).toHaveStyle({
      minHeight: SMALL_HEIGHT,
      paddingTop: NO_PADDING,
      paddingBottom: NO_PADDING,
      fontSize: SMALL_LABEL_SIZE,
    });
  });

  it.each(EVERY_VARIANT)('should give the large %s button the large height', (variant) => {
    render(
      <Button variant={variant} size="large">
        {SAVE_LABEL}
      </Button>,
    );

    expect(screen.getByRole('button', { name: SAVE_LABEL })).toHaveStyle({
      minHeight: LARGE_HEIGHT,
      paddingTop: NO_PADDING,
      paddingBottom: NO_PADDING,
    });
  });

  it.each(ICON_SIZES)('should make the %s icon button a %s square', (size, side) => {
    render(
      <IconButton size={size} aria-label={ICON_LABEL}>
        <span />
      </IconButton>,
    );

    expect(screen.getByRole('button', { name: ICON_LABEL })).toHaveStyle({
      width: side,
      height: side,
      padding: NO_PADDING,
    });
  });

  it('should give the icon button the medium square by default', () => {
    render(
      <IconButton aria-label={ICON_LABEL}>
        <span />
      </IconButton>,
    );

    expect(screen.getByRole('button', { name: ICON_LABEL })).toHaveStyle({ height: '36px' });
  });
});

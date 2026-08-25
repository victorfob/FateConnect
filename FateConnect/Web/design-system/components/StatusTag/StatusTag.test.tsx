import { render, screen } from '@app/test/testing-library';
import { createAppTheme } from '@ds-root/theme';
import {
  onStatusTagSurface,
  statusTagSurface,
  type StatusTagTone,
} from '@ds-root/theme/statusTagSurface';

import { StatusTag, type StatusTagProps } from '.';

const LABEL = 'Aberto';

const DEFAULT_PROPS: StatusTagProps = { children: LABEL };

const renderComponent = (props = DEFAULT_PROPS) => render(<StatusTag {...props} />);

/** O `getComputedStyle` devolve `rgb(...)`; os tokens são hexadecimais. */
function toRgb(hex: string): string {
  const value = hex.replace('#', '');
  const [red, green, blue] = [0, 2, 4].map((start) => parseInt(value.slice(start, start + 2), 16));

  return `rgb(${red}, ${green}, ${blue})`;
}

/** A caixa da etiqueta é o pai do texto, que o `Typography` renderiza. */
function tagBox(): HTMLElement {
  const box = screen.getByText(LABEL).parentElement;
  if (!box) throw new Error('A etiqueta não renderizou a caixa.');

  return box;
}

const lightTheme = createAppTheme('light');
const COLOURED_TONES: StatusTagTone[] = ['muted', 'success', 'warning', 'danger'];

describe('StatusTag', () => {
  it('should render the label it receives', () => {
    renderComponent();

    expect(screen.getByText(LABEL)).toBeInTheDocument();
  });

  it.each(COLOURED_TONES)('should paint the %s tone with its own pair', (tone) => {
    renderComponent({ ...DEFAULT_PROPS, tone });

    const style = getComputedStyle(tagBox());

    expect(style.backgroundColor).toBe(toRgb(statusTagSurface(lightTheme, tone)));
    expect(style.color).toBe(toRgb(onStatusTagSurface(lightTheme, tone)));
  });

  // O jsdom resolve `transparent` para o rgba equivalente.
  it('should leave the default tone without a surface of its own', () => {
    renderComponent();

    expect(getComputedStyle(tagBox()).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });
});

import { useState } from 'react';

import { act, render, screen, userEvent } from '@app/test/testing-library';

import { ARROW_OFFSET_VARIABLE } from './styles';
import { AnchoredPopover } from '.';

const TRIGGER_LABEL = 'Abrir painel';
const PANEL_LABEL = 'Painel de teste';

const TRIGGER_LEFT = 100;
const TRIGGER_WIDTH = 40;
const PANEL_WIDTH = 200;
const PANEL_RIGHT = 260;
const PANEL_RIGHT_AFTER_RESIZE = 300;

/** O gatilho tem 40px e o centro dele cai em 120: `260 - 120` sobra da direita. */
const EXPECTED_OFFSET = '60px';
const EXPECTED_OFFSET_AFTER_RESIZE = '20px';

function stubGeometry(panelRight: number) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.getAttribute('aria-label') === TRIGGER_LABEL)
      return { left: TRIGGER_LEFT, width: TRIGGER_WIDTH } as DOMRect;

    return { right: panelRight, width: PANEL_WIDTH } as DOMRect;
  });
}

function stubWidths(panelWidth: number) {
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get(this: HTMLElement) {
      if (this.getAttribute('aria-label') === TRIGGER_LABEL) return TRIGGER_WIDTH;

      return panelWidth;
    },
  });
}

function Harness() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <button aria-label={TRIGGER_LABEL} onClick={(event) => setAnchorEl(event.currentTarget)}>
        gatilho
      </button>

      <AnchoredPopover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        label={PANEL_LABEL}
      >
        conteúdo
      </AnchoredPopover>
    </>
  );
}

function panel(): HTMLElement {
  return screen.getByRole('dialog', { name: PANEL_LABEL });
}

describe('AnchoredPopover', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(HTMLElement.prototype, 'offsetWidth');
  });

  it('should point the arrow at the centre of the trigger', async () => {
    stubGeometry(PANEL_RIGHT);
    stubWidths(PANEL_WIDTH);
    render(<Harness />);

    await userEvent.click(screen.getByRole('button', { name: TRIGGER_LABEL }));

    expect(panel().style.getPropertyValue(ARROW_OFFSET_VARIABLE)).toBe(EXPECTED_OFFSET);
  });

  it('should point the arrow again after the window is resized', async () => {
    stubGeometry(PANEL_RIGHT);
    stubWidths(PANEL_WIDTH);
    render(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: TRIGGER_LABEL }));

    stubGeometry(PANEL_RIGHT_AFTER_RESIZE);
    act(() => window.dispatchEvent(new Event('resize')));

    expect(panel().style.getPropertyValue(ARROW_OFFSET_VARIABLE)).toBe(
      EXPECTED_OFFSET_AFTER_RESIZE,
    );
  });

  // O positivo acima usa a mesma consulta, então a ausência aqui significa que
  // a medida não aconteceu — e não que a consulta está errada.
  it('should leave the arrow alone while the panel has no width to measure', async () => {
    stubGeometry(PANEL_RIGHT);
    stubWidths(0);
    render(<Harness />);

    await userEvent.click(screen.getByRole('button', { name: TRIGGER_LABEL }));

    expect(panel().style.getPropertyValue(ARROW_OFFSET_VARIABLE)).toBe('');
  });
});

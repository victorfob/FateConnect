import { render, screen } from '@app/test/testing-library';
import {
  declarationsFor,
  narrowDeclarationsFor,
  sheetRules,
} from '@app/test/utils/styleSheetRules';
import type { FeedbackTone } from '@ds-root/theme/types';
import { Button } from '@ds-root/ui';

import { PageMessage, type PageMessageProps } from '.';

const TITLE = 'Conta desbloqueada';
const DESCRIPTION = 'Entre com a sua senha para continuar.';

const DEFAULT_PROPS: PageMessageProps = { title: TITLE, description: DESCRIPTION };

const renderComponent = (props = DEFAULT_PROPS) => render(<PageMessage {...props} />);

const TONE_ICON_TEST_IDS: [FeedbackTone, string][] = [
  ['info', 'InfoOutlinedIcon'],
  ['success', 'CheckCircleOutlinedIcon'],
  ['warning', 'WarningAmberOutlinedIcon'],
  ['error', 'DangerousOutlinedIcon'],
];

describe('PageMessage', () => {
  it('should show the title, the description and the action', () => {
    renderComponent({ ...DEFAULT_PROPS, children: <button type="button">Entrar</button> });

    expect(screen.getByRole('heading', { name: TITLE })).toBeInTheDocument();
    expect(screen.getByText(DESCRIPTION)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
  });

  it.each(TONE_ICON_TEST_IDS)(
    'should draw the %s icon, hidden from assistive technology',
    (tone, testId) => {
      renderComponent({ ...DEFAULT_PROPS, tone });

      expect(screen.getByTestId(testId).closest('[aria-hidden="true"]')).not.toBeNull();
    },
  );

  it('should leave out the icon and the description when neither is given', () => {
    renderComponent({ title: TITLE });

    expect(screen.getByRole('heading', { name: TITLE })).toBeInTheDocument();
    for (const [, testId] of TONE_ICON_TEST_IDS)
      expect(screen.queryByTestId(testId)).not.toBeInTheDocument();
    expect(screen.queryByText(DESCRIPTION)).not.toBeInTheDocument();
  });

  it('should split the width between two actions and stack them on a narrow screen', () => {
    renderComponent({
      ...DEFAULT_PROPS,
      children: [<Button key="voltar">Voltar</Button>, <Button key="entrar">Entrar</Button>],
    });
    const action = screen.getByRole('button', { name: 'Entrar' });

    expect(declarationsFor(sheetRules(), action)).toContain('flex:1');
    expect(narrowDeclarationsFor(action.parentElement)).toContain('flex-direction:column');
    expect(narrowDeclarationsFor(action)).toContain('flex:00auto');
    expect(narrowDeclarationsFor(action)).toContain('align-self:stretch');
  });

  it('should keep a single action at the width of its label, at any width', () => {
    renderComponent({ ...DEFAULT_PROPS, children: <Button>Entrar</Button> });
    const action = screen.getByRole('button', { name: 'Entrar' });

    expect(declarationsFor(sheetRules(), action)).not.toContain('flex:1');
    expect(narrowDeclarationsFor(action)).not.toContain('align-self:stretch');
    expect(narrowDeclarationsFor(action.parentElement)).toContain('align-items:center');
  });
});

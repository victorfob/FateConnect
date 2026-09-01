import { render, screen } from '@app/test/testing-library';
import { IconButton } from '@ds-root/components/IconButton';
import { StatusTag } from '@ds-root/components/StatusTag';
import { EditIcon } from '@ds-root/icons';
import { iconSizeTokens } from '@ds-root/tokens';

import { ListCard, type ListCardProps } from '.';

const TITLE = 'Item de teste';
const OWN_LABEL = 'Meu item';
const MEDIA_TEXT = 'foto';
const FIRST_INFO = 'Biblioteca';
const SECOND_INFO = '11/08/2026';
const STATUS_LABEL = 'Aberto';
const ACTION_LABEL = 'Editar';
const TOUCH_TARGET = '32px';

/** Os recuos são declarados em `rem`; o alvo de toque e o glifo, em `px`. */
const REM_IN_PX = 16;

function toNumber(value: string): number {
  return Number.parseFloat(value);
}

function styleOf(candidate: Element | null, what: string): CSSStyleDeclaration {
  if (!candidate) throw new Error(`Não renderizou ${what}.`);

  return getComputedStyle(candidate);
}

const DEFAULT_PROPS: ListCardProps = { children: TITLE };

const renderComponent = (props = DEFAULT_PROPS) => render(<ListCard {...props} />);

describe('ListCard', () => {
  it('should render its content inside an article', () => {
    renderComponent();

    expect(screen.getByRole('article')).toHaveTextContent(TITLE);
  });

  it('should render the media slot beside the body', () => {
    renderComponent({ ...DEFAULT_PROPS, media: <span>{MEDIA_TEXT}</span> });

    expect(screen.getByText(MEDIA_TEXT)).toBeInTheDocument();
  });

  it('should announce the own label only when the record belongs to the reader', () => {
    renderComponent({ ...DEFAULT_PROPS, own: true, ownLabel: OWN_LABEL });

    expect(screen.getByText(OWN_LABEL)).toBeInTheDocument();
  });

  it('should keep the own label out of the tree when the record is not the reader own', () => {
    renderComponent({ ...DEFAULT_PROPS, ownLabel: OWN_LABEL });

    expect(screen.queryByText(OWN_LABEL)).not.toBeInTheDocument();
  });

  it('should separate the info items without anything the screen reader would read', () => {
    renderComponent({
      children: (
        <ListCard.InfoRow>
          <ListCard.InfoItem>{FIRST_INFO}</ListCard.InfoItem>
          <ListCard.InfoItem>{SECOND_INFO}</ListCard.InfoItem>
        </ListCard.InfoRow>
      ),
    });

    expect(screen.getByRole('article')).toHaveTextContent(`${FIRST_INFO}${SECOND_INFO}`);
  });

  it('should draw the action icon at the design system size, inside the touch target', () => {
    renderComponent({
      children: (
        <ListCard.Header>
          <ListCard.Actions>
            <StatusTag>{STATUS_LABEL}</StatusTag>

            <ListCard.ActionButtons>
              <IconButton type="button" label={ACTION_LABEL}>
                <EditIcon />
              </IconButton>
            </ListCard.ActionButtons>
          </ListCard.Actions>
        </ListCard.Header>
      ),
    });

    const button = screen.getByRole('button', { name: ACTION_LABEL });
    const buttonStyle = getComputedStyle(button);
    const icon = styleOf(button.querySelector('svg'), 'o ícone da ação');

    const verticalPadding =
      (toNumber(buttonStyle.paddingTop) + toNumber(buttonStyle.paddingBottom)) * REM_IN_PX;

    expect(icon.fontSize).toBe(`${iconSizeTokens.md}px`);
    expect(buttonStyle.height).toBe(TOUCH_TARGET);
    // O glifo mais os dois recuos ocupam o botão inteiro: cresce mais e ele encosta.
    expect(iconSizeTokens.md + verticalPadding).toBe(toNumber(TOUCH_TARGET));
  });

  it('should keep the own flag out of the markup', () => {
    renderComponent({ ...DEFAULT_PROPS, own: true });

    expect(screen.getByRole('article')).not.toHaveAttribute('own');
  });
});

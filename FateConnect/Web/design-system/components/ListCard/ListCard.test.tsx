import { render, screen } from '@app/test/testing-library';
import { IconButton } from '@ds-root/components/IconButton';
import { StatusTag } from '@ds-root/components/StatusTag';
import { EditIcon } from '@ds-root/icons';
import { createAppTheme } from '@ds-root/theme';
import { iconSizeTokens } from '@ds-root/tokens';

import { ACTIONS_ATTRIBUTE } from './constants';
import { ListCard, type ListCardProps } from '.';

const TITLE = 'Item de teste';
const OWN_LABEL = 'Meu item';
const MEDIA_TEXT = 'foto';
const FIRST_INFO = 'Biblioteca';
const SECOND_INFO = '11/08/2026';
const DESCRIPTION = 'pneumoultramicroscopicossilicovulcanoconiótico';
const STATUS_LABEL = 'Aberto';
const ACTION_LABEL = 'Editar';
const TOUCH_TARGET = '32px';

/** Os recuos são declarados em `rem`; o alvo de toque e o glifo, em `px`. */
const REM_IN_PX = 16;

const NARROW_MEDIA = createAppTheme().breakpoints.down('md').replace('@media', '');
const BEFORE = '::before';

function toNumber(value: string): number {
  return Number.parseFloat(value);
}

function styleOf(candidate: Element | null, what: string): CSSStyleDeclaration {
  if (!candidate) throw new Error(`Não renderizou ${what}.`);

  return getComputedStyle(candidate);
}

function withoutSpaces(text: string): string {
  return text.replaceAll(/\s/g, '');
}

function sheetRules(): CSSRule[] {
  return Array.from(document.styleSheets).flatMap((sheet) => Array.from(sheet.cssRules));
}

function narrowRules(): CSSRule[] {
  const narrowMedia = withoutSpaces(NARROW_MEDIA);

  return sheetRules()
    .filter((rule) => rule instanceof CSSMediaRule)
    .filter((rule) => withoutSpaces(rule.media.mediaText) === narrowMedia)
    .flatMap((rule) => Array.from(rule.cssRules));
}

/**
 * O jsdom não aplica `@media` nem calcula pseudo-elemento no `getComputedStyle`:
 * a folha que o Emotion escreveu é lida direto.
 */
function declarationsFor(rules: CSSRule[], element: Element, pseudoElement = ''): string {
  return rules
    .filter((rule) => rule instanceof CSSStyleRule)
    .filter((rule) => rule.selectorText.endsWith(pseudoElement))
    .filter((rule) => element.matches(rule.selectorText.replace(BEFORE, '')))
    .map((rule) => withoutSpaces(rule.style.cssText))
    .join(';');
}

function renderInfoRow() {
  render(
    <ListCard>
      <ListCard.InfoRow>
        <ListCard.InfoItem>{FIRST_INFO}</ListCard.InfoItem>
        <ListCard.InfoItem>{SECOND_INFO}</ListCard.InfoItem>
      </ListCard.InfoRow>
    </ListCard>,
  );

  const item = screen.getByText(FIRST_INFO);
  const row = item.parentElement;
  if (!row) throw new Error('Não renderizou a fileira.');

  return { row, item };
}

function renderMediaCard(media?: ListCardProps['media']) {
  render(
    <ListCard media={media}>
      <ListCard.Header>
        <span>{TITLE}</span>
        <ListCard.Actions>
          <StatusTag>{STATUS_LABEL}</StatusTag>
        </ListCard.Actions>
      </ListCard.Header>

      <ListCard.InfoRow>
        <ListCard.InfoItem>{FIRST_INFO}</ListCard.InfoItem>
      </ListCard.InfoRow>

      <ListCard.Description>{DESCRIPTION}</ListCard.Description>
    </ListCard>,
  );

  const title = screen.getByText(TITLE);
  const header = title.parentElement;
  const body = header?.parentElement;
  if (!header || !body) throw new Error('Não renderizou o cabeçalho dentro do corpo.');

  return {
    card: screen.getByRole('article'),
    body,
    header,
    title,
    actions: screen.getByText(STATUS_LABEL).closest(`[${ACTIONS_ATTRIBUTE}]`),
    infoRow: screen.getByText(FIRST_INFO).parentElement,
    description: screen.getByText(DESCRIPTION),
  };
}

function narrowDeclarationsFor(element: Element | null): string {
  if (!element) throw new Error('Não renderizou a parte do cartão.');

  return declarationsFor(narrowRules(), element);
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

  it('should put the actions on top and the title and info beside the media below md', () => {
    const parts = renderMediaCard(<span>{MEDIA_TEXT}</span>);

    expect(narrowDeclarationsFor(parts.card)).toContain('display:grid');
    expect(narrowDeclarationsFor(parts.body)).toContain('display:contents');
    expect(narrowDeclarationsFor(parts.header)).toContain('display:contents');
    expect(narrowDeclarationsFor(parts.actions)).toContain('grid-area:actions');
    expect(narrowDeclarationsFor(screen.getByText(MEDIA_TEXT).parentElement)).toContain(
      'grid-area:media',
    );
    expect(narrowDeclarationsFor(parts.title)).toContain('grid-area:title');
    expect(narrowDeclarationsFor(parts.infoRow)).toContain('grid-area:info');
    expect(narrowDeclarationsFor(parts.description)).toContain('grid-column:1/-1');
  });

  it('should keep the card with media in a row from md up', () => {
    const { card } = renderMediaCard(<span>{MEDIA_TEXT}</span>);

    expect(getComputedStyle(card).display).toBe('flex');
    expect(getComputedStyle(card).flexDirection).toBe('row');
  });

  it('should keep the card without media out of the grid below md', () => {
    const { card } = renderMediaCard();

    expect(narrowDeclarationsFor(card)).toContain('flex-direction:column');
    expect(narrowDeclarationsFor(card)).not.toContain('display:grid');
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

  it('should keep the info items in one line with dividers from md up', () => {
    const { row, item } = renderInfoRow();

    expect(getComputedStyle(row).flexDirection).toBe('row');
    expect(declarationsFor(sheetRules(), item, BEFORE)).toContain('width:1px');
  });

  it('should stack the info items one per line without dividers below md', () => {
    const { row, item } = renderInfoRow();

    expect(declarationsFor(narrowRules(), row)).toContain('flex-direction:column');
    expect(declarationsFor(narrowRules(), item, BEFORE)).toContain('display:none');
  });

  it('should break a word without spaces inside the card instead of overflowing it', () => {
    renderComponent({ children: <ListCard.Description>{DESCRIPTION}</ListCard.Description> });

    const body = screen.getByText(DESCRIPTION).parentElement;

    expect(styleOf(body, 'o corpo do cartão').overflowWrap).toBe('anywhere');
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

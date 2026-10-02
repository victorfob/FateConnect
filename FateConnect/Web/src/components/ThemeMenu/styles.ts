import { Button, ListSubheader, spacingScale, styled } from '@design-system';

const { none, sm, md } = spacingScale;

/** O título apagado e pequeno de um menu, sem o fundo e a altura de cabeçalho de lista. */
export const MenuTitle = styled(ListSubheader)(({ theme }) => ({
  fontSize: theme.typography.caption.fontSize,
  lineHeight: theme.typography.caption.lineHeight,
  backgroundColor: 'transparent',
  color: theme.palette.text.secondary,
  // A lista com título perde o recuo de cima, e o título ficava colado na borda do painel.
  padding: theme.space(sm, md, none),
}));

/** Divide a linha com o texto da preferência, que quebra; o botão nunca encolhe nem corta o ícone. */
export const LabelledTrigger = styled(Button)({ flexShrink: 0, whiteSpace: 'nowrap' });

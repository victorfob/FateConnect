import { Divider, IconButton, ListItemButton, spacingScale, styled } from '@design-system';

const { none, xxs } = spacingScale;

/**
 * A seta do popover é centrada num controle de 40px, e o avatar tem 32: com o
 * recuo padrão do botão o gatilho iria a 48px e a seta sairia do centro dele.
 */
export const AvatarTrigger = styled(IconButton)(({ theme }) => ({
  padding: theme.space(xxs),
}));

/** O vermelho da marca como texto — `secondary.main` é cor de fundo e dá 3,24:1. */
export const SignOutItem = styled(ListItemButton)(({ theme }) => ({
  color: theme.palette.brandText,
  '& .MuiListItemIcon-root': { color: 'inherit' },
}));

/**
 * Afasta a saída de sessão dos dois itens de navegação, sem virar seção. O
 * `component` vai no genérico porque o `styled` do Emotion apaga a prop
 * polimórfica da tipagem, e dentro da lista o divisor precisa ser um `li`.
 */
export const MenuDivider = styled(Divider)<{ component?: 'li' }>(({ theme }) => ({
  margin: theme.space(xxs, none),
}));

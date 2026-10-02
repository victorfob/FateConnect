import { Divider, IconButton, ListItemButton, spacingScale, styled } from '@design-system';

const { none, xxs } = spacingScale;

export const AvatarTrigger = styled(IconButton)(({ theme }) => ({
  // Abaixo do limite do cabeçalho quem responde pela conta é a gaveta, que leva
  // os mesmos itens deste painel. A consulta é a mesma em que o botão de menu
  // aparece, de modo que um substitui o outro em vez de os dois conviverem.
  [theme.breakpoints.down('header')]: { display: 'none' },
}));

/** O vermelho da marca como texto — `secondary.main` é cor de fundo e como texto reprova. */
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

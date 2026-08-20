import Button from '@mui/material/Button';
import type { Theme } from '@mui/material/styles';

import { styled } from '../../styled';
import { spacing } from '../../theme/helpers/spacing';
import {
  notificationSurface,
  onNotificationSurface,
  type NotificationVariant,
} from '../../theme/notificationSurface';
import { spacingScale, typographyTokens } from '../../tokens';

const { xs, md } = spacingScale;

const VARIANTS: NotificationVariant[] = ['success', 'error', 'warning'];

/** Recuo vertical da mensagem no produto — fica entre dois tokens da escala. */
const MESSAGE_PADDING_Y_PX = 14;
/** Caixa do botão de ação no produto, herdada do botão do Material. */
const DISMISS_MIN_WIDTH_PX = 64;
const DISMISS_HEIGHT_PX = 36;

/**
 * O notistack marca o conteúdo com `notistack-MuiContent-<variante>`, e é por
 * essa classe que a cor do produto entra: a prop `classes` do provider só
 * alcança o contêiner e a âncora, não o conteúdo.
 *
 * As medidas vêm do aviso do produto: caixa de 378x47, recuo da mensagem
 * `14px 8px 14px 16px`, recuo direito de 8px para a ação, texto de 16px com
 * peso 400 e `line-height` natural — a biblioteca usa 14px e entrelinha fixa,
 * o que deixava a caixa 9px mais alta.
 */
export function notificationStyles(theme: Theme) {
  const perVariant = VARIANTS.map((variant) => [
    `.notistack-MuiContent-${variant}`,
    {
      backgroundColor: notificationSurface(theme, variant),
      color: onNotificationSurface(theme, variant),
    },
  ]);

  return {
    '.notistack-MuiContent': {
      fontSize: typographyTokens.subtitle.fontSize,
      fontWeight: typographyTokens.caption.fontWeight,
      lineHeight: 'normal',
      padding: spacing(0, xs, 0, 0),
      flexWrap: 'nowrap',
    },
    '#notistack-snackbar': {
      padding: spacing(MESSAGE_PADDING_Y_PX, xs, MESSAGE_PADDING_Y_PX, md),
    },
    // A biblioteca envolve a ação num elemento com recuo próprio, que somava 8px
    // à caixa. A classe dele é gerada, então o alvo é "o filho que não é a
    // mensagem" — o `id` da mensagem é o único seletor estável ali.
    '.notistack-MuiContent > :not(#notistack-snackbar)': {
      padding: 0,
      margin: 0,
    },
    ...Object.fromEntries(perVariant),
  };
}

/** Ação de dispensar. Herda a cor do aviso, como o botão do produto. */
export const DismissButton = styled(Button)({
  ...typographyTokens.button,
  lineHeight: 'normal',
  minWidth: `${DISMISS_MIN_WIDTH_PX}px`,
  height: `${DISMISS_HEIGHT_PX}px`,
  padding: spacing(0, xs),
  color: 'inherit',
});

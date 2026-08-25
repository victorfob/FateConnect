import Button from '@mui/material/Button';
import type { Theme } from '@mui/material/styles';

import { styled } from '@ds-root/styled';
import { spacing } from '@ds-root/theme/helpers/spacing';
import {
  notificationSurface,
  onNotificationSurface,
  type NotificationVariant,
} from '@ds-root/theme/notificationSurface';
import { mobileMedia, spacingScale, typographyTokens } from '@ds-root/tokens';

const { xs, md } = spacingScale;

const VARIANTS: NotificationVariant[] = ['success', 'error', 'warning'];

/** Recuo vertical da mensagem no produto — fica entre dois tokens da escala. */
const MESSAGE_PADDING_Y_PX = 14;
/**
 * Largura da caixa do aviso no produto. É **fixa**: com largura variável a ação
 * mudava de lugar a cada mensagem — as duas mensagens de erro mais longas
 * empurravam o "OK" uns 19px para a direita. Fixando, o texto quebra em duas
 * linhas quando não cabe e a ação fica sempre no mesmo ponto.
 */
const BOX_WIDTH_PX = 378;
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
      width: `${BOX_WIDTH_PX}px`,

      // No estreito a caixa do produto não cabe: ali ela ocupa a largura do
      // contêiner, que o notistack estica na tela toda.
      [mobileMedia]: { width: '100%' },
    },
    // A mensagem fica com a sobra da caixa, o que empurra a ação para a borda
    // direita — sem isso o "OK" cola no fim do texto e muda de lugar a cada
    // mensagem.
    '#notistack-snackbar': {
      padding: spacing(MESSAGE_PADDING_Y_PX, xs, MESSAGE_PADDING_Y_PX, md),
      flexGrow: 1,
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

import type { ButtonHTMLAttributes } from 'react';

import { Box, desktopMedia, spacing, spacingScale, Stack, styled } from '@design-system';
import type { PolymorphicProps } from '@design-system';

const { md } = spacingScale;

/**
 * Área de toque da caixa de seleção: 24px no mobile e 32px no desktop, como no
 * produto. O recuo parte dos 24px do ícone do MUI — que desenha um quadrado de
 * 18px dentro dele —, não dos 18px do quadrado em si.
 */
const CHECKBOX_TOUCH_PADDING_MOBILE_PX = 0;
const CHECKBOX_TOUCH_PADDING_DESKTOP_PX = 4;

/** Tamanhos fora da escala tipográfica do tema, herdados do formulário atual. */
const CONSENT_FONT_SIZE_MOBILE = '0.75rem';
const CONSENT_ERROR_FONT_SIZE_MOBILE = '0.65rem';
const CONSENT_ERROR_FONT_SIZE_DESKTOP = '0.75rem';

export const ConsentGroup = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  fontSize: CONSENT_FONT_SIZE_MOBILE,

  '& .MuiCheckbox-root': { padding: spacing(CHECKBOX_TOUCH_PADDING_MOBILE_PX) },
  // O rótulo acompanha o corpo do bloco, como no produto, em vez de fixar a
  // tipografia do MUI — é o que faz o texto encolher junto no mobile.
  '& .MuiFormControlLabel-label': { fontSize: 'inherit', lineHeight: 'normal' },

  [desktopMedia]: {
    fontSize: 'inherit',

    '& .MuiCheckbox-root': { padding: spacing(CHECKBOX_TOUCH_PADDING_DESKTOP_PX) },
  },
});

/** Link no meio da frase do aceite: parece texto, age como botão. */
export const InlineLink = styled(Box)<PolymorphicProps & ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ theme }) => ({
    display: 'inline',
    border: 'none',
    background: 'none',
    font: 'inherit',
    padding: 0,
    color: theme.palette.secondary.main,
    cursor: 'pointer',

    '&:hover': {
      textDecoration: 'underline',
      textDecorationColor: theme.palette.secondary.main,
    },
  }),
);

/** O produto pinta este aviso com o vermelho de destaque, não com o de erro. */
export const ConsentError = styled(Box)<PolymorphicProps>(({ theme }) => ({
  fontSize: CONSENT_ERROR_FONT_SIZE_MOBILE,
  lineHeight: 'normal',
  color: theme.palette.secondary.main,
  paddingLeft: spacing(md),

  [desktopMedia]: { fontSize: CONSENT_ERROR_FONT_SIZE_DESKTOP },
}));

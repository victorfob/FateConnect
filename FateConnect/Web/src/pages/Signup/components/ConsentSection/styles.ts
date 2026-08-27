import type { AnchorHTMLAttributes, LabelHTMLAttributes } from 'react';
import { PolymorphicBox, spacingScale, Stack, styled } from '@design-system';

const { none, xxs, md } = spacingScale;

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

export const ConsentGroup = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  fontSize: CONSENT_FONT_SIZE_MOBILE,

  '& .MuiCheckbox-root': { padding: theme.space(CHECKBOX_TOUCH_PADDING_MOBILE_PX) },
  // O rótulo acompanha o corpo do bloco, como no produto, em vez de fixar a
  // tipografia do MUI — é o que faz o texto encolher junto no mobile.
  '& .MuiFormControlLabel-label': { fontSize: 'inherit', lineHeight: 'normal' },

  [theme.breakpoints.up('md')]: {
    fontSize: 'inherit',

    '& .MuiCheckbox-root': { padding: theme.space(CHECKBOX_TOUCH_PADDING_DESKTOP_PX) },
  },
}));

export const TermsRow = styled(Stack)({
  flexDirection: 'row',
  alignItems: 'center',
});

export const TermsText = styled(PolymorphicBox)(({ theme }) => ({
  fontSize: 'inherit',
  lineHeight: 'normal',
  // O mesmo recuo que o MUI dá ao rótulo do `FormControlLabel` da linha de baixo.
  paddingLeft: theme.space(xxs),
}));

export const TermsLabel = styled(PolymorphicBox)<LabelHTMLAttributes<HTMLLabelElement>>({
  cursor: 'pointer',
});

export const InlineLink = styled(PolymorphicBox)<AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ theme }) => ({
    display: 'inline',
    font: 'inherit',
    textDecoration: 'none',
    padding: theme.space(none),
    color: theme.palette.brandText,
    cursor: 'pointer',

    '&:hover': {
      textDecoration: 'underline',
      textDecorationColor: theme.palette.brandText,
    },
  }),
);

/** O produto pinta este aviso com o vermelho de destaque, não com o de erro. */
export const ConsentError = styled(PolymorphicBox)(({ theme }) => ({
  fontSize: CONSENT_ERROR_FONT_SIZE_MOBILE,
  lineHeight: 'normal',
  color: theme.palette.brandText,
  paddingLeft: theme.space(md),

  [theme.breakpoints.up('md')]: { fontSize: CONSENT_ERROR_FONT_SIZE_DESKTOP },
}));

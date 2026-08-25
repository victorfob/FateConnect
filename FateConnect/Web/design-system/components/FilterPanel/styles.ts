import type { FormHTMLAttributes } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { styled, type PolymorphicProps } from '@ds-root/styled';
import { radius } from '@ds-root/theme/helpers/radius';
import { spacing } from '@ds-root/theme/helpers/spacing';
import { desktopMedia, radiusScale, shadowTokens, spacingScale } from '@ds-root/tokens';

const { none, xxs, xs, md, lg, xl } = spacingScale;

const HEADER_HEIGHT_PX = 64;
const SUBMIT_BUTTON_HEIGHT_PX = 56;
const SUBMIT_BUTTON_LETTER_SPACING = '0.4px';
const FIELD_MIN_WIDTH_PX = 180;
const FULL_WIDTH_PERCENT = 100;
const ACTIVE_DOT_OFFSET = 'translate(6px, -2px)';

export const PanelRoot = styled(Accordion)(({ theme }) => ({
  marginBottom: spacing(md),
  borderRadius: radius(radiusScale.component),
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: 'none',
  boxShadow: shadowTokens.component,

  '&::before': { display: 'none' },

  // Único ponto do produto em que o campo usa o raio de componente: o resto
  // da aplicação mantém o raio padrão do Material.
  '& .MuiOutlinedInput-root': { borderRadius: radius(radiusScale.component) },
}));

export const PanelHeader = styled(AccordionSummary)(({ theme }) => ({
  color: theme.palette.text.primary,
  minHeight: `${HEADER_HEIGHT_PX}px`,
  padding: spacing(none, lg),

  '&.Mui-expanded': { minHeight: `${HEADER_HEIGHT_PX}px` },

  '& .MuiAccordionSummary-content': {
    display: 'flex',
    alignItems: 'center',
    gap: spacing(xxs),
  },
  '& .MuiAccordionSummary-content svg': { color: theme.palette.text.primary },

  // Deitado quando fechado e apontando para baixo quando aberto: a rotação
  // padrão do Material é de meia volta, que devolveria o chevron para a esquerda.
  '& .MuiAccordionSummary-expandIconWrapper': {
    color: theme.palette.text.primary,

    '&.Mui-expanded': { transform: 'rotate(90deg)' },
  },
}));

export const ActiveFilterBadge = styled(Badge)({
  '& .MuiBadge-dot': { transform: ACTIVE_DOT_OFFSET },
});

export const PanelBody = styled(AccordionDetails)({
  padding: spacing(none, lg, xl),
});

export const PanelForm = styled(Stack)<PolymorphicProps<FormHTMLAttributes<HTMLFormElement>>>({
  flexDirection: 'column',
});

/** Quem arranja a linha decide quantas células cabem nela. */
export const FieldsRow = styled(Stack)<PolymorphicProps & { columns: number }>(({ columns }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: spacing(md),
  marginTop: spacing(md),

  [desktopMedia]: {
    '& > *': {
      flex: `1 1 calc(${FULL_WIDTH_PERCENT / columns}% - ${spacingScale.md}px)`,
      minWidth: `${FIELD_MIN_WIDTH_PX}px`,
    },
  },
}));

export const SubmitButton = styled(Button)({
  height: `${SUBMIT_BUTTON_HEIGHT_PX}px`,
  letterSpacing: SUBMIT_BUTTON_LETTER_SPACING,
  borderRadius: radius(radiusScale.component),
  gap: spacing(xs),
});

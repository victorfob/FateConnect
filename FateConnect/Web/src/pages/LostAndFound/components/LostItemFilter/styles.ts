import type { FormHTMLAttributes } from 'react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  desktopMedia,
  radius,
  radiusScale,
  shadowTokens,
  spacing,
  spacingScale,
  Stack,
  styled,
  type PolymorphicProps,
} from '@design-system';

const { none, xs, md, lg, xl } = spacingScale;

const HEADER_GAP = '3px';
/** Altura do cabeçalho do painel no produto. */
const HEADER_HEIGHT_PX = 64;
const FILTER_BUTTON_HEIGHT_PX = 56;
const FILTER_BUTTON_LETTER_SPACING = '0.4px';
/** Cinco campos e o botão: três células por linha no desktop, em duas linhas. */
const FIELD_BASIS = 'calc(33.333% - 16px)';
const FIELD_MIN_WIDTH_PX = 180;

export const FilterPanel = styled(Accordion)(({ theme }) => ({
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

export const FilterHeader = styled(AccordionSummary)(({ theme }) => ({
  color: theme.palette.text.primary,
  minHeight: `${HEADER_HEIGHT_PX}px`,
  padding: spacing(none, lg),

  '&.Mui-expanded': { minHeight: `${HEADER_HEIGHT_PX}px` },

  '& .MuiAccordionSummary-content': {
    display: 'flex',
    alignItems: 'center',
    gap: HEADER_GAP,
  },
  '& .MuiAccordionSummary-content svg': { color: theme.palette.text.primary },
}));

export const FilterBody = styled(AccordionDetails)({
  padding: spacing(none, lg, xl),
});

export const FilterForm = styled(Stack)<PolymorphicProps<FormHTMLAttributes<HTMLFormElement>>>({
  flexDirection: 'column',
});

export const FieldsRow = styled(Stack)<PolymorphicProps>({
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: spacing(md),
  marginTop: spacing(md),
});

export const FieldCell = styled(Stack)<PolymorphicProps>({
  flexDirection: 'column',
  gap: '6px',
  width: '100%',

  [desktopMedia]: {
    flex: `1 1 ${FIELD_BASIS}`,
    minWidth: `${FIELD_MIN_WIDTH_PX}px`,
  },
});

export const SubmitCell = styled(FieldCell)({
  '& .MuiButton-root': {
    height: `${FILTER_BUTTON_HEIGHT_PX}px`,
    letterSpacing: FILTER_BUTTON_LETTER_SPACING,
    borderRadius: radius(radiusScale.component),
    gap: spacing(xs),
  },
});

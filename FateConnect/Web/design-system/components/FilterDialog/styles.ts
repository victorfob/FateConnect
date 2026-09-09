import type { FormHTMLAttributes } from 'react';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';

import { PolymorphicStack } from '@ds-root/polymorphic';
import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { sm, md, lg } = spacingScale;

const ACTIVE_DOT_OFFSET = 'translate(-6px, 6px)';
const FIELD_MIN_WIDTH_PX = 180;
const DESKTOP_COLUMNS = 2;
const FULL_WIDTH_PERCENT = 100;

/** O ponto encosta no desenho do ícone, não no canto do alvo de toque. */
export const TriggerBadge = styled(Badge)({
  '& .MuiBadge-dot': { transform: ACTIVE_DOT_OFFSET },
});

/**
 * Envolve o corpo e o rodapé, para o botão de aplicar ser um `submit` de dentro
 * do formulário — é o que mantém o Enter num campo filtrando. Assume o vão e o
 * crescimento que eram do miolo do diálogo, senão o corpo deixa de rolar.
 */
export const FilterForm = styled(PolymorphicStack)<FormHTMLAttributes<HTMLFormElement>>(
  ({ theme }) => ({
    flexDirection: 'column',
    gap: theme.space(lg),
    flexGrow: 1,
    minHeight: 0,
  }),
);

/**
 * Duas colunas no desktop e uma no estreito. Três não cabem: com 536px úteis no
 * diálogo, a terceira coluna daria 168px e o campo pede 180px no mínimo.
 */
export const FieldsGrid = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: theme.space(md),
  // O rótulo encolhido sobe 9px acima da caixa do campo, e o miolo do diálogo
  // recorta o que passa dele: sem esta folga o rótulo da primeira linha sai
  // cortado. É o mesmo recuo que a grade do diálogo de formulário já usa.
  paddingTop: theme.space(sm),

  [theme.breakpoints.up('md')]: {
    '& > *': {
      // Sem crescer: campo sozinho na última linha esticaria ao dobro da largura
      // dos de cima, e as colunas deixariam de se alinhar.
      flex: `0 1 calc(${FULL_WIDTH_PERCENT / DESKTOP_COLUMNS}% - ${spacingScale.md}px)`,
      minWidth: `${FIELD_MIN_WIDTH_PX}px`,
    },
  },
}));

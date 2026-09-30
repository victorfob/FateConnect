import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';

import { styled } from '@ds-root/styled';
import { spacingScale } from '@ds-root/tokens';

const { sm, md } = spacingScale;

const ACTIVE_DOT_OFFSET = 'translate(-6px, 6px)';
const FIELD_MIN_WIDTH_PX = 180;
const DESKTOP_COLUMNS = 2;
const FULL_WIDTH_PERCENT = 100;

/** O ponto encosta no desenho do ícone, não no canto do alvo de toque. */
export const TriggerBadge = styled(Badge)({
  '& .MuiBadge-dot': { transform: ACTIVE_DOT_OFFSET },
});

/**
 * Duas colunas no desktop e uma no estreito. Três não cabem: a terceira coluna
 * ficaria mais estreita que a largura mínima do campo.
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

    // Filtro de um campo só: o papel já abre estreito, e meia largura ali
    // deixaria o campo menor que o mínimo com o resto da linha vazio.
    '& > *:only-child': { flex: `1 1 ${FULL_WIDTH_PERCENT}%` },
  },
}));

import { spacingScale, Stack, styled } from '@design-system';

const { xs, md, xl } = spacingScale;

export const DetailsRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.space(xl),

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.space(md),
  },
}));

export const Identity = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.space(xs),
  // `alignItems` centraliza a caixa do nome, não o texto dentro dela: sem isto
  // um nome que quebra em duas linhas sai alinhado à esquerda do bloco.
  textAlign: 'center',
}));

export const Channels = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: theme.space(xs),

  // Quem encolhe é a identidade, porque o nome pode quebrar em mais linhas e o
  // e-mail não tem onde quebrar sem virar duas. Sem isto o flex reparte a falta
  // entre os dois e o e-mail quebra junto, mesmo havendo espaço para ele.
  flexShrink: 0,

  [theme.breakpoints.down('md')]: { alignItems: 'center' },
}));

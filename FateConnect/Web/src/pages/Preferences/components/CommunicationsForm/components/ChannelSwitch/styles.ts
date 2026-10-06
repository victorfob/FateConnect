import { FormControlLabel, spacingScale, styled } from '@design-system';

const { none, sm } = spacingScale;

export const ChannelRow = styled(FormControlLabel)(({ theme }) => ({
  justifyContent: 'space-between',
  gap: theme.space(sm),

  // O recuo do tema separa o rótulo da caixa à esquerda; aqui o controle fica à direita.
  '& .MuiFormControlLabel-label': { flex: 1, paddingLeft: theme.space(none) },
}));

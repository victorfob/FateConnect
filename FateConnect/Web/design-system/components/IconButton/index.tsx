import MuiIconButton, {
  type IconButtonProps as MuiIconButtonProps,
} from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import * as S from './styles';

export type IconButtonProps = Readonly<
  Omit<MuiIconButtonProps, 'aria-label' | 'title'> & {
    /** O que a ação faz: vira tooltip e nome acessível do botão. */
    label: string;
  }
>;

/**
 * Botão de ícone com rótulo obrigatório. Um ícone sozinho não diz o que faz, e
 * o mesmo texto atende quem passa o ponteiro e quem usa leitor de tela.
 */
export function IconButton({ label, children, ...buttonProps }: IconButtonProps) {
  return (
    <Tooltip title={label}>
      {/* O Tooltip estampa o próprio `aria-label` no filho; anulá-lo aqui evita
          que o rótulo nomeie o invólucro além do botão. */}
      <S.TooltipTarget component="span" aria-label={undefined}>
        <MuiIconButton {...buttonProps} aria-label={label}>
          {children}
        </MuiIconButton>
      </S.TooltipTarget>
    </Tooltip>
  );
}

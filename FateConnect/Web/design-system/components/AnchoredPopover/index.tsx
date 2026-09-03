import type { ReactNode } from 'react';
import type { PopoverOrigin } from '@mui/material/Popover';

import * as S from './styles';

const ANCHOR_ORIGIN: PopoverOrigin = { vertical: 'bottom', horizontal: 'right' };
const TRANSFORM_ORIGIN: PopoverOrigin = { vertical: 'top', horizontal: 'right' };

export type AnchoredPopoverProps = Readonly<{
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: VoidFunction;
  /** Nome acessível do painel. Sem ele o leitor de tela anuncia só "diálogo". */
  label: string;
  children: ReactNode;
}>;

/**
 * Fechar por clique fora, por `Esc` e devolver o foco ao gatilho vêm do `Modal`
 * que o `Popover` monta por dentro — não registre listener próprio.
 */
export function AnchoredPopover({
  anchorEl,
  open,
  onClose,
  label,
  children,
}: AnchoredPopoverProps) {
  return (
    <S.PopoverSurface
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={ANCHOR_ORIGIN}
      transformOrigin={TRANSFORM_ORIGIN}
      slotProps={{ paper: { role: 'dialog', 'aria-label': label } }}
    >
      {children}
    </S.PopoverSurface>
  );
}

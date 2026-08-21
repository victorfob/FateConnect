import MuiDialog from '@mui/material/Dialog';
import { useId, type ReactNode } from 'react';

import { DialogBody } from './DialogBody';
import { DialogFooter } from './DialogFooter';
import * as S from './styles';

export type DialogProps = Readonly<{
  open: boolean;
  onClose: VoidFunction;
  title: string;
  /** Conteúdo por composição: `Dialog.Body` no miolo, `Dialog.Footer` no rodapé. */
  children: ReactNode;
}>;

/**
 * Esqueleto de diálogo da aplicação — superfície, título e o fechar. É o único
 * diálogo: quem precisa de um monta o conteúdo nos slots em vez de escrever
 * outro, e o cromo (recuo, alinhamento, comportamento no estreito) fica num
 * lugar só.
 */
function Dialog({ open, onClose, title, children }: DialogProps) {
  // O id nasce do React: título fixo colidiria se dois diálogos coexistissem.
  const titleId = useId();

  return (
    <MuiDialog open={open} onClose={onClose} aria-labelledby={titleId}>
      <S.DialogSurface>
        <S.DialogTitleText variant="h2" id={titleId}>
          {title}
        </S.DialogTitleText>

        {children}
      </S.DialogSurface>
    </MuiDialog>
  );
}

Dialog.Body = DialogBody;
Dialog.Footer = DialogFooter;

export { Dialog };

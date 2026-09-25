import { useId, type ReactNode } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import MuiDialog from '@mui/material/Dialog';

import { IconButton } from '@ds-root/components/IconButton';

import { CLOSE_LABEL } from './constants';
import { DialogBody } from './DialogBody';
import { DialogFooter } from './DialogFooter';
import { DialogMessage } from './DialogMessage';
import * as S from './styles';

export type DialogWidth = 'narrow' | 'standard';

export type DialogProps = Readonly<{
  open: boolean;
  onClose: VoidFunction;
  title: string;
  /** `narrow` para o conteúdo curto, que num papel de 600px abriria com metade vazia. */
  width?: DialogWidth;
  /** Conteúdo por composição: `Dialog.Body` no miolo, com `Dialog.Message` para a frase, e `Dialog.Footer` no rodapé. */
  children: ReactNode;
}>;

const MAX_WIDTH_BY_WIDTH: Readonly<Record<DialogWidth, 'xs' | 'sm'>> = {
  narrow: 'xs',
  standard: 'sm',
};

/**
 * Esqueleto de diálogo da aplicação — superfície, título e o fechar. É o único
 * diálogo: quem precisa de um monta o conteúdo nos slots em vez de escrever
 * outro, e o cromo (recuo, alinhamento, comportamento no estreito) fica num
 * lugar só.
 */
function Dialog({ open, onClose, title, width = 'standard', children }: DialogProps) {
  // O id nasce do React: título fixo colidiria se dois diálogos coexistissem.
  const titleId = useId();

  return (
    // `fullWidth` faz o papel ocupar a largura disponível até o teto, em vez de
    // acompanhar o conteúdo — sem ele cada diálogo abre com uma largura, porque
    // o formulário de dentro é quem decidia. O teto padrão é o `sm` do MUI
    // (600px); o `md` é o nosso limite de desktop, largo demais aqui.
    <MuiDialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      fullWidth
      maxWidth={MAX_WIDTH_BY_WIDTH[width]}
    >
      <S.DialogSurface>
        <S.TitleRow>
          <S.DialogTitleText variant="h2" id={titleId}>
            {title}
          </S.DialogTitleText>

          <S.CloseButtonSlot>
            <IconButton label={CLOSE_LABEL} onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </S.CloseButtonSlot>
        </S.TitleRow>

        {children}
      </S.DialogSurface>
    </MuiDialog>
  );
}

Dialog.Body = DialogBody;
Dialog.Footer = DialogFooter;
Dialog.Message = DialogMessage;

export { Dialog };

import { useCallback, useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import type { PopoverOrigin } from '@mui/material/Popover';

import * as S from './styles';

const ANCHOR_ORIGIN: PopoverOrigin = { vertical: 'bottom', horizontal: 'right' };
const TRANSFORM_ORIGIN: PopoverOrigin = { vertical: 'top', horizontal: 'right' };

const HALF = 2;

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
  // Estado, e não `ref`: na primeira abertura o papel entra num commit depois
  // deste, e um `ref` não avisaria ninguém — a seta ficaria no fallback.
  const [paper, setPaper] = useState<HTMLDivElement | null>(null);

  const pointArrowAtTrigger = useCallback(() => {
    if (!paper?.offsetWidth || !anchorEl?.offsetWidth) return;

    const trigger = anchorEl.getBoundingClientRect();
    const panel = paper.getBoundingClientRect();
    // O retângulo vem em pixel da tela e a propriedade recebe pixel de CSS: os
    // dois divergem quando a página está sob escala, como na emulação de
    // dispositivo do navegador. O gatilho não é transformado, então a razão dele
    // converte um no outro.
    const pageScale = trigger.width / anchorEl.offsetWidth;
    const triggerCentre = trigger.left + trigger.width / HALF;
    // Medido a partir da borda **direita** do papel, que é a origem da
    // transformação de entrada: ela não se move enquanto o painel cresce, e a
    // esquerda sim. Pela esquerda a conta erraria durante a animação inteira.
    const fromRight = (panel.right - triggerCentre) / pageScale;

    paper.style.setProperty(S.ARROW_OFFSET_VARIABLE, `${paper.offsetWidth - fromRight}px`);
  }, [anchorEl, paper]);

  // Efeito de **layout**, e antes do primeiro quadro: o `Popover` posiciona o
  // papel nos efeitos dele, que rodam antes deste por serem de um filho. Medir
  // mais cedo pega o papel ainda em `left: 0`; medir depois da transição faz a
  // seta nascer no meio e saltar.
  useLayoutEffect(() => {
    if (!open || !paper) return;

    pointArrowAtTrigger();
  }, [open, paper, pointArrowAtTrigger]);

  // De novo depois da pintura, porque o `Popover` reposiciona o papel num efeito
  // passivo — que roda **depois** do de layout acima. Reabrindo o painel numa
  // largura diferente, a medida de cima usaria a posição da abertura anterior.
  useEffect(() => {
    if (!open || !paper) return;

    pointArrowAtTrigger();
    window.addEventListener('resize', pointArrowAtTrigger);

    return () => window.removeEventListener('resize', pointArrowAtTrigger);
  }, [open, paper, pointArrowAtTrigger]);

  return (
    <S.PopoverSurface
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={ANCHOR_ORIGIN}
      transformOrigin={TRANSFORM_ORIGIN}
      slotProps={{
        paper: { ref: setPaper, role: 'dialog', 'aria-label': label },
      }}
    >
      {children}
    </S.PopoverSurface>
  );
}

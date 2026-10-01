import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';

import { IconButton } from '@ds-root/components/IconButton';
import { ExpandLessIcon, ExpandMoreIcon } from '@ds-root/icons';

import { useCollapsedOverflow } from './hooks/useCollapsedOverflow';
import * as S from './styles';

export type ListCardDescriptionLabels = Readonly<{ expand: string; collapse: string }>;

export type ListCardDescriptionProps = Readonly<{
  children: ReactNode;
  /** Sem os rótulos a descrição aparece inteira, como no esqueleto de carregamento. */
  toggleLabels?: ListCardDescriptionLabels;
}>;

/** Recolhida em duas linhas; o botão só aparece quando o recorte esconde texto. */
export function ListCardDescription({ children, toggleLabels }: ListCardDescriptionProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const isCollapsed = toggleLabels !== undefined && !isExpanded;
  const overflows = useCollapsedOverflow(textRef, isCollapsed, children);

  const handleToggle = useCallback(() => setIsExpanded((expanded) => !expanded), []);

  const toggleLabel = useMemo(() => {
    if (isExpanded) return toggleLabels?.collapse;

    return toggleLabels?.expand;
  }, [isExpanded, toggleLabels]);

  return (
    <S.DescriptionRoot>
      <S.DescriptionText
        ref={textRef}
        component="div"
        variant="subtitle"
        color="inherit"
        isCollapsed={isCollapsed}
      >
        {children}
      </S.DescriptionText>

      {toggleLabel && overflows && (
        <S.DescriptionToggle>
          <IconButton label={toggleLabel} size="small" onClick={handleToggle}>
            {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </S.DescriptionToggle>
      )}
    </S.DescriptionRoot>
  );
}

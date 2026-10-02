import { useEffect, useState, type ReactNode, type RefObject } from 'react';

/**
 * Diz se o texto recolhido esconde alguma coisa. Mede só recolhido, que é quando
 * o corte existe, e mede de novo quando a largura muda, porque o mesmo texto
 * passa a caber ou não ao girar o celular.
 */
export function useCollapsedOverflow(
  textRef: RefObject<HTMLElement | null>,
  isCollapsed: boolean,
  content: ReactNode,
): boolean {
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (!element || !isCollapsed) return;

    const measure = () => setOverflows(element.scrollHeight > element.clientHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [textRef, isCollapsed, content]);

  return overflows;
}

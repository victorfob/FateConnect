import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { scrollToSection } from '@app/utils/scrollToSection';

/** Resolve o fragmento da URL sempre que ele muda — inclusive na primeira carga. */
export function useHashScroll(): void {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    scrollToSection(hash.slice(1));
  }, [hash]);
}

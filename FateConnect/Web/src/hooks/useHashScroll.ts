import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { scrollToSection } from '@app/utils/scrollToSection';

const HASH_MARK_LENGTH = 1;

/** Resolve o fragmento da URL sempre que ele muda — inclusive na primeira carga. */
export function useHashScroll(): void {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;

    return scrollToSection(hash.slice(HASH_MARK_LENGTH));
  }, [hash]);
}

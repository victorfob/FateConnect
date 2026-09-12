import { useMemo } from 'react';
import { useLocation } from 'react-router';

import { isKnownRoute, PAGE_METADATA } from '@app/routes/pageMetadata';
import { RoutePathEnum } from '@app/routes/paths';

/**
 * ⛔ Não renderiza nada na tela: o React 19 hasteia estas tags para o `<head>`.
 * O `index.html` mantém o par padrão, que é o que a primeira passada do
 * rastreador lê — a daqui vem antes dele no `<head>` e é a que vale.
 */
export function PageMetadata() {
  const { pathname } = useLocation();
  const metadata = useMemo(() => {
    if (isKnownRoute(pathname)) return PAGE_METADATA[pathname];
    return PAGE_METADATA[RoutePathEnum.LANDING];
  }, [pathname]);

  return (
    <>
      <title>{metadata.title}</title>
      {metadata.description && <meta name="description" content={metadata.description} />}
      {metadata.canonical && <link rel="canonical" href={metadata.canonical} />}
    </>
  );
}

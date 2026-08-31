import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

export type SearchQueryCodec<T> = Readonly<{
  fromParams: (params: URLSearchParams) => T;
  toParams: (value: T) => Record<string, string>;
}>;

export type SearchQueryResult<T> = Readonly<{
  value: T;
  replace: (next: T) => void;
}>;

/**
 * Guarda a busca da tela na barra de endereço, para o link levar junto o que a
 * pessoa escolheu. O `codec` precisa ser estável entre renders — declare-o fora
 * do componente, ou cada render remonta a leitura.
 */
export function useSearchQuery<T>(codec: SearchQueryCodec<T>): SearchQueryResult<T> {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = useMemo(() => codec.fromParams(searchParams), [codec, searchParams]);

  // `replace`: paginar e filtrar refazem a mesma tela, então o botão voltar do
  // navegador deve sair dela em vez de desfazer escolha por escolha.
  //
  // `preventScrollReset`: o `ScrollRestoration` do RootLayout leva ao topo a
  // cada navegação, e trocar de página é uma. Sem isto, clicar no controle de
  // paginação — que fica no rodapé da lista — tira a lista da vista.
  const replace = useCallback(
    (next: T) => setSearchParams(codec.toParams(next), { replace: true, preventScrollReset: true }),
    [codec, setSearchParams],
  );

  return { value, replace };
}

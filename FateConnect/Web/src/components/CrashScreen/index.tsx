import type { ReactNode } from 'react';

import { PageMessage } from '@design-system';

import * as C from './constants';
import * as S from './styles';

type CrashScreenProps = Readonly<{ children: ReactNode }>;

/**
 * A tela que substitui o que quebrou. Não conhece roteador: o boundary de
 * aplicação a renderiza fora do `RouterProvider`, onde nenhum hook de rota
 * funciona. Quem compõe decide a saída, que é o único ponto que difere.
 */
export function CrashScreen({ children }: CrashScreenProps) {
  return (
    <S.ErrorScreen>
      <PageMessage title={C.ERROR_TITLE} description={C.ERROR_DESCRIPTION}>
        {children}
      </PageMessage>
    </S.ErrorScreen>
  );
}

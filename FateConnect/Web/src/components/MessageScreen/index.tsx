import type { ReactNode } from 'react';
import { PageMessage } from '@design-system';

import * as S from './styles';

type MessageScreenProps = Readonly<{
  title: string;
  description: string;
  children?: ReactNode;
}>;

/**
 * ⛔ Não pode conhecer o roteador: o boundary de aplicação a renderiza fora do
 * `RouterProvider`, onde nenhum hook de rota funciona.
 */
export function MessageScreen({ title, description, children }: MessageScreenProps) {
  return (
    <S.ErrorScreen>
      <PageMessage title={title} description={description}>
        {children}
      </PageMessage>
    </S.ErrorScreen>
  );
}

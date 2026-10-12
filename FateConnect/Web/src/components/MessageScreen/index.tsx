import type { ReactNode } from 'react';
import { PageMessage, type FeedbackTone } from '@design-system';

import * as S from './styles';

type MessageScreenProps = Readonly<{
  title: string;
  description: string;
  tone: FeedbackTone;
  children?: ReactNode;
}>;

/**
 * ⛔ Não pode conhecer o roteador: o boundary de aplicação a renderiza fora do
 * `RouterProvider`, onde nenhum hook de rota funciona.
 */
export function MessageScreen({ title, description, tone, children }: MessageScreenProps) {
  return (
    <S.ErrorScreen>
      <PageMessage title={title} description={description} tone={tone}>
        {children}
      </PageMessage>
    </S.ErrorScreen>
  );
}

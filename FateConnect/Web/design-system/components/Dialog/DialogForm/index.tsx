import type { ReactNode, SubmitEventHandler } from 'react';

import * as S from './styles';

export type DialogFormProps = Readonly<{
  onSubmit: SubmitEventHandler<HTMLElement>;
  children: ReactNode;
}>;

/** A validação é do formulário da tela, não do navegador. */
export function DialogForm({ onSubmit, children }: DialogFormProps) {
  return (
    <S.FormRegion component="form" onSubmit={onSubmit} noValidate>
      {children}
    </S.FormRegion>
  );
}

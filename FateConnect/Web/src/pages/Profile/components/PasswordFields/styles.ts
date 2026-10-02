import type { InputHTMLAttributes } from 'react';
import { PolymorphicBox, styled } from '@design-system';

/** Sem usuário marcado, o gerenciador de senhas preenche o campo anterior com o login. */
export const AccountUsername = styled(PolymorphicBox)<
  Pick<InputHTMLAttributes<HTMLInputElement>, 'type' | 'autoComplete' | 'value' | 'readOnly'>
>({ display: 'none' });

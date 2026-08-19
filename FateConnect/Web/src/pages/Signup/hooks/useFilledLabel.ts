import { useFormContext, useWatch } from 'react-hook-form';

import type { SignupFormValues } from '../schema';

/** Campos que podem receber valor sem o usuário digitar. */
type ExternallyFilledField = Extract<
  keyof SignupFormValues,
  'birthDate' | 'zipCode' | 'street' | 'city'
>;

type FloatingLabelProps = Readonly<{ shrink?: true }>;

/**
 * Mantém o rótulo no alto quando o valor chega de fora — preenchimento por CEP
 * ou escolha no calendário.
 *
 * O campo é não controlado, que é o que preserva a posição do cursor sob a
 * máscara; em troca, o MUI não percebe sozinho que ele deixou de estar vazio e
 * desenharia o rótulo por cima do texto. Com o campo vazio nada é forçado, para
 * o rótulo continuar subindo ao receber o foco.
 */
export function useFilledLabel(name: ExternallyFilledField): FloatingLabelProps {
  const { control } = useFormContext<SignupFormValues>();
  const value = useWatch({ control, name });

  if (value) return { shrink: true };

  return {};
}

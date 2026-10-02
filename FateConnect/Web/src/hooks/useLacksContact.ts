import { useProfile } from '@app/hooks/useProfile';
import { hasContact } from '@app/utils/contact';

/** Só afirma a falta com o perfil em mãos: carregando, ninguém é barrado à toa. */
export function useLacksContact(): boolean {
  const { data: profile } = useProfile();

  return profile !== undefined && !hasContact(profile);
}

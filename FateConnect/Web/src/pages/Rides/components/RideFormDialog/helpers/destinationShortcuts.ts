import { CAMPUS_DESTINATION } from '../constants';

/** O que o destino sugere antes de a pessoa digitar: o bairro do perfil, se houver, e a Fatec. */
export function destinationShortcuts(neighborhood: string | null | undefined): string[] {
  if (!neighborhood || neighborhood === CAMPUS_DESTINATION) return [CAMPUS_DESTINATION];

  return [neighborhood, CAMPUS_DESTINATION];
}

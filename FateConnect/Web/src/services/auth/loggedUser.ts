import { tokenStorage } from './tokenStorage';
import { ProfileTypeEnum } from './types';

/** O payload do JWT é a parte do meio, separada por ponto. */
const PAYLOAD_INDEX = 1;
const BASE64_BLOCK = 4;
const ONLY_CHARACTER_INDEX = 0;
const NUL_BYTE = 0;

/**
 * `unique_name` e `role`, e não `name` e `ClaimTypes.Role`: o .NET traduz os
 * nomes longos ao escrever o token, e ler o longo devolveria `undefined` sem
 * erro nenhum.
 */
const NAME_CLAIM = 'unique_name';
const ROLE_CLAIM = 'role';

function decodePayload(token: string): unknown {
  const encoded = token.split('.')[PAYLOAD_INDEX];
  if (!encoded) return null;

  const base64 = encoded.replaceAll('-', '+').replaceAll('_', '/');
  const padding = (BASE64_BLOCK - (base64.length % BASE64_BLOCK)) % BASE64_BLOCK;

  // `atob` devolve bytes, não texto: sem o `TextDecoder` um nome acentuado
  // volta corrompido.
  const bytes = Uint8Array.from(
    atob(base64.padEnd(base64.length + padding, '=')),
    (character) => character.codePointAt(ONLY_CHARACTER_INDEX) ?? NUL_BYTE,
  );

  return JSON.parse(new TextDecoder().decode(bytes));
}

/** O payload já decodificado, antes de saber quais chaves ele traz. */
function isClaimBag(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readStringClaim(claim: string): string | null {
  const token = tokenStorage.getToken();
  if (!token) return null;

  try {
    const payload = decodePayload(token);

    if (!isClaimBag(payload)) return null;

    const value = payload[claim];
    if (typeof value !== 'string') return null;

    return value;
  } catch {
    return null;
  }
}

/**
 * O nome de quem está logado. Vem do token porque o login não guarda mais nada
 * além dele — token e nome guardados à parte podiam discordar.
 */
export function loggedUserName(): string | null {
  return readStringClaim(NAME_CLAIM);
}

/**
 * ⛔ Conveniência de interface, não segurança: o token é editável por quem o
 * guarda. Quem barra de verdade é a API, que confere a assinatura.
 */
export function loggedUserIsAdministrator(): boolean {
  return readStringClaim(ROLE_CLAIM) === ProfileTypeEnum.ADMINISTRATOR;
}

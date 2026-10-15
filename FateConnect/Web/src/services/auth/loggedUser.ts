import { base64UrlToBytes } from '@app/utils/base64Url';

import { tokenStorage } from './tokenStorage';
import { ProfileTypeEnum } from './types';

/** O payload do JWT é a parte do meio, separada por ponto. */
const PAYLOAD_INDEX = 1;

/**
 * `unique_name`, `role` e `nameid`, e não os nomes do `ClaimTypes`: o .NET
 * traduz os nomes longos ao escrever o token, e ler o longo devolveria
 * `undefined` sem erro nenhum.
 */
const NAME_CLAIM = 'unique_name';
const ROLE_CLAIM = 'role';
const ID_CLAIM = 'nameid';

const DECIMAL = 10;

function decodePayload(token: string): unknown {
  const encoded = token.split('.')[PAYLOAD_INDEX];
  if (!encoded) return null;

  // Sem o `TextDecoder` um nome acentuado volta corrompido.
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(encoded)));
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

export function loggedUserId(): number | null {
  const claim = readStringClaim(ID_CLAIM);
  if (!claim) return null;

  const id = Number.parseInt(claim, DECIMAL);
  if (!Number.isInteger(id)) return null;

  return id;
}

/**
 * ⛔ Conveniência de interface, não segurança: o token é editável por quem o
 * guarda. Quem barra de verdade é a API, que confere a assinatura.
 */
export function loggedUserIsAdministrator(): boolean {
  return readStringClaim(ROLE_CLAIM) === ProfileTypeEnum.ADMINISTRATOR;
}
